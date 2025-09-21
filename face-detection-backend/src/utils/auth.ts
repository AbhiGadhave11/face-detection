
import bcrypt from 'bcrypt';
import { JWTPayload } from '../types';
import { sign, verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'secert'
const JWT_EXPIRY = 60 * 60 * 24 * 7;

export const hashedPassword = (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

export const verifyPassword = (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
}

export const generateToken = async (userId: string, username: string): Promise<string> => {
    const payload: JWTPayload = {
        userId,
        username,
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
    }
    return sign(payload, JWT_SECRET);
}

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
    try {
        const payload = await verify(token, JWT_SECRET) as JWTPayload;
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            console.error('Token has expired');
            return null;
        }
        return payload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
}