/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/cameras/CameraList.tsx
// Camera management component with grid view

import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Fab,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Edit,
  Delete,
  Add,
  Videocam,
  VideocamOff,
  Warning,
  Circle,
} from '@mui/icons-material';
import { type Camera } from '../../types';
import { apiService } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { format } from 'date-fns';
import { CameraForm } from './CameraForm';

interface CameraListProps {
    onEditCamera?: (camera: Camera) => void;
    onCreateCamera?: () => void;
}

export function CameraList({ onEditCamera, onCreateCamera }: CameraListProps) {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        camera: Camera | null;
    }>({ open: false, camera: null });
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [cameraForm, setCameraForm] = useState<{
        open: boolean;
        camera?: Camera;
    }>({ open: false });

    // WebSocket for real-time camera status updates
    useWebSocket('ws://localhost:8000', {
        onCameraStatusUpdate: useCallback((update: any) => {
            setCameras(prev => 
                prev.map(camera => 
                camera.id === update.cameraId
                    ? { ...camera, isStreaming: update.isStreaming }
                    : camera
                )
            );
        }, []),
    });

    // Load cameras on mount
    useEffect(() => {
        loadCameras();
    }, []);

    const loadCameras = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await apiService.getCameras();
            setCameras(data);
        } catch (error: any) {
            console.error('Failed to load cameras:', error);
            setError('Failed to load cameras. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartCamera = async (camera: Camera) => {
        try {
            setActionLoading(prev => ({ ...prev, [camera.id]: true }));
            const updatedCamera = await apiService.startCamera(camera.id);
            
            setCameras(prev =>
                prev.map(c => c.id === camera.id ? updatedCamera : c)
            );
        } catch (error: any) {
            console.error('Failed to start camera:', error);
            setError(`Failed to start ${camera.name}`);
        } finally {
            setActionLoading(prev => ({ ...prev, [camera.id]: false }));
        }
    };

    const handleStopCamera = async (camera: Camera) => {
        try {
            setActionLoading(prev => ({ ...prev, [camera.id]: true }));
            const updatedCamera = await apiService.stopCamera(camera.id);
            
            setCameras(prev =>
                prev.map(c => c.id === camera.id ? updatedCamera : c)
            );
        } catch (error: any) {
            console.error('Failed to stop camera:', error);
            setError(`Failed to stop ${camera.name}`);
        } finally {
            setActionLoading(prev => ({ ...prev, [camera.id]: false }));
        }
    };

    const handleDeleteClick = (camera: Camera) => {
        setDeleteDialog({ open: true, camera });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.camera) return;

        try {
            await apiService.deleteCamera(deleteDialog.camera.id);
            setCameras(prev => prev.filter(c => c.id !== deleteDialog.camera!.id));
            setDeleteDialog({ open: false, camera: null });
        } catch (error: any) {
            console.error('Failed to delete camera:', error);
            setError(`Failed to delete ${deleteDialog.camera.name}`);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, camera: null });
    };


    const handleCreateCamera = () => {
        console.log('🎬 Opening create camera form');
        setCameraForm({ open: true });
    };

    const handleEditCamera = (camera: Camera) => {
        console.log('✏️ Opening edit camera form for:', camera.name);
        setCameraForm({ open: true, camera });
    };

    const handleFormClose = () => {
        console.log('🚪 Closing camera form');
        setCameraForm({ open: false });
    };

    const handleFormSuccess = (camera: Camera) => {
        console.log('✅ Camera form success:', camera.name);
        
        if (cameraForm.camera) {
        // Update existing camera
        setCameras(prev => 
            prev.map(c => c.id === camera.id ? camera : c)
        );
        console.log('📝 Updated existing camera');
        } else {
        // Add new camera
        setCameras(prev => [camera, ...prev]);
        console.log('➕ Added new camera');
        }
    };

    const getStatusColor = (camera: Camera) => {
        if (!camera.enabled) return 'default';
        return camera.isStreaming ? 'success' : 'warning';
    };

    const getStatusText = (camera: Camera) => {
        if (!camera.enabled) return 'Disabled';
        return camera.isStreaming ? 'Streaming' : 'Stopped';
    };

    const getStatusIcon = (camera: Camera) => {
        if (!camera.enabled) return <VideocamOff />;
        return camera.isStreaming ? <Videocam /> : <Circle />;
    };

    if (loading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
        </Box>
        );
    }

    return (
        <Box>
        {/* Error Alert */}
        {error && (
            <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
            >
            {error}
            </Alert>
        )}

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h1">
            Cameras ({cameras.length})
            </Typography>
            <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
                handleCreateCamera()
            }}
            >
            Add Camera
            </Button>
        </Box>

        {/* Camera Grid */}
        {cameras.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
            <VideocamOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
                No cameras configured
            </Typography>
            <Typography color="text.secondary" paragraph>
                Add your first camera to start monitoring
            </Typography>
            <Button variant="contained" onClick={() => {
                handleCreateCamera()
            }}>
                Add Camera
            </Button>
            </Card>
        ) : (
            <Grid container spacing={3}>
            {cameras.map((camera) => (
                <Grid item xs={12} sm={6} md={4} key={camera.id}>
                <Card>
                    <CardContent>
                    {/* Camera Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                        icon={getStatusIcon(camera)}
                        label={getStatusText(camera)}
                        color={getStatusColor(camera)}
                        size="small"
                        />
                        {camera.alertCount && camera.alertCount > 0 && (
                        <Chip
                            icon={<Warning />}
                            label={`${camera.alertCount} alerts`}
                            color="error"
                            size="small"
                        />
                        )}
                    </Box>

                    {/* Camera Details */}
                    <Typography variant="h6" gutterBottom>
                        {camera.name}
                    </Typography>
                    
                    {camera.location && (
                        <Typography color="text.secondary" gutterBottom>
                        📍 {camera.location}
                        </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        Created: {format(new Date(camera.createdAt), 'MMM d, yyyy')}
                    </Typography>

                    {/* Video Placeholder */}
                    <Box
                        sx={{
                        height: 180,
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 2,
                        borderRadius: 1,
                        position: 'relative',
                        }}
                    >
                        {camera.isStreaming ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Videocam sx={{ fontSize: 48, color: 'primary.main' }} />
                            <Typography variant="body2" color="primary">
                            Live Stream
                            </Typography>
                        </Box>
                        ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <VideocamOff sx={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                            Stream Offline
                            </Typography>
                        </Box>
                        )}
                    </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between' }}>
                    {/* Stream Control */}
                    <Box>
                        {camera.enabled && (
                        <>
                            {camera.isStreaming ? (
                            <Tooltip title="Stop Stream">
                                <IconButton
                                color="error"
                                onClick={() => handleStopCamera(camera)}
                                disabled={actionLoading[camera.id]}
                                >
                                {actionLoading[camera.id] ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Stop />
                                )}
                                </IconButton>
                            </Tooltip>
                            ) : (
                            <Tooltip title="Start Stream">
                                <IconButton
                                color="success"
                                onClick={() => handleStartCamera(camera)}
                                disabled={actionLoading[camera.id]}
                                >
                                {actionLoading[camera.id] ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <PlayArrow />
                                )}
                                </IconButton>
                            </Tooltip>
                            )}
                        </>
                        )}
                    </Box>

                    {/* Edit/Delete Controls */}
                    <Box>
                        <Tooltip title="Edit Camera">
                        <IconButton
                            onClick={() => {
                                handleEditCamera(camera)
                            }}
                        >
                            <Edit />
                        </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Camera">
                        <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(camera)}
                        >
                            <Delete />
                        </IconButton>
                        </Tooltip>
                    </Box>
                    </CardActions>
                </Card>
                </Grid>
            ))}
            </Grid>
        )}

        {/* Floating Add Button (Mobile) */}
        <Fab
            color="primary"
            aria-label="add camera"
            onClick={() => {
                handleCreateCamera()
            }}
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                display: { xs: 'flex', sm: 'none' },
            }}
        >
            <Add />
        </Fab>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open}
            onClose={handleDeleteCancel}>
            <DialogTitle>Delete Camera</DialogTitle>
            <DialogContent>
            <DialogContentText>
                Are you sure you want to delete "{deleteDialog.camera?.name}"?
                This action cannot be undone and will also delete all associated alerts.
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
                Delete
            </Button>
            </DialogActions>
        </Dialog>
        <CameraForm
        open={cameraForm.open}           // ← Controls if dialog shows
        camera={cameraForm.camera}       // ← Camera data for editing (undefined for create)
        onClose={handleFormClose}        // ← Called when dialog closes
        onSuccess={handleFormSuccess}    // ← Called when form submits successfully
        />
        </Box>
    );
}