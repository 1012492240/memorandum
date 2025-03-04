import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

            // 验证当前用户是否是小伙伴们
            const currentUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { isTeamMember: true }
            });

            if (!currentUser?.isTeamMember) {
                return NextResponse.json(
                    { error: '无权访问' },
                    { status: 403 }
                );
            }

            // 获取目标用户的笔记
            const notes = await prisma.note.findMany({
                where: {
                    userId: Number(params.userId)
                },
                include: {
                    category: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' }
                ]
            });

            return NextResponse.json(notes);

        } catch (error) {
            return NextResponse.json(
                { error: '无效的认证令牌' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('获取笔记失败:', error);
        return NextResponse.json(
            { error: '获取笔记失败' },
            { status: 500 }
        );
    }
} 