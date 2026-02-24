'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

function buildQuery(params) {
    const p = new URLSearchParams();
    if (params.page) p.set('page', String(params.page));
    if (params.pageSize) p.set('pageSize', String(params.pageSize));
    if (params.ageMin !== '' && params.ageMin != null) p.set('ageMin', String(params.ageMin));
    if (params.ageMax !== '' && params.ageMax != null) p.set('ageMax', String(params.ageMax));
    return p.toString();
}

export default function DashboardUserList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
    const ageMin = searchParams.get('ageMin') ?? '';
    const ageMax = searchParams.get('ageMax') ?? '';

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const updateUrl = useCallback(
        (updates) => {
            const next = {
                page: updates.page ?? page,
                pageSize: updates.pageSize ?? pageSize,
                ageMin: updates.ageMin !== undefined ? updates.ageMin : ageMin,
                ageMax: updates.ageMax !== undefined ? updates.ageMax : ageMax,
            };
            const q = buildQuery(next);
            router.push(q ? `/dashboard?${q}` : '/dashboard', { scroll: false });
        },
        [page, pageSize, ageMin, ageMax, router]
    );

    useEffect(() => {
        const q = buildQuery({ page, pageSize, ageMin, ageMax });
        setLoading(true);
        setError('');
        fetch(`/api/users?${q}`, { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('Yüklenemedi');
                return res.json();
            })
            .then((data) => {
                setUsers(data.users ?? []);
                setTotal(data.total ?? 0);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [page, pageSize, ageMin, ageMax]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold !text-black">Kullanıcı Listesi</h1>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/add"
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm font-medium !text-black"
                    >
                        Tekli kullanıcı ekle
                    </Link>
                    <Link
                        href="/dashboard/addmany"
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm font-medium !text-black"
                    >
                        Excel ile toplu ekle
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-white">Yaş filtresi:</span>
                <input
                    type="number"
                    min="0"
                    placeholder="Min yaş"
                    value={ageMin}
                    onChange={(e) => updateUrl({ ageMin: e.target.value, page: 1 })}
                    className="border border-gray-300 rounded px-2 py-1.5 w-24 text-sm text-black placeholder:text-black"
                />
                <input
                    type="number"
                    min="0"
                    placeholder="Max yaş"
                    value={ageMax}
                    onChange={(e) => updateUrl({ ageMax: e.target.value, page: 1 })}
                    className="border border-gray-300 rounded px-2 py-1.5 w-24 text-sm text-black placeholder:text-black"
                />
                <button
                    type="button"
                    onClick={() => updateUrl({ ageMin: '', ageMax: '', page: 1 })}
                    className="text-sm text-white hover:text-black underline"
                >
                    Filtreyi temizle
                </button>
            </div>

            {loading && <p className="text-white">Yükleniyor...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && users.length === 0 && (
                <p className="text-white">Kullanıcı bulunamadı.</p>
            )}

            {!loading && !error && users.length > 0 && (
                <>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="p-3 text-left text-sm font-semibold text-white">Ad Soyad</th>
                                <th className="p-3 text-left text-sm font-semibold text-white">E-posta</th>
                                <th className="p-3 text-left text-sm font-semibold text-white">Yaş</th>
                                <th className="p-3 text-right text-sm font-semibold text-white"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-gray-100 text-white hover:bg-gray-300 hover:text-black">
                                    <td className="p-3">
                                        {u.firstName} {u.lastName}
                                    </td>
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">{u.age}</td>
                                    <td className="p-3 text-right">
                                        <Link
                                            href={`/dashboard/${u.id}`}
                                            className="inline-block px-3 py-1.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium"
                                        >
                                            Detay Göster
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <p className="text-sm text-white">
                            Toplam <strong>{total}</strong> kullanıcı • Sayfa {page} / {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={!hasPrev}
                                onClick={() => updateUrl({ page: page - 1 })}
                                className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium text-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Önceki
                            </button>
                            <span className="text-sm text-white">
                                {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={!hasNext}
                                onClick={() => updateUrl({ page: page + 1 })}
                                className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium text-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}