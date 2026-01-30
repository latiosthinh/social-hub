import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { resetFacebookPages } from '@/services/facebook-pages';

export async function POST(request: NextRequest) {
    try {
        let userId: string | null = null;

        // 1. Try to authenticate via API Secret Key
        const secretKey = request.headers.get('X_API_Secret_Key') || request.headers.get('X-API-Secret-Key');
        if (secretKey) {
            const db = getDb();
            const user = db.prepare('SELECT id FROM users WHERE api_secret_key = ?').get(secretKey) as { id: string } | undefined;
            if (user) {
                userId = user.id;
            } else {
                return NextResponse.json(
                    { error: 'Unauthorized: Invalid API secret key' },
                    { status: 401 }
                );
            }
        }

        // 2. Fallback: Check for x-user-id (Internal UI use)
        // Note: In production, you might want to secure this better, but for this app structure, it mimics existing patterns.
        if (!userId) {
            userId = request.headers.get('x-user-id');
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing user identification' },
                { status: 401 }
            );
        }

        const success = resetFacebookPages(userId);

        return NextResponse.json({
            success: true,
            message: 'Facebook access tokens and pages have been reset.',
            deleted: success
        });

    } catch (error) {
        console.error('Error resetting Facebook pages:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
