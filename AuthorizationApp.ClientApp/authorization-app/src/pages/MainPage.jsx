import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';

function MainPage() {
  const { isLoggedIn, logout, user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Sorting
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10); // Fixed page size based on backend expectations
  const [sortBy, setSortBy] = useState('name');
  const [sortDescending, setSortDescending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBlockedFilter, setIsBlockedFilter] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        pageNumber,
        pageSize,
        sortBy,
        sortDescending,
        ...(searchTerm && { searchTerm }),
        ...(isBlockedFilter !== null && { isBlockedFilter })
      });

      const response = await authFetch(`/api/Users?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      const filteredUsers = data.items.filter(u => u.id !== user?.id);
      
      setUsers(filteredUsers);
      setTotalPages(data.totalPages);
      setTotalUsers(user ? data.totalCount - 1 : data.totalCount);
      setSelectedUserIds(new Set());
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [
    pageNumber, 
    pageSize, 
    sortBy, 
    sortDescending, 
    searchTerm, 
    isBlockedFilter, 
    isLoggedIn, 
    authFetch, 
    user,
    navigate
  ]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [isLoggedIn, navigate, fetchUsers]);

  const handleSelectAll = (e) => {
    setSelectedUserIds(e.target.checked ? new Set(users.map(u => u.id)) : new Set());
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  };

  const performAction = async (action) => {
    if (selectedUserIds.size === 0) {
      setMessage('Please select at least one user');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const endpointMap = {
        block: '/api/Users/block',
        unblock: '/api/Users/unblock',
        delete: '/api/Users/delete'
      };

      const methodMap = {
        block: 'POST',
        unblock: 'POST',
        delete: 'DELETE' // Updated to match backend
      };

      const userIdsArray = Array.from(selectedUserIds);
      
      const response = await authFetch(endpointMap[action], {
        method: methodMap[action],
        body: JSON.stringify({ userIds: userIdsArray })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} users`);
      }

      setMessage(`Users ${action}ed successfully!`);
      setMessageType('success');
      fetchUsers();
    } catch (err) {
      setMessage(err.message);
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDescending(prev => !prev);
    } else {
      setSortBy(column);
      setSortDescending(false);
    }
    setPageNumber(1);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return 'fas fa-sort';
    return sortDescending ? 'fas fa-sort-down' : 'fas fa-sort-up';
  };

  const formatTimeElapsed = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const lastLogin = new Date(timestamp);
    const now = new Date();
    const diffMs = now - lastLogin;
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (!isLoggedIn) return null;

  return (
    <div className="card p-4 shadow-sm mt-4">
      <h2 className="mb-4">User Management</h2>

      <Message type={messageType} message={message} />
      {error && <Message type="danger" message={error} />}

      {loading && (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div className="btn-group mb-2 mb-md-0">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => performAction('block')}
            disabled={selectedUserIds.size === 0 || loading}
          >
            <i className="fas fa-lock me-2"></i> Block
          </button>
          <button
            className="btn btn-info d-flex align-items-center"
            onClick={() => performAction('unblock')}
            disabled={selectedUserIds.size === 0 || loading}
          >
            <i className="fas fa-unlock-alt me-2"></i> Unblock
          </button>
          <button
            className="btn btn-danger d-flex align-items-center"
            onClick={() => performAction('delete')}
            disabled={selectedUserIds.size === 0 || loading}
          >
            <i className="fas fa-trash me-2"></i> Delete
          </button>
        </div>

        <div className="d-flex flex-column flex-sm-row w-100 w-md-auto gap-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button" 
              onClick={() => {
                setPageNumber(1);
                fetchUsers();
              }}
            >
              <i className="fas fa-search" />
            </button>
          </div>
          <select
            className="form-select"
            value={isBlockedFilter ?? ''}
            onChange={(e) => setIsBlockedFilter(e.target.value ? JSON.parse(e.target.value) : null)}
          >
            <option value="">All Users</option>
            <option value="true">Blocked</option>
            <option value="false">Unblocked</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle" style={{ borderWidth: '2px' }}>
          <thead className="table-light">
            <tr>
              <th className="text-center" style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={handleSelectAll}
                  checked={users.length > 0 && selectedUserIds.size === users.length}
                />
              </th>
              <th 
                style={{ cursor: 'pointer', minWidth: '150px' }}
                onClick={() => handleSort('name')}
              >
                Name <i className={`${getSortIcon('name')} ms-2`} />
              </th>
              <th 
                style={{ cursor: 'pointer', minWidth: '200px' }}
                onClick={() => handleSort('email')}
              >
                Email <i className={`${getSortIcon('email')} ms-2`} />
              </th>
              <th 
                style={{ cursor: 'pointer', minWidth: '150px' }}
                onClick={() => handleSort('lastLogin')}
              >
                Last Seen <i className={`${getSortIcon('lastLogin')} ms-2`} />
              </th>
              <th className="text-center" style={{ minWidth: '100px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="text-center py-4">No users found</td>
              </tr>
            )}
            {users.map(user => (
              <tr key={user.id} style={{ height: '60px' }}>
                <td className="text-center align-middle">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="align-middle">{user.name || 'N/A'}</td>
                <td className="align-middle">{user.email}</td>
                <td 
                  className="align-middle"
                  title={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : undefined}
                >
                  {formatTimeElapsed(user.lastLogin)}
                </td>
                <td className="text-center align-middle">
                  {user.isBlocked ? (
                    <span className="badge bg-danger">Blocked</span>
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">
          Showing {users.length} of {totalUsers} users
        </div>
        
        {totalPages > 1 && (
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1 || loading}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li 
                  key={i} 
                  className={`page-item ${pageNumber === i + 1 ? 'active' : ''}`}
                >
                  <button 
                    className="page-link" 
                    onClick={() => setPageNumber(i + 1)}
                    disabled={loading}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${pageNumber === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
                  disabled={pageNumber === totalPages || loading}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
        
        <div className="text-muted">
          Page {pageNumber} of {totalPages === 0 ? 1 : totalPages}
        </div>
      </div>
    </div>
  );
}

export default MainPage;