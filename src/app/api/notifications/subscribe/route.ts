import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const subscription = await request.json();

        // 保存用户的推送订阅信息
        await prisma.user.update({
            where: { id: user.userId as number },
            data: {
                pushSubscription: JSON.stringify(subscription)
            }
        });

        return NextResponse.json({ message: '订阅成功' });
    } catch (error) {
        console.error('推送订阅错误:', error);
        return NextResponse.json(
            { error: '订阅失败' },
            { status: 500 }
        );
    }
} 