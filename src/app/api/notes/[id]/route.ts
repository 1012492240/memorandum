import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// 获取单个笔记
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        const note = await prisma.note.findFirst({
            where: {
                id: parseInt(params.id),
                // userId: user.userId as number
            },
            include: {
                category: true
            }
        });

        if (!note) {
            return NextResponse.json(
                { error: '笔记不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error('获取笔记详情错误:', error);
        return NextResponse.json(
            { error: '获取笔记详情失败' },
            { status: 500 }
        );
    }
}

// 删除笔记
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        // 验证笔记是否存在且属于当前用户
        const note = await prisma.note.findFirst({
            where: {
                id: parseInt(params.id),
                userId: user.userId as number
            }
        });

        if (!note) {
            return NextResponse.json(
                { error: '笔记不存在或无权删除' },
                { status: 404 }
            );
        }

        // 删除笔记
        await prisma.note.delete({
            where: {
                id: parseInt(params.id)
            }
        });

        return NextResponse.json({
            message: '笔记删除成功'
        });
    } catch (error) {
        console.error('删除笔记错误:', error);
        return NextResponse.json(
            { error: '删除失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 更新笔记
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // 更新笔记
        const note = await prisma.note.update({
            where: {
                id: parseInt(params.id),
                userId: user.userId as number
            },
            data: {
                title,
                content,
                categoryId: parseInt(categoryId),
                isPinned: isPinned || false,
                hasReminder: hasReminder || false,
                reminderTime: hasReminder ? new Date(reminderTime) : null
            }
        });

        return NextResponse.json({
            message: '笔记更新成功',
            note
        });
    } catch (error) {
        console.error('更新笔记错误:', error);
        return NextResponse.json(
            { error: '更新失败，请稍后重试' },
            { status: 500 }
        );
    }
} 