import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                age: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: 'Kullanıcı yüklenemedi' },
            { status: 500 }
        );
    }
}