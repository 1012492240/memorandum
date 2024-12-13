import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const userProfile = await prisma.user.findUnique({
            where: {
                id: user.userId as number
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                _count: {
                    select: {
                        notes: true,
                        categories: true
                    }
                }
            }
        });

        return NextResponse.json(userProfile);
    } catch (error) {
        return NextResponse.json(
            { error: '获取用户信息失败' },
            { status: 500 }
        );
    }
} 