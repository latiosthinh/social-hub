import db from '../db';
import crypto from 'crypto';

export const getAccounts = (userId: string) => {
    return db.prepare('SELECT * FROM social_accounts WHERE user_id = ?').all(userId);
};

export const addAccount = (userId: string, platform: string, displayName: string, platformUserId?: string, accessToken?: string) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
    INSERT INTO social_accounts (id, user_id, platform, display_name, group_name, platform_user_id, access_token)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
    stmt.run(id, userId, platform, displayName, platform, platformUserId || null, accessToken || null); // group_name = platform by default
    return { id, platform, display_name: displayName };
};

export const toggleAccount = (id: string, isActive: boolean) => {
    db.prepare('UPDATE social_accounts SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
};

export const toggleGroup = (userId: string, platform: string, isActive: boolean) => {
    db.prepare('UPDATE social_accounts SET is_active = ? WHERE user_id = ? AND platform = ?').run(isActive ? 1 : 0, userId, platform);
};
