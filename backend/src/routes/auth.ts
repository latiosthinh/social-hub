import express from 'express';
import { login } from '../services/auth';

const router = express.Router();

router.post('/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email required' });
        return;
    }
    try {
        const result = login(email);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
