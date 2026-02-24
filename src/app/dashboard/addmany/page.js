'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export default function AddManyPage() {
    const fileInputRef = useRef(null);
    const [importing, setImporting] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);
    const [popupDuplicates, setPopupDuplicates] = useState(null);

    const handleImportClick = () => {
        setPopupMessage(null);
        fileInputRef.current?.click();
    };

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setImporting(true);
        setPopupMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/users/import', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                setPopupMessage(`Başarıyla ${data.count ?? 0} kullanıcı eklendi.`);
                setPopupDuplicates(null);
            } else {
                setPopupMessage(data.error || 'Excel tablo tipi eşleşmiyor');
                setPopupDuplicates(data.duplicates || null);
            }
        } catch {
            setPopupMessage('Yükleme sırasında hata oluştu.');
        } finally {
            setImporting(false);
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold !text-black">Excel ile Toplu Kullanıcı Ekleme</h1>
                <Link
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                    ← Listeye dön
                </Link>
            </div>

            <p className="text-sm text-gray-600">
                Excel dosyasında 5 sütun olmalı (sırayla): Ad, Soyad, E-posta, Yaş, Şifre. Başlık satırı zorunlu değil.
            </p>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                type="button"
                onClick={handleImportClick}
                disabled={importing}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm font-medium !text-black disabled:opacity-50"
            >
                {importing ? 'Yükleniyor...' : 'Excel dosyası seç'}
            </button>

            <div className="pt-4 border-t border-gray-200">
                <Link
                    href="/dashboard"
                    className="block w-full py-2 px-4 text-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium"
                >
                    Dashboard a git
                </Link>
            </div>

            {popupMessage != null && (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => { setPopupMessage(null); setPopupDuplicates(null); }}
    >
        <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
        >
            <p className="text-black font-medium mb-2">{popupMessage}</p>
            {popupDuplicates && popupDuplicates.length > 0 && (
                <ul className="text-left text-black text-sm list-disc list-inside space-y-1 mb-4 max-h-48 overflow-y-auto">
                    {popupDuplicates.map((d, i) => (
                        <li key={i}>
                            Satır {d.rowIndex} — {d.email}
                        </li>
                    ))}
                </ul>
            )}
            <button
                type="button"
                onClick={() => { setPopupMessage(null); setPopupDuplicates(null); }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
                Tamam
            </button>
        </div>
    </div>
)}
        </div>
    );
}