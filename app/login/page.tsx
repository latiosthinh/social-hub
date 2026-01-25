'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Call Next.js API route
            const res = await axios.post('/api/auth/login', { email });
            if (res.data.token) {
                localStorage.setItem('auth_token', res.data.token);
                localStorage.setItem('user_id', res.data.id);
                // Redirect to dashboard
                window.location.href = '/';
            }
        } catch (err) {
            setError('Login failed. Try any email.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Broadcaster</h1>
                <p className="text-white/50 text-center mb-8">Enter your access credentials</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {error && <p className="text-rose-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-transform active:scale-95"
                    >
                        Access Control Center
                    </button>
                </form>
            </div>
        </div>
    );
}
