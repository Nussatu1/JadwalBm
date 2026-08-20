import React, { createContext, useContext, useState, useEffect } from 'react';
import { sha256 } from '../utils/crypto';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // role: 'tim' | 'admin'
  const [role, setRole] = useState(() => {
    return localStorage.getItem('bakid_role') || 'tim';
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('bakid_auth_token') || '';
  });

  const [teamMemberName, setTeamMemberName] = useState(() => {
    return localStorage.getItem('bakid_team_member_name') || '';
  });

  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('bakid_role', role);
    if (authToken) {
      localStorage.setItem('bakid_auth_token', authToken);
    } else {
      localStorage.removeItem('bakid_auth_token');
    }
  }, [role, authToken]);

  useEffect(() => {
    if (teamMemberName) {
      localStorage.setItem('bakid_team_member_name', teamMemberName);
    } else {
      localStorage.removeItem('bakid_team_member_name');
    }
  }, [teamMemberName]);

  /**
   * Login Admin dengan input password (akan di-hash SHA-256)
   */
  const loginAdmin = async (plainPassword) => {
    setAuthLoading(true);
    try {
      const passwordHash = await sha256(plainPassword.trim());
      const response = await api.validatePassword(passwordHash);

      if (response && response.success) {
        setRole('admin');
        const token = response.data?.token || 'ADMIN_AUTH_TOKEN';
        setAuthToken(token);
        return { success: true, message: response.message || 'Login berhasil' };
      } else {
        return { success: false, message: response?.message || 'Password salah' };
      }
    } catch (err) {
      return { success: false, message: 'Gagal menghubungi server: ' + err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Logout kembali ke viewer mode (Tim)
   */
  const logout = () => {
    setRole('tim');
    setAuthToken('');
  };

  /**
   * Set nama anggota tim untuk personalisasi filter "Acara Saya"
   */
  const setPersonalName = (name) => {
    setTeamMemberName(name);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdmin: role === 'admin',
        authToken,
        teamMemberName,
        authLoading,
        loginAdmin,
        logout,
        setPersonalName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
