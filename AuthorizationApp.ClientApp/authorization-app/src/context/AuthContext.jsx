import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context to hold our authentication state and functions.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State variables for authentication.
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Constants for API URLs.
  const prodUrl = "https://authorization-app-backend-byfmc6dmgrgadmd0.polandcentral-01.azurewebsites.net";
  const testUrl = "https://localhost:7133";
  const backendUrl = prodUrl;

  // Function to handle logout, including clearing state and local storage.
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  /**
   * Centralized API client to handle all protected requests.
   * This is the key change. It automatically adds the token and
   * handles unauthorized/forbidden responses.
   * @param {string} url - The URL to fetch.
   * @param {object} options - Fetch options (method, body, etc.).
   * @returns {Promise<object>} The JSON response data.
   */
  const apiClient = async (url, options = {}) => {
    // Merge the provided headers with our default headers.
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      // Automatically add the Authorization header if a token exists.
      'Authorization': `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized or Forbidden access. Redirecting to login.');
        // Call the logout function to clear the token and redirect.
        logout();
        // Throw an error to stop further processing in the calling function.
        throw new Error('Unauthorized');
      }

      // Check if the response was successful in general.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API call failed with status: ${response.status}`);
      }

      // Return the JSON data from the response.
      return await response.json();

    } catch (error) {
      // We re-throw the error so that the calling function (e.g., fetchUserDetails)
      // can handle it if needed.
      throw error;
    }
  };

  // Effect hook to update login status and fetch user details when the token changes.
  useEffect(() => {
    setIsLoggedIn(!!token);
    if (token) {
      // Pass the new apiClient to fetch user details.
      fetchUserDetails();
    } else {
      setUser(null);
    }
  }, [token]);

  /**
   * Fetches user details from the protected endpoint.
   * Now uses the centralized apiClient for consistency and error handling.
   */
  const fetchUserDetails = async () => {
    try {
      const userData = await apiClient(`${backendUrl}/api/Auth/me`, {
        method: 'GET',
      });
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user details. Logout has been triggered by the apiClient.", error);
      // The logout function is already called by apiClient, so no need to call it again.
    }
  };

  // Login function, which uses a public endpoint and does not need the apiClient's error handling.
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
        // The useEffect hook will now trigger fetchUserDetails after the token is set.
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  // Registration function, also for a public endpoint.
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

  // Provide all necessary state and functions to the child components.
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, token, login, register, logout, backendUrl, fetchUserDetails, apiClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
