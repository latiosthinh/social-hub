import express from 'express';
import { getAccounts, addAccount, toggleAccount, toggleGroup } from '../services/accounts';

const router = express.Router();

// Middleware to mock getting userId from token (assuming headers for now or just body)
// Real app would use JWT middleware
const getUserId = (req: express.Request) => {
    return req.headers['x-user-id'] as string;
};

router.get('/', (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const accounts = getAccounts(userId);
    res.json(accounts);
});

router.post('/', (req, res) => {
    const userId = getUserId(req);
    const { platform, display_name } = req.body;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const account = addAccount(userId, platform, display_name);
        res.json(account);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/toggle', (req, res) => {
    const { is_active } = req.body;
    toggleAccount(req.params.id, is_active);
    res.json({ success: true });
});

router.patch('/group/:platform/toggle', (req, res) => {
    const userId = getUserId(req);
    const { is_active } = req.body;
    const { platform } = req.params;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    toggleGroup(userId, platform, is_active);
    res.json({ success: true });
});

export default router;
