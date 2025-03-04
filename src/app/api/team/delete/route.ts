import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function DELETE(req: Request) {
    try {
        // 1. 验证 token
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        try {
            // 验证并解析 token
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

            // 查询用户并验证是否是管理员
            const admin = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true }
            });

            if (!admin || admin.role !== 'ADMIN') {
                return NextResponse.json(
                    { error: '只有管理员可以删除小伙伴们' },
                    { status: 403 }
                );
            }

            // 获取要删除的用户ID
            const { searchParams } = new URL(req.url);
            const memberId = Number(searchParams.get('id'));

            if (!memberId) {
                return NextResponse.json(
                    { error: '缺少用户ID' },
                    { status: 400 }
                );
            }

            // 检查要删除的用户是否存在
            const memberToDelete = await prisma.user.findUnique({
                where: { id: memberId },
                select: { role: true }
            });

            if (!memberToDelete) {
                return NextResponse.json(
                    { error: '用户不存在' },
                    { status: 404 }
                );
            }

            // 不允许删除管理员
            if (memberToDelete.role === 'ADMIN') {
                return NextResponse.json(
                    { error: '不能删除管理员用户' },
                    { status: 403 }
                );
            }

            // 使用事务删除用户及其关联数据
            await prisma.$transaction(async (prisma) => {
                // 1. 删除用户的所有分类
                await prisma.category.deleteMany({
                    where: { userId: memberId }
                });

                // 2. 删除用户的所有笔记
                await prisma.note.deleteMany({
                    where: { userId: memberId }
                });

                // 3. 最后删除用户
                await prisma.user.delete({
                    where: { id: memberId }
                });
            });

            return NextResponse.json({ message: '删除成功' });

        } catch (error) {
            console.error('删除失败:', error);
            return NextResponse.json(
                { error: '删除失败' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('删除小伙伴们失败:', error);
        return NextResponse.json(
            { error: '删除小伙伴们失败' },
            { status: 500 }
        );
    }
} 