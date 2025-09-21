import { Hono } from "hono";
import { prisma } from "../utils/database";
import { extractTokenFromHeader, generateToken, verifyPassword } from '../utils/auth';
import { LoginSchema, handleValidationError } from '../utils/validation';
import { z } from 'zod';
import 'dotenv/config';

const auth = new Hono();

auth.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const validatedData = LoginSchema.parse(body);
        const { username, password } = validatedData;

        // find user in database
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                password: true,
                createdAt: true
            }
        });
        if (!user) {
            console.log(`Login failed: User '${username}' not found`);
            return c.json({ error: 'Invalid username or password' }, 401);
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            console.log(`Login failed: Invalid password for '${username}'`);
            return c.json({ error: 'Invalid credentials' }, 401);
        }

        // Generate JWT token
        const token = await generateToken(user.id, user.username);

        console.log(`Login successful for user: ${username}`);
        return c.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('Login validation error:', error.issues);
            return c.json(handleValidationError(error), 400);
        }

        console.error('Login error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

auth.post('/logout', async (c) => {
  console.log('User logout request received');
  
  return c.json({ 
    message: 'Logged out successfully',
    action: 'remove_token'
  });
});

/**
 * GET /verify - Verify token validity (useful for frontend)
 */
auth.get('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = extractTokenFromHeader(authHeader);
    
    // Here you could use your verifyToken utility, but since we'll use
    // JWT middleware in protected routes, this is just a simple check
    
    return c.json({ 
      valid: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export default auth;