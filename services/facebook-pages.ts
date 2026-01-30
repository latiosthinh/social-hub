import { getDb } from '@/lib/db';
import crypto from 'crypto';

export interface FacebookPage {
    id: string;
    user_id: string;
    page_id: string;
    page_name: string | null;
    access_token?: string | null;
    is_active: number;
    created_at: string;
}

export const getFacebookPages = (userId: string): FacebookPage[] => {
    return getDb().prepare('SELECT * FROM facebook_pages WHERE user_id = ? ORDER BY created_at DESC').all(userId) as FacebookPage[];
};

export const addFacebookPage = (userId: string, pageId: string, pageName?: string, accessToken?: string): FacebookPage => {
    const id = crypto.randomUUID();
    const stmt = getDb().prepare(`
        INSERT INTO facebook_pages (id, user_id, page_id, page_name, access_token)
        VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, pageId, pageName || null, accessToken || null);
    return { id, user_id: userId, page_id: pageId, page_name: pageName || null, access_token: accessToken || null, is_active: 1, created_at: new Date().toISOString() };
};

export const removeFacebookPage = (id: string, userId: string): boolean => {
    const result = getDb().prepare('DELETE FROM facebook_pages WHERE id = ? AND user_id = ?').run(id, userId);
    return result.changes > 0;
};

export const toggleFacebookPage = (id: string, isActive: boolean): void => {
    getDb().prepare('UPDATE facebook_pages SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
};

export const updateFacebookPageName = (id: string, pageName: string): void => {
    getDb().prepare('UPDATE facebook_pages SET page_name = ? WHERE id = ?').run(pageName, id);
};

export const resetFacebookPages = (userId: string): boolean => {
    const result = getDb().prepare('DELETE FROM facebook_pages WHERE user_id = ?').run(userId);
    return result.changes > 0;
};

export const updateFacebookPageToken = (userId: string, pageId: string, accessToken: string): void => {
    getDb().prepare('UPDATE facebook_pages SET access_token = ? WHERE user_id = ? AND page_id = ?').run(accessToken, userId, pageId);
};
