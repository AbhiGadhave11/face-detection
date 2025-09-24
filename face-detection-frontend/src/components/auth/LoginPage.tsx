import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/useAuth';
// import { apiService } from '../../services/api';
// import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, state } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Extract error message
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please try again.';
      
      setLoginError(errorMessage);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SecurityIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'primary.main', 
                  mb: 2 
                }} 
              />
              <Typography variant="h4" component="h1" gutterBottom>
                Face Detection
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Dashboard Login
              </Typography>
            </Box>

            {/* Login Error Alert */}
            {loginError && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setLoginError('')}
              >
                {loginError}
              </Alert>
            )}

            {/* Login Form */}
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              noValidate
            >
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                error={!!errors.username}
                helperText={errors.username}
                margin="normal"
                autoComplete="username"
                autoFocus
                disabled={state.loading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                autoComplete="current-password"
                disabled={state.loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        disabled={state.loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={state.loading}
                startIcon={state.loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                }}
              >
                {state.loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            {/* Default Credentials Info */}
            <Paper 
              sx={{ 
                p: 2, 
                mt: 3, 
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Default Credentials:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Username: <code>admin</code><br />
                Password: <code>secret</code>
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}