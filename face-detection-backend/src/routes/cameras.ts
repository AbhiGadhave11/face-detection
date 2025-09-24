import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { prisma } from "../utils/database";
import { JWTPayload } from "../types";
import { z } from "zod";
import { CreateCameraSchema, handleValidationError, UpdateCameraSchema } from "../utils/validation";
import { wsManager } from "../utils/websocket";

const cameras = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

cameras.use('/*', jwt({ secret: JWT_SECRET }));

cameras.get('/', async (c) => {
    try {
        console.log(c);
        const payload = c.get('jwtPayload') as JWTPayload;
    
        console.log(`Fetching cameras for user: ${payload.username}`);

        const cameras = await prisma.camera.findMany({
            where: { 
                userId: payload.userId 
            },
            orderBy: { 
                createdAt: 'desc' 
            },
            include: {
                _count: {
                    select: { 
                        alerts: true 
                    }
                }
            }
        });

        console.log(`Found ${cameras.length} cameras`);

        return c.json({ 
            cameras: cameras.map(camera => ({
                ...camera,
                alertCount: camera._count.alerts
            }))
        });
    } catch (error) {
        console.error('❌ Get cameras error:', error);
        return c.json({ error: 'Failed to fetch cameras' }, 500);

    }
});

cameras.post('/', async (c) => {
    try {
        const payload = c.get('jwtPayload') as JWTPayload;
        const body = await c.req.json();
        
        console.log(`Creating camera for user: ${payload.username}`, body);

        const validatedData = CreateCameraSchema.parse(body);
        const { name, rtspUrl, location } = validatedData;

        const camera = await prisma.camera.create({
        data: {
            name,
            rtspUrl,
            location: location || '',
            userId: payload.userId
        }
        });

        console.log(`Camera created: ${camera.name} (ID: ${camera.id})`);

        return c.json({ camera });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('Camera creation validation error:', error.issues);
            return c.json(handleValidationError(error), 400);
        }
        console.error('Create camera error:', error);
        return c.json({ error: 'Failed to create camera' }, 500);
    }
});

cameras.get('/:id', async (c) => {
    try {
        const payload = c.get('jwtPayload') as JWTPayload;
        const cameraId = c.req.param('id');

        console.log(`Fetching camera: ${cameraId}`);

        const camera = await prisma.camera.findFirst({
            where: { 
                id: cameraId,
                userId: payload.userId 
            },
            include: {
                alerts: {
                    take: 10,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!camera) {
            console.log(`Camera not found: ${cameraId}`);
            return c.json({ error: 'Camera not found' }, 404);
        }

        console.log(`Found camera: ${camera.name}`);

        return c.json({ camera });
    } catch (error) {
        console.error('Get camera error:', error);
        return c.json({ error: 'Failed to fetch camera' }, 500);
    }
});

cameras.put('/:id', async (c) => {
    try {
        const payload = c.get('jwtPayload') as JWTPayload;
        const cameraId = c.req.param('id');
        const body = await c.req.json();

        console.log(`Updating camera: ${cameraId}`, body);

        const validatedData = UpdateCameraSchema.parse(body);

        const camera = await prisma.camera.update({
            where: { 
                id: cameraId,
                userId: payload.userId 
            },
            data: {
                ...validatedData
            }
        });

        console.log(`Camera updated: ${camera.name}`);

        return c.json({ camera });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(handleValidationError(error), 400);
        }
        console.error('Update camera error:', error);
        return c.json({ error: 'Failed to update camera' }, 500);
    }
});

cameras.delete('/:id', async (c) => {
    try {
        const payload = c.get('jwtPayload') as JWTPayload;
        const cameraId = c.req.param('id');

        console.log(`Deleting camera: ${cameraId}`);

        const camera = await prisma.camera.delete({
            where: { 
                id: cameraId,
                userId: payload.userId 
            }
        });

        console.log(`Camera deleted: ${camera.name}`);

        return c.json({ success: true, message: 'Camera deleted successfully' });
    } catch (error) {
        console.error('Delete camera error:', error);
        return c.json({ error: 'Failed to delete camera' }, 500);
    }
});

cameras.post('/:id/start', async (c) => {
    try {
        const payload = c.get('jwtPayload') as JWTPayload;
        const cameraId = c.req.param('id');

        console.log(`Starting stream for camera: ${cameraId}`);

        const camera = await prisma.camera.update({
            where: { 
                id: cameraId,
                userId: payload.userId 
            },
            data: { isStreaming: true }
        });

        // TODO: Send message to Go worker to start processing this camera
        console.log(`Would start processing for camera: ${camera.name}`);

        // Broadcast status update via WebSocket
        wsManager.broadcastCameraStatus(cameraId, true);

        console.log(`Camera streaming started: ${camera.name}`);

        return c.json({ camera });
    } catch (error) {
        console.error('Start camera error:', error);
        return c.json({ error: 'Failed to start camera' }, 500);
    }
});

cameras.post('/:id/stop', async (c) => {
    try {
        const payload = c.get('jwtPayload') as JWTPayload;
        const cameraId = c.req.param('id');

        console.log(`Stopping stream for camera: ${cameraId}`);

        const camera = await prisma.camera.update({
            where: { 
                id: cameraId,
                userId: payload.userId 
            },
            data: { isStreaming: false }
        });

        // TODO: Send message to Go worker to stop processing this camera
        console.log(`Would stop processing for camera: ${camera.name}`);

        // Broadcast status update via WebSocket
        wsManager.broadcastCameraStatus(cameraId, false);

        console.log(`Camera streaming stopped: ${camera.name}`);

        return c.json({ camera });

    } catch (error) {
        console.error('Stop camera error:', error);
        return c.json({ error: 'Failed to stop camera' }, 500);
    }
});

export default cameras;