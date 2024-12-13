import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(_request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const defaultCategories = [
            { name: '账号密码' },
            { name: '工作待办' },
            { name: '学习计划' },
            { name: '书籍总结' },
        ];

        // 为用户创建默认分类
        const categories = await Promise.all(
            defaultCategories.map(category =>
                prisma.category.create({
                    data: {
                        name: category.name,
                        userId: user.userId as number,
                    },
                })
            )
        );

        return NextResponse.json({
            message: '分类初始化成功',
            categories,
        });
    } catch (error) {
        console.error('初始化分类错误:', error);
        return NextResponse.json(
            { error: '初始化失败，请稍后重试' },
            { status: 500 }
        );
    }
} 