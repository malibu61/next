'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function formatDate(d) {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleString('tr-TR');
}

export default function UserDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        fetch(`/api/users/${id}`, { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error(res.status === 404 ? 'Kullanıcı bulunamadı' : 'Yüklenemedi');
                return res.json();
            })
            .then(setUser)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-4 text-black">Yükleniyor...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!user) return null;

    const rows = [
        { label: 'Ad', value: user.firstName },
        { label: 'Soyad', value: user.lastName },
        { label: 'E-posta', value: user.email },
        { label: 'Kullanıcı adı', value: user.username },
        { label: 'Yaş', value: user.age },
        { label: 'Kayıt tarihi', value: formatDate(user.createdAt) },
        { label: 'Güncellenme tarihi', value: formatDate(user.updatedAt) },
    ];

    return (
        <div className="p-4 max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold !text-black">Kullanıcı Detayı</h1>
                <Link
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                    ← Listeye dön
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="text-black text-right">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}