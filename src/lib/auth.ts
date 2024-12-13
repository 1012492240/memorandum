import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getUser() {
    const token = (await cookies()).get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        console.log(payload, 'payload')
        return payload;
    } catch (error) {
        return null;
    }
} 