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

        const { ids } = await request.json();
        if (!Array.isArray(ids) || !ids.length) {
            return NextResponse.json(
                { error: '无效的请求参数' },
                { status: 400 }
            );
        }

        // 批量删除笔记
        await prisma.note.deleteMany({
            where: {
                id: { in: ids },
                userId: user.userId as number
            }
        });

        return NextResponse.json({
            message: '笔记删除成功'
        });
    } catch (error) {
        console.error('批量删除笔记错误:', error);
        return NextResponse.json(
            { error: '删除失败，请稍后重试' },
            { status: 500 }
        );
    }
} 