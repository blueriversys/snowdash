import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react'; // Import icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address first.' });
      return;
    }
    
    // `${import.meta.env.VITE_API_URL}/submit-lead`

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_API_URL}/login`, // Where they go after clicking the email link
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">SnowDash Admin</h2>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="admin@snowdash.com"
              required 
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••"
              required 
            />
            {/* 1. Eye Icon Toggle */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        {/* 2. Password Retrieval (Reset) Mechanism */}
        <div className="mt-6 text-center">
          <button 
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:underline flex items-center justify-center mx-auto gap-1"
          >
            <Mail size={14} /> Forgot password? Send reset link
          </button>
        </div>
      </div>
    </div>
  );
}