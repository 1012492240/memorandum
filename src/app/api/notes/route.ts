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

        const { title, content, categoryId, isPinned, hasReminder, reminderTime } = await request.json();

        // 验证输入
        if (!title || !content || !categoryId) {
            return NextResponse.json(
                { error: '请填写所有必填字段' },
                { status: 400 }
            );
        }

        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId: user.userId as number,
                categoryId: parseInt(categoryId),
                isPinned: isPinned || false,
                hasReminder: hasReminder || false,
                reminderTime: hasReminder ? new Date(reminderTime) : null
            }
        });

        return NextResponse.json({
            message: '笔记创建成功',
            note
        });
    } catch (error) {
        console.error('创建笔记错误:', error);
        return NextResponse.json(
            { error: '创建失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 获取笔记列表
export async function GET(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const categoryId = url.searchParams.get('categoryId');

        const whereClause = {
            userId: user.userId as number,
            ...(categoryId ? { categoryId: parseInt(categoryId) } : {})
        };

        // 获取总记录数
        const total = await prisma.note.count({
            where: whereClause
        });

        // 获取分页数据
        const notes = await prisma.note.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                category: true
            },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        return NextResponse.json({
            notes,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取笔记错误:', error);
        return NextResponse.json(
            { error: '获取笔记失败' },
            { status: 500 }
        );
    }
}


