import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginData } from '../../types';
import Button from '../Button';
import FormField from '../FormField';
import { User, Lock, Shield } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { login, authState } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    
    try {
      await login(formData);
      
      // Check if user is admin after login (we'll use setTimeout to make sure the state updates)
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.role !== 'admin') {
          // If not an admin, show error and logout
          setAdminError('Access denied. Only administrators can login here.');
          localStorage.removeItem('user');
          window.location.reload(); // Force reload to clear auth state
        }
      }, 100);
    } catch (error) {
      console.error('Admin login error', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border-t-4 border-red-600">
      <div className="flex justify-center mb-4">
        <Shield className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-center text-red-800 mb-6">Administrator Login</h2>
      {(authState.error || adminError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {adminError || authState.error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <FormField
            label="Admin Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter admin email"
            required
            icon={<User className="w-5 h-5 text-gray-400" />}
          />
        </div>
        <div className="mb-6">
          <FormField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            icon={<Lock className="w-5 h-5 text-gray-400" />}
          />
        </div>
        <Button
          variant="primary"
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={authState.isLoading}
        >
          {authState.isLoading ? 'Authenticating...' : 'Admin Login'}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          This page is restricted to administrative users only.
        </p>
        <a 
          href="/" 
          className="mt-2 block text-blue-600 hover:text-blue-800 font-medium"
        >
          Return to main login
        </a>
      </div>
    </div>
  );
};

export default AdminLogin;