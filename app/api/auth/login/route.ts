import { NextResponse } from 'next/server';
import { login } from '@/services/auth';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { id, email: userEmail, token } = login(email);
        return NextResponse.json({ id, email: userEmail, token });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
