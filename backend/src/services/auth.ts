import db from '../db';
import crypto from 'crypto';

export const login = (email: string) => {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
        // Auto-create for simplicity in this prototype
        const id = crypto.randomUUID();
        db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(id, email);
        return { id, email, token: 'mock-jwt-token-' + id };
    }
    return { id: user.id, email: user.email, token: 'mock-jwt-token-' + user.id };
};
