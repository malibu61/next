import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Kullanıcı adı ve şifre gerekli' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username: String(username).trim() },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Kullanıcı adı veya şifre hatalı' },
                { status: 401 }
            );
        }

        const match = await bcrypt.compare(String(password), user.password);
        if (!match) {
            return NextResponse.json(
                { error: 'Kullanıcı adı veya şifre hatalı' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        const res = NextResponse.json({ success: true });
        res.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 5, // 5 dk
            sameSite: 'lax',
        });
        return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: 'Giriş yapılamadı' },
            { status: 500 }
        );
    }
}