import React, { useState, FormEvent, ChangeEvent, MouseEvent } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/Login');
      // Registration successful - the auth context will handle navigation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (fieldName: keyof RegisterFormData) => {
    const icons = {
      name: User,
      email: Mail,
      password: Lock,
      confirmPassword: Lock
    };
    const Icon = icons[fieldName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Join Us Today
            </h1>
            <p className="text-gray-600">Create your account and start your journey</p>
          </div>

          {/* Form */}
          <div className="relative space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form Fields */}
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="relative group">
                <div className={`relative transition-all duration-300 ${
                  focusedField === key ? 'transform -translate-y-1' : ''
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <div className={`transition-colors duration-200 ${
                      focusedField === key 
                        ? 'text-indigo-500' 
                        : value 
                          ? 'text-gray-600' 
                          : 'text-gray-400'
                    }`}>
                      {getFieldIcon(key as keyof RegisterFormData)}
                    </div>
                  </div>
                  
                  <input
                    type={
                      key === 'email' ? 'email' : 
                      key === 'password' && !showPassword ? 'password' :
                      key === 'confirmPassword' && !showConfirmPassword ? 'password' :
                      key === 'password' || key === 'confirmPassword' ? 'text' : 'text'
                    }
                    name={key}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(key)}
                    onBlur={() => setFocusedField('')}
                    placeholder={
                      key === 'name' ? 'Full Name' :
                      key === 'email' ? 'Email Address' :
                      key === 'password' ? 'Password' :
                      'Confirm Password'
                    }
                    required
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50/80 border-2 rounded-2xl transition-all duration-300 placeholder-gray-400 focus:outline-none focus:bg-white/90 ${
                      focusedField === key
                        ? 'border-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  
                  {/* Password toggle buttons */}
                  {(key === 'password' || key === 'confirmPassword') && (
                    <button
                      type="button"
                      onClick={() => key === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                    >
                      <div className="text-gray-400 hover:text-gray-600 transition-colors">
                        {(key === 'password' ? showPassword : showConfirmPassword) ? 
                          <EyeOff className="w-5 h-5" /> : 
                          <Eye className="w-5 h-5" />
                        }
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
};

export default Register;