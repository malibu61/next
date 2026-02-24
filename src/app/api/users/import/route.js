import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: 'Dosya gerekli' },
                { status: 400 }
            );
        }

        const buf = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buf, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return NextResponse.json(
                { error: 'Excel tablo tipi eşleşmiyor' },
                { status: 400 }
            );
        }
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!Array.isArray(rows) || rows.length < 1) {
            return NextResponse.json(
                { error: 'Excel tablo tipi eşleşmiyor' },
                { status: 400 }
            );
        }

        // Başlık kontrolü yok; tüm satırlar veri. 5 sütun varsay: name, surname, email, age, password
        const dataRows = rows.filter((row) => {
            const r = Array.isArray(row) ? row : [];
            return r.length >= 5 && r.some((cell) => cell !== '' && cell != null);
        });

        if (dataRows.length === 0) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const toCreate = [];
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const name = row[0] != null ? String(row[0]).trim() : '';
            const surname = row[1] != null ? String(row[1]).trim() : '';
            const email = row[2] != null ? String(row[2]).trim() : '';
            const ageRaw = row[3];
            const password = row[4] != null ? String(row[4]).trim() : '';
            const age = typeof ageRaw === 'number' && !Number.isNaN(ageRaw) ? Math.floor(ageRaw) : parseInt(String(ageRaw), 10);
            if (!name || !surname || !email || !password) {
                return NextResponse.json(
                    { error: `Satır ${i + 1}: Ad, soyad, e-posta ve şifre zorunludur.` },
                    { status: 400 }
                );
            }
            if (!Number.isInteger(age) || age < 0) {
                return NextResponse.json(
                    { error: `Satır ${i + 1}: Geçerli bir yaş girin.` },
                    { status: 400 }
                );
            }
            toCreate.push({
                firstName: name,
                lastName: surname,
                email,
                username: email,
                age,
                password,
                rowIndex: i + 1,
            });
        }

        const existingEmails = new Set(
            (await prisma.user.findMany({ where: { email: { in: toCreate.map((u) => u.email) } }, select: { email: true } })).map((u) => u.email)
        );
        const duplicates = toCreate.filter((u) => existingEmails.has(u.email));
        if (duplicates.length > 0) {
            return NextResponse.json(
                {
                    error: 'Zaten kayıtlı e-postalar',
                    duplicates: duplicates.map((u) => ({ rowIndex: u.rowIndex, email: u.email })),
                },
                { status: 400 }
            );
        }

        const hashed = await Promise.all(toCreate.map((u) => bcrypt.hash(u.password, 10)));
        await prisma.$transaction(
            toCreate.map((u, i) =>
                prisma.user.create({
                    data: {
                        firstName: u.firstName,
                        lastName: u.lastName,
                        email: u.email,
                        username: u.username,
                        age: u.age,
                        password: hashed[i],
                    },
                })
            )
        );

        return NextResponse.json({ success: true, count: toCreate.length });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: 'Excel işlenirken hata oluştu.' },
            { status: 500 }
        );
    }
}