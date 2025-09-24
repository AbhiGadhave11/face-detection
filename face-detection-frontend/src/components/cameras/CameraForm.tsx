
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { type Camera, type CreateCameraData, type UpdateCameraData } from '../../types';
import { apiService } from '../../services/api';

interface CameraFormProps {
  open: boolean;
  camera?: Camera; // If provided, it's an edit form
  onClose: () => void;
  onSuccess: (camera: Camera) => void;
}

interface FormData {
  name: string;
  rtspUrl: string;
  location: string;
}

interface FormErrors {
  name?: string;
  rtspUrl?: string;
  location?: string;
}

export function CameraForm({ open, camera, onClose, onSuccess }: CameraFormProps) {
  const isEditing = !!camera;
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    rtspUrl: '',
    location: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Initialize form data when camera prop changes
  useEffect(() => {
    if (camera) {
      setFormData({
        name: camera.name,
        rtspUrl: camera.rtspUrl,
        location: camera.location || '',
      });
    } else {
      setFormData({
        name: '',
        rtspUrl: '',
        location: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [camera, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Camera name is required';
    }

    if (!formData.rtspUrl.trim()) {
      newErrors.rtspUrl = 'RTSP URL is required';
    } else if (!formData.rtspUrl.startsWith('rtsp://')) {
      newErrors.rtspUrl = 'URL must start with rtsp://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      let result: Camera;
      
      if (isEditing && camera) {
        // Update existing camera
        const updateData: UpdateCameraData = {
          name: formData.name,
          rtspUrl: formData.rtspUrl,
          location: formData.location || undefined,
        };
        result = await apiService.updateCamera(camera.id, updateData);
      } else {
        // Create new camera
        const createData: CreateCameraData = {
          name: formData.name,
          rtspUrl: formData.rtspUrl,
          location: formData.location || undefined,
        };
        result = await apiService.createCamera(createData);
      }
      
      onSuccess(result);
      onClose();
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to save camera:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Failed to save camera. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditing ? 'Edit Camera' : 'Add New Camera'}
      </DialogTitle>
      
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ pt: 1 }}
        >
          <TextField
            autoFocus
            fullWidth
            label="Camera Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            disabled={loading}
            placeholder="e.g., Front Door Camera"
          />

          <TextField
            fullWidth
            label="RTSP URL"
            value={formData.rtspUrl}
            onChange={handleInputChange('rtspUrl')}
            error={!!errors.rtspUrl}
            helperText={errors.rtspUrl}
            margin="normal"
            disabled={loading}
            placeholder="rtsp://username:password@camera-ip:554/stream"
          />

          <TextField
            fullWidth
            label="Location (Optional)"
            value={formData.location}
            onChange={handleInputChange('location')}
            error={!!errors.location}
            helperText={errors.location}
            margin="normal"
            disabled={loading}
            placeholder="e.g., Main Entrance, Parking Lot"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}