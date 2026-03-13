'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send registration request
      // Note: We send 'USER' role, but the Backend forces this anyway for security.
      const response = await api.post('/auth/register', {
        email: formData.email,
        passwordHash: formData.password,
        role: 'USER', 
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('Registration failed. Please try again.');
      }

    } catch (err: any) {
      console.error("Registration error:", err);
      
      if (err.response) {
        setError(err.response.data?.error || err.response.data?.message || "Registration failed. Email might already exist.");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-indigo-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <UserPlus className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-indigo-100 text-sm mt-2">Join the Student Management System</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-bold text-center">
              {success}
            </div>
          )}

          {/* Name Fields - Always Required */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
              <input 
                required
                placeholder="John" 
                value={formData.firstName} 
                onChange={e=>setFormData({...formData, firstName:e.target.value})} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
              <input 
                required
                placeholder="Doe" 
                value={formData.lastName} 
                onChange={e=>setFormData({...formData, lastName:e.target.value})} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email:e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password:e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
          
          <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
            Already have an account? <a href="/login" className="text-indigo-600 font-bold hover:underline">Sign In</a>
          </div>
        </form>
      </div>
    </div>
  );
}