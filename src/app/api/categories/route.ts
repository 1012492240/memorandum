import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// 获取分类列表
export async function GET(_request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const categories = await prisma.category.findMany({
            where: {
                userId: user.userId as number
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(categories);
    } catch (err) {
        console.error('获取分类失败:', err);
        return NextResponse.json(
            { error: '获取分类失败' },
            { status: 500 }
        );
    }
}

// 创建新分类
export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json(
                { error: '分类名称不能为空' },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                userId: user.userId as number
            }
        });

        return NextResponse.json({
            message: '分类创建成功',
            category
        });
    } catch (error) {
        return NextResponse.json(
            { error: '创建分类失败' },
            { status: 500 }
        );
    }
} 