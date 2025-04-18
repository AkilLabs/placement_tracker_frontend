import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginData } from '../../types';
import Button from '../Button';
import FormField from '../FormField';
import { User, Lock } from 'lucide-react';

const Login: React.FC<{ onSwitchToSignup: () => void }> = ({ onSwitchToSignup }) => {
  const { login, authState } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Login</h2>
      {authState.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {authState.error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
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
          className="w-full"
          disabled={authState.isLoading}
        >
          {authState.isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <p>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-800 font-medium"
            type="button"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;