import express from 'express';
import { getFacebookAuthUrl, exchangeFacebookCode, getFacebookProfile } from '../services/oauth';
import { addAccount } from '../services/accounts';

const router = express.Router();

// GET /oauth/facebook/authorize?userId=...
router.get('/facebook/authorize', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        res.status(400).send("Missing userId");
        return;
    }
    // We pass userId as state to retrieve it in callback
    const url = getFacebookAuthUrl(userId as string);
    res.redirect(url);
});

// GET /oauth/facebook/callback
router.get('/facebook/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        res.status(400).send(`OAuth Error: ${error}`);
        return;
    }

    if (!code || !state) {
        res.status(400).send("Missing code or state");
        return;
    }

    try {
        const userId = state as string; // We used state to pass userId

        // Exchange code
        const tokenData = await exchangeFacebookCode(code as string);
        const accessToken = tokenData.access_token;

        // Get Profile
        const profile = await getFacebookProfile(accessToken);

        // Save Account
        addAccount(userId, 'facebook', profile.name, profile.id, accessToken);

        // Redirect to Frontend
        res.redirect('http://localhost:5173/');

    } catch (err: any) {
        console.error("OAuth Callback Error:", err.response?.data || err.message);
        res.status(500).send("Authentication failed");
    }
});

export default router;
