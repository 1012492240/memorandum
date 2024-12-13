import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function DELETE(
    request: Request,
    { params }: RouteParams
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: '未授权' },
                { status: 401 }
            );
        }

        // 验证分类是否存在且属于当前用户
        const category = await prisma.category.findFirst({
            where: {
                id: parseInt(params.id),
                userId: user.userId as number
            },
            include: {
                _count: {
                    select: { notes: true }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { error: '分类不存在或无权删除' },
                { status: 404 }
            );
        }

        // 检查分类下是否有笔记
        if (category._count.notes > 0) {
            return NextResponse.json(
                { error: '该分类下还有笔记，请先删除或移动笔记' },
                { status: 400 }
            );
        }

        // 删除分类
        await prisma.category.delete({
            where: {
                id: parseInt(params.id)
            }
        });

        return NextResponse.json({
            message: '分类删除成功'
        });
    } catch (error) {
        console.error('删除分类错误:', error);
        return NextResponse.json(
            { error: '删除失败，请稍后重试' },
            { status: 500 }
        );
    }
}