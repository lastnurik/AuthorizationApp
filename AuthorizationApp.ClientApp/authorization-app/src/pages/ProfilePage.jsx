import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';

function ProfilePage() {
  const { user, isLoggedIn, logout, token, backendUrl, fetchUserDetails } = useAuth();
  const navigate = useNavigate();

  // State for User Info Update Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userInfoMessage, setUserInfoMessage] = useState(null);
  const [userInfoMessageType, setUserInfoMessageType] = useState('');
  const [userInfoLoading, setUserInfoLoading] = useState(false);

  // State for Password Update Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login if not authenticated
    }
    // Initialize form fields with current user data when user object is available
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isLoggedIn, navigate, user]);

  // Handle User Info Update
  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    setUserInfoMessage(null);
    setUserInfoMessageType('');
    setUserInfoLoading(true);

    if (!name || !email) {
      setUserInfoMessage('Name and Email are required.');
      setUserInfoMessageType('danger');
      setUserInfoLoading(false);
      return;
    }

    if (!user || !user.id) {
      setUserInfoMessage('User ID not found. Cannot update profile.');
      setUserInfoMessageType('danger');
      setUserInfoLoading(false);
      return;
    }

    try {
      // Corrected endpoint and method for updating user info
      const response = await fetch(`${backendUrl}/api/Auth/updateProfileInfo`, {
        method: 'POST', // Changed to POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.id, // User ID from context
          name: name,
          email: email,
        }),
      });

      if (response.ok) {
        setUserInfoMessage('Profile updated successfully!');
        setUserInfoMessageType('success');
        await fetchUserDetails(token); // Refresh user data in AuthContext
      } else if (response.status === 401) {
        setUserInfoMessage('Unauthorized. Please login again.');
        setUserInfoMessageType('danger');
        logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        setUserInfoMessage(errorData.message || 'Failed to update profile.');
        setUserInfoMessageType('danger');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      setUserInfoMessage('An error occurred while updating profile.');
      setUserInfoMessageType('danger');
    } finally {
      setUserInfoLoading(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordMessageType('');
    setPasswordLoading(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage('All password fields are required.');
      setPasswordMessageType('danger');
      setPasswordLoading(false);
      return;
    }

    if (!user || !user.id) {
      setPasswordMessage('User ID not found. Cannot update password.');
      setPasswordMessageType('danger');
      setPasswordLoading(false);
      return;
    }

    try {
      // Corrected endpoint and method for updating password
      const response = await fetch(`${backendUrl}/api/Auth/updatePassword`, {
        method: 'POST', // Changed to POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id, // User ID from context
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmNewPassword: confirmNewPassword,
        }),
      });

      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setPasswordMessageType('success');
        // Clear password fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else if (response.status === 401) {
        setPasswordMessage('Unauthorized. Please login again.');
        setPasswordMessageType('danger');
        logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        setPasswordMessage(errorData.message || 'Failed to update password.');
        setPasswordMessageType('danger');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage('An error occurred while updating password.');
      setPasswordMessageType('danger');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-4 shadow-sm">
        <h2 className="mb-4">Profile Page</h2>
        <Message type="info" message="Loading user profile..." />
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card p-4 shadow-sm">
          <h2 className="mb-4 text-center">User Profile</h2>

          {/* Display Current User Info */}
          <div className="mb-4">
            <h4 className="mb-3">Current Information</h4>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p>
              <strong>Status:</strong>{' '}
              {user.isBlocked ? (
                <span className="badge bg-danger">Blocked</span>
              ) : (
                <span className="badge bg-success">Active</span>
              )}
            </p>
            {user.lastLogin && (
              <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</p>
            )}
          </div>

          <hr className="my-4" />

          {/* Update User Info Form */}
          <h4 className="mb-3">Update Profile Information</h4>
          <Message type={userInfoMessageType} message={userInfoMessage} />
          <form onSubmit={handleUpdateUserInfo} className="mb-4">
            <div className="mb-3">
              <label htmlFor="updateNameInput" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="updateNameInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={userInfoLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="updateEmailInput" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="updateEmailInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={userInfoLoading}
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary" disabled={userInfoLoading}>
                {userInfoLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>

          <hr className="my-4" />

          {/* Update Password Form */}
          <h4 className="mb-3">Change Password</h4>
          <Message type={passwordMessageType} message={passwordMessage} />
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-3">
              <label htmlFor="currentPasswordInput" className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                id="currentPasswordInput"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPasswordInput" className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPasswordInput"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmNewPasswordInput" className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmNewPasswordInput"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-warning" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>

          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-secondary" onClick={() => navigate('/main')}>
              Back to Main Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
