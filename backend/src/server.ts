import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import oauthRoutes from './routes/oauth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB
try {
    initDb();
} catch (error) {
    console.error("Failed to init DB:", error);
}

// Routes
app.use('/auth', authRoutes);
app.use('/accounts', accountRoutes);
app.use('/oauth', oauthRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
