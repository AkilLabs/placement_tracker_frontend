import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SignupData } from '../../types';
import Button from '../Button';
import FormField from '../FormField';
import { User, Lock, Mail } from 'lucide-react';

const Signup: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { signup, authState } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    await signup(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Create Account</h2>
      {authState.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {authState.error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <FormField
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            icon={<User className="w-5 h-5 text-gray-400" />}
          />
        </div>
        <div className="mb-4">
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            icon={<Mail className="w-5 h-5 text-gray-400" />}
          />
        </div>
        <div className="mb-4">
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
        <div className="mb-6">
          <FormField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
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
          {authState.isLoading ? 'Creating Account...' : 'Sign up'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <p>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
            type="button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;