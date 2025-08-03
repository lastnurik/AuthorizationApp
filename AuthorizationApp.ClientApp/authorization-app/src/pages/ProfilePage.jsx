import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';

function ProfilePage() {
  const { user, isLoggedIn, logout, authFetch, fetchUserDetails } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userInfoMessage, setUserInfoMessage] = useState(null);
  const [userInfoMessageType, setUserInfoMessageType] = useState('');
  const [userInfoLoading, setUserInfoLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isLoggedIn, navigate, user]);

  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    setUserInfoMessage(null);
    setUserInfoLoading(true);

    try {
      const response = await authFetch('/api/Auth/updateProfileInfo', {
        method: 'POST',
        body: JSON.stringify({ id: user.id, name, email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      await fetchUserDetails();

      setUserInfoMessage('Profile updated successfully!');
      setUserInfoMessageType('success');
    } catch (error) {
      setUserInfoMessage(error.message);
      setUserInfoMessageType('danger');
    } finally {
      setUserInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordLoading(true);

    try {
      if (newPassword !== confirmNewPassword) {
        throw new Error("Passwords don't match");
      }

      const response = await authFetch('/api/Auth/updatePassword', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user.id, 
          currentPassword, 
          newPassword, 
          confirmNewPassword 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      setPasswordMessage('Password updated successfully!');
      setPasswordMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setPasswordMessage(error.message);
      setPasswordMessageType('danger');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-4 shadow-sm mt-4">
        <h2 className="mb-4">Profile</h2>
        <Message type="info" message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-8 col-lg-6">
        <div className="card p-4 shadow-sm">
          <h2 className="mb-4 text-center">User Profile</h2>

          <div className="mb-4">
            <h4>Account Information</h4>
            <div className="mb-2"><strong>ID:</strong> {user.id}</div>
            <div className="mb-2"><strong>Name:</strong> {user.name}</div>
            <div className="mb-2"><strong>Email:</strong> {user.email}</div>
            <div className="mb-2">
              <strong>Status:</strong> {' '}
              {user.isBlocked ? (
                <span className="badge bg-danger">Blocked</span>
              ) : (
                <span className="badge bg-success">Active</span>
              )}
            </div>
            {user.lastLogin && (
              <div><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</div>
            )}
          </div>

          <hr className="my-4" />

          <h4 className="mb-3">Update Profile</h4>
          <Message type={userInfoMessageType} message={userInfoMessage} />
          <form onSubmit={handleUpdateUserInfo} className="mb-4">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={userInfoLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={userInfoLoading}
              />
            </div>
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={userInfoLoading}
              >
                {userInfoLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : 'Update Profile'}
              </button>
            </div>
          </form>

          <hr className="my-4" />

          <h4 className="mb-3">Change Password</h4>
          <Message type={passwordMessageType} message={passwordMessage} />
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-warning"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Changing...
                  </>
                ) : 'Change Password'}
              </button>
            </div>
          </form>

          <div className="d-grid mt-4">
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/main')}
            >
              Back to Main Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;