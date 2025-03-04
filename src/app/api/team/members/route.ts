import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
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

            // 查询用户并验证是否是团队成员
            const currentUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true, isTeamMember: true }
            });

            console.log(currentUser, '当前用户');
            if (!currentUser || !currentUser.isTeamMember) {
                return NextResponse.json(
                    { error: '无权访问团队成员列表' },
                    { status: 403 }
                );
            }

            // 获取所有团队成员
            const members = await prisma.user.findMany({
                where: {
                    isTeamMember: true
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return NextResponse.json(members);

        } catch (error) {
            return NextResponse.json(
                { error: error },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('获取团队成员失败:', error);
        return NextResponse.json(
            { error: '获取团队成员失败' },
            { status: 500 }
        );
    }
} 