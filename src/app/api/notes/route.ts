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

        const notes = await prisma.note.findMany({
            where: {
                userId: user.userId as number
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('获取笔记错误:', error);
        return NextResponse.json(
            { error: '获取笔记失败' },
            { status: 500 }
        );
    }
}


