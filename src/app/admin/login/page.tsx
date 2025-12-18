'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/admin');
            router.refresh();
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded-lg"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
