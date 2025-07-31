import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const prodUrl = "https://authorization-app-backend-byfmc6dmgrgadmd0.polandcentral-01.azurewebsites.net";
  const testUrl = "https://localhost:7133";
  const backendUrl = prodUrl;

  useEffect(() => {
    setIsLoggedIn(!!token);
    if (token) {
      fetchUserDetails(token);
    } else {
      setUser(null);
    }
  }, [token]);

  const fetchUserDetails = async (authToken) => {
    try {
      const response = await fetch(`${backendUrl}/api/Auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error("Failed to fetch user details:", response.statusText);
        logout();
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${backendUrl}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        await fetchUserDetails(data.token); // Ensure user details are fetched immediately after login
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await fetch(`${backendUrl}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Registration successful! Please login.' };
      } else {
        return { success: false, message: data.message || 'Registration failed.' };
      }
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
    <AuthContext.Provider value={{ user, isLoggedIn, token, login, register, logout, backendUrl, fetchUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
