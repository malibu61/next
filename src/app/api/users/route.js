import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)));
        const ageMin = searchParams.has('ageMin') ? parseInt(searchParams.get('ageMin'), 10) : null;
        const ageMax = searchParams.has('ageMax') ? parseInt(searchParams.get('ageMax'), 10) : null;

        const where = {};
        if (ageMin != null && !Number.isNaN(ageMin)) where.age = { ...where.age, gte: ageMin };
        if (ageMax != null && !Number.isNaN(ageMax)) where.age = { ...where.age, lte: ageMax };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    age: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);

        return Response.json({ users, total, page, pageSize });
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: 'Kullanıcılar yüklenemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, username, age, password } = body;

        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !username?.trim() || password == null || password === '') {
            return NextResponse.json(
                { error: 'Ad, soyad, e-posta, kullanıcı adı ve şifre zorunludur.' },
                { status: 400 }
            );
        }

        const ageNum = typeof age === 'number' ? age : parseInt(String(age), 10);
        if (!Number.isInteger(ageNum) || ageNum < 0) {
            return NextResponse.json(
                { error: 'Geçerli bir yaş girin.' },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.trim() },
                    { username: username.trim() },
                ],
            },
        });
        if (existing) {
            return NextResponse.json(
                { error: existing.email === email.trim() ? 'Bu e-posta zaten kayıtlı.' : 'Bu kullanıcı adı zaten kayıtlı.' },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(String(password), 10);
        const user = await prisma.user.create({
            data: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                username: username.trim(),
                age: ageNum,
                password: hashed,
            },
            select: { id: true, firstName: true, lastName: true, email: true, age: true },
        });
        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: 'Kullanıcı eklenemedi.' },
            { status: 500 }
        );
    }
}