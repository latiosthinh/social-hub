import { NextResponse } from 'next/server';
import { login } from '@/services/auth';

export async function POST(request: Request) {
    try {
        console.log('Login API called');
        const { email } = await request.json();
        console.log('Login attempt for:', email);
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { id, email: userEmail, token } = login(email);
        return NextResponse.json({ id, email: userEmail, token });
    } catch (error: any) {
        console.error('Login error:', error);

        // Log to file for debugging
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'debug_error.log');
        fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Error: ${error?.message}\nStack: ${error?.stack}\n`);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
