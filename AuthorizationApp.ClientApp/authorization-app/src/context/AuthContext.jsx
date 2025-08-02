import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  
  const backendUrl = "https://authorization-app-backend-byfmc6dmgrgadmd0.polandcentral-01.azurewebsites.net";

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${backendUrl}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401 || response.status === 403) {
      logout();
      return response;
    }

    return response;
  }, [token]);

  const fetchUserDetails = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await authFetch('/api/Auth/me');
      
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      logout();
    }
  }, [authFetch, token]);

  useEffect(() => {
    setIsLoggedIn(!!token);
    if (token) {
      fetchUserDetails();
    } else {
      setUser(null);
    }
  }, [token, fetchUserDetails]);

  const login = async (email, password) => {
    try {
      const response = await authFetch('/api/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await authFetch('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Registration successful! Please login.' };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'An error occurred during registration.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn, 
      token, 
      login, 
      register, 
      logout, 
      authFetch 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);