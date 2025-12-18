import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'secret';
const COOKIE_NAME = 'admin_token';

export async function signToken(payload: any) {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

export async function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (e) {
        return null;
    }
}

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8,
        path: '/',
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}
