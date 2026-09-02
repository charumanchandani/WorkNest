import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAuth, useTheme } from '../hooks';
import { Button, Input, Alert, Card, CardContent } from '../components/ui';

export const LoginPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/app';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.formattedMessage || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Top Bar with Home Link & Theme Toggle */}
      <div className="absolute top-4 left-4 sm:left-8 flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:right-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          leftIcon={theme === 'dark' ? Sun : Moon}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white shadow-subtle mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="WorkNest Home"
          >
            <Layers className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sign in to WorkNest
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Workplace Operations & Employee Management Platform
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-dialog border-border">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {error && (
              <Alert
                variant="destructive"
                title="Authentication Error"
                onDismiss={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email Address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                leftIcon={Mail}
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div className="space-y-1.5">
                <div className="relative">
                  <Input
                    label="Account Password"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    leftIcon={Lock}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-7 p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={!isSubmitting ? ArrowRight : undefined}
                className="mt-2"
              >
                Sign In
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
              >
                Create an employee account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
