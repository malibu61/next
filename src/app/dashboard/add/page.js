'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AddUserPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    username: username.trim(),
                    age: age === '' ? 0 : parseInt(age, 10),
                    password,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                setSuccess(true);
                setFirstName('');
                setLastName('');
                setEmail('');
                setUsername('');
                setAge('');
                setPassword('');
            } else {
                setError(data.error || 'Kullanıcı eklenemedi.');
            }
        } catch {
            setError('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold !text-black">Yeni Kullanıcı Ekle</h1>
                <Link
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                    ← Listeye dön
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-gray-50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-gray-50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-gray-50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı adı</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-gray-50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yaş</label>
                    <input
                        type="number"
                        min="0"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-gray-50"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">Kullanıcı başarıyla eklendi.</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? 'Ekleniyor...' : 'Ekle'}
                </button>
            </form>

            <div className="pt-4 border-t border-gray-200">
                <Link
                    href="/dashboard"
                    className="block w-full py-2 px-4 text-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium"
                >
                    Dashboard a git
                </Link>
            </div>
            
        </div>
    );
}