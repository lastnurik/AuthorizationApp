import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const { token, backendUrl, isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Sorting States
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const [sortDescending, setSortDescending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBlockedFilter, setIsBlockedFilter] = useState(null); // null: all, true: blocked, false: unblocked
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async () => {
    // This check is the first line of defense within the fetch logic.
    // If isLoggedIn is false, it means the AuthContext has already determined
    // the user is not authenticated, so we redirect immediately.
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setMessageType('');

    try {
      const queryParams = new URLSearchParams({
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDescending: sortDescending,
      });

      if (searchTerm) {
        queryParams.append('searchTerm', searchTerm);
      }
      if (isBlockedFilter !== null) {
        queryParams.append('isBlockedFilter', isBlockedFilter);
      }

      const response = await fetch(`${backendUrl}/api/Users?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched paginated user data:", data);

        if (data && Array.isArray(data.items) && typeof data.totalPages === 'number' && typeof data.totalCount === 'number') {
            const filteredUsers = data.items.filter(u => user && u.id !== user.id);
            setUsers(filteredUsers);
            setTotalPages(data.totalPages);
            setTotalUsers(user ? data.totalCount - 1 : data.totalCount);
            setSelectedUserIds(new Set());
        } else {
            setError('Received unexpected data structure from backend. Expected PaginatedResult.');
            console.error("Unexpected backend data structure:", data);
            setUsers([]);
            setTotalPages(1);
            setTotalUsers(0);
        }
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('An error occurred while fetching users. Please check your browser console for more details.');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, sortBy, sortDescending, searchTerm, isBlockedFilter, isLoggedIn, token, backendUrl, navigate, logout, user]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchUsers();
    }
  }, [isLoggedIn, navigate, fetchUsers, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prevUsers => [...prevUsers]);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked && Array.isArray(users)) {
      const allUserIds = new Set(users.map(user => user.id));
      setSelectedUserIds(allUserIds);
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds(prevSelected => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  };

  const performAction = async (actionType) => {
    if (selectedUserIds.size === 0) {
      setMessage('Please select at least one user.');
      setMessageType('danger');
      return;
    }

    setMessage(null);
    setMessageType('');
    setLoading(true);

    const userIdsArray = Array.from(selectedUserIds);
    let endpoint = '';
    let successMessage = '';
    let errorMessage = '';

    switch (actionType) {
      case 'block':
        endpoint = `${backendUrl}/api/Users/block`;
        successMessage = 'Selected users blocked successfully!';
        errorMessage = 'Failed to block users.';
        break;
      case 'unblock':
        endpoint = `${backendUrl}/api/Users/unblock`;
        successMessage = 'Selected users unblocked successfully!';
        errorMessage = 'Failed to unblock users.';
        break;
      case 'delete':
        endpoint = `${backendUrl}/api/Users/delete`;
        successMessage = 'Selected users deleted successfully!';
        errorMessage = 'Failed to delete users.';
        break;
      default:
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: userIdsArray }),
      });

      if (response.ok) {
        setMessage(successMessage);
        setMessageType('success');
        fetchUsers();
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || errorMessage);
        setMessageType('danger');
      }
    } catch (err) {
      console.error(`Error during ${actionType} action:`, err);
      setMessage(`An error occurred during the ${actionType} operation.`);
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(column);
      setSortDescending(false);
    }
    setPageNumber(1);
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortDescending ? 'fas fa-sort-down' : 'fas fa-sort-up';
    }
    return 'fas fa-sort';
  };

  const formatTimeElapsed = (timestamp) => {
    if (!timestamp) return 'Never';
    const lastLoginDate = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - lastLoginDate) / 1000);

    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''} ago`;
    } else {
      const remainingHours = hours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''} ago`;
    }
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="mb-4">User Management</h2>

      <Message type={messageType} message={message} />
      {error && <Message type="danger" message={error} />}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div className="btn-group mb-2 mb-md-0" role="group">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => performAction('block')}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Block Selected Users"
            disabled={selectedUserIds.size === 0 || loading}
          >
            <i className="fas fa-lock me-2"></i> Block
          </button>
          <button
            className="btn btn-info d-flex align-items-center"
            onClick={() => performAction('unblock')}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Unblock Selected Users"
            disabled={selectedUserIds.size === 0 || loading}
          >
            <i className="fas fa-unlock-alt me-2"></i> Unblock
          </button>
          <button
            className="btn btn-danger d-flex align-items-center"
            onClick={() => performAction('delete')}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Delete Selected Users"
            disabled={selectedUserIds.size === 0 || loading}
          >
            <i className="fas fa-trash me-2"></i> Delete
          </button>
        </div>

        <div className="d-flex flex-column flex-sm-row w-100 w-md-auto">
          <div className="input-group me-sm-2 mb-2 mb-sm-0">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setPageNumber(1);
                  fetchUsers();
                }
              }}
            />
            <button className="btn btn-outline-secondary" type="button" onClick={() => {
              setPageNumber(1);
              fetchUsers();
            }}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          <select
            className="form-select"
            value={isBlockedFilter === null ? '' : isBlockedFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setIsBlockedFilter(value === '' ? null : value === 'true');
              setPageNumber(1);
            }}
          >
            <option value="">All Users</option>
            <option value="true">Blocked Users</option>
            <option value="false">Unblocked Users</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col" className="text-center">
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={handleSelectAll}
                  checked={Array.isArray(users) && users.length > 0 && selectedUserIds.size === users.length}
                />
              </th>
              <th scope="col" onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Name <i className={getSortIcon('name')}></i>
              </th>
              <th scope="col" onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                Email <i className={getSortIcon('email')}></i>
              </th>
              <th scope="col" onClick={() => handleSort('lastLogin')} style={{ cursor: 'pointer' }}>
                Last seen <i className={getSortIcon('lastLogin')}></i>
              </th>
              <th scope="col" className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="text-center py-4">No users found.</td>
              </tr>
            )}
            {Array.isArray(users) && users.map((user) => (
              <tr key={user?.id || `user-${Math.random()}`}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedUserIds.has(user?.id)}
                    onChange={() => handleSelectUser(user?.id)}
                    disabled={!user?.id}
                  />
                </td>
                <td>
                  <div>{user?.name || 'N/A'}</div>
                </td>
                <td>{user?.email || 'N/A'}</td>
                <td
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                >
                  {formatTimeElapsed(user?.lastLogin)}
                  <div className="last-seen-chart-placeholder" style={{ width: '80px', height: '20px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '5px' }}></div>
                </td>
                <td className="text-center">
                  {user?.isBlocked !== undefined ? (
                    user.isBlocked ? (
                      <span className="badge bg-danger" data-bs-toggle="tooltip" data-bs-placement="top" title="Blocked">Blocked</span>
                    ) : (
                      <span className="badge bg-success" data-bs-toggle="tooltip" data-bs-placement="top" title="Active">Active</span>
                    )
                  ) : (
                    <span className="badge bg-secondary">Unknown</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav aria-label="Page navigation" className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPageNumber(prev => Math.max(1, prev - 1))} disabled={pageNumber === 1 || loading}>Previous</button>
          </li>
          {Array.isArray(users) && [...Array(totalPages)].map((_, index) => (
            <li key={index} className={`page-item ${pageNumber === index + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPageNumber(index + 1)} disabled={loading || totalPages === 0}>{index + 1}</button>
            </li>
          ))}
          <li className={`page-item ${pageNumber === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))} disabled={pageNumber === totalPages || loading || totalPages === 0}>Next</button>
          </li>
        </ul>
        <div className="text-center text-muted">
          Showing {Array.isArray(users) ? users.length : 0} of {totalUsers} users. Page {pageNumber} of {totalPages === 0 ? 1 : totalPages}.
        </div>
      </nav>
    </div>
  );
}

export default MainPage;
