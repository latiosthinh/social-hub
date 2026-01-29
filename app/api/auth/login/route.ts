import { NextResponse } from 'next/server';
import { login } from '@/services/auth';

export async function POST(request: Request) {
    try {
        console.log('[Login API] POST request received');
        const body = await request.json();
        console.log('[Login API] Body:', body);
        const { email } = body;

        if (!email) {
            console.log('[Login API] No email provided');
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        console.log('[Login API] Attempting login for:', email);
        const loginResult = login(email);
        console.log('[Login API] Success:', loginResult);

        return NextResponse.json(loginResult);
    } catch (error: any) {
        console.error('[Login API] Error caught:', error);

        return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
    }
}
