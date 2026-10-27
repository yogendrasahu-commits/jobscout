import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jobradar_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Corrupt user data in localStorage, resetting session:', e);
      try { localStorage.removeItem('jobradar_user'); } catch {}
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('jobradar_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('jobradar_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const saveAuthSession = (tokenVal, userVal) => {
    setToken(tokenVal);
    setUser(userVal);
    localStorage.setItem('jobradar_token', tokenVal);
    localStorage.setItem('jobradar_user', JSON.stringify(userVal));
  };

  // Check if phone number is already registered
  const checkPhone = async (phone) => {
    try {
      const res = await fetch(`/api/auth/check-phone/${phone}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Check phone error:', e);
    }
    return { exists: false };
  };

  // Send OTP
  const sendOtp = async (phone, purpose = 'login') => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  };

  // Verify OTP
  const verifyOtp = async (phone, otp) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP');
    return data;
  };

  // Login with Phone & OTP
  const loginWithPhoneOtp = async (phone, otp) => {
    const res = await fetch('/api/auth/login-phone-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login with OTP failed');

    if (data.isNewUser) {
      return { isNewUser: true, phone: data.phone };
    }

    saveAuthSession(data.token, data.user);
    return data.user;
  };

  // Login with Phone & Password
  const loginWithPhonePassword = async (phone, password) => {
    const res = await fetch('/api/auth/login-phone-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    saveAuthSession(data.token, data.user);
    return data.user;
  };

  // Register with Phone, Verified OTP & Password
  const registerWithPhone = async (payload) => {
    const res = await fetch('/api/auth/register-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    saveAuthSession(data.token, data.user);
    return data.user;
  };

  // Email Login
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    saveAuthSession(data.token, data.user);
    return data.user;
  };

  // Email Register
  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    saveAuthSession(data.token, data.user);
    return data.user;
  };


  const updateLocation = async (lat, lng, address) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lat, lng, address })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('jobradar_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Update location error:', err);
    }
  };

  const updateProfile = async (updates) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      if (data.token && data.user) {
        saveAuthSession(data.token, data.user);
      } else if (data.user) {
        setUser(data.user);
        localStorage.setItem('jobradar_user', JSON.stringify(data.user));
      }
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jobradar_token');
    localStorage.removeItem('jobradar_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        loginWithPhoneOtp,
        loginWithPhonePassword,
        registerWithPhone,
        checkPhone,
        updateLocation,
        updateProfile,
        logout,
        isEmployer: user?.role === 'emp',
        isSeeker: user?.role === 'seeker'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
