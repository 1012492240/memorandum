import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// 验证请求数据的 schema
const createUserSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少需要6个字符'),
    name: z.string().min(2, '名称至少需要2个字符'),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
    isTeamMember: z.boolean().default(true),
});

export async function POST(req: Request) {
    try {
        // 1. 验证管理员身份
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
                    { error: '只有管理员可以创建团队成员账号' },
                    { status: 403 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { error: '无效的认证令牌' },
                { status: 401 }
            );
        }

        // 2. 验证请求数据
        const body = await req.json();
        const validatedData = createUserSchema.parse(body);

        // 3. 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已被注册' },
                { status: 400 }
            );
        }

        // 4. 创建用户和默认分类（使用事务确保原子性）
        const result = await prisma.$transaction(async (prisma) => {
            // 4.1 创建用户
            const user = await prisma.user.create({
                data: {
                    email: validatedData.email,
                    password: await bcrypt.hash(validatedData.password, 10),
                    name: validatedData.name,
                    role: validatedData.role,
                    isTeamMember: validatedData.isTeamMember,
                },
            });

            // 4.2 创建默认分类
            const defaultCategories = [
                { name: '账号密码' },
                { name: '工作待办' },
                { name: '学习计划' },
                { name: '书籍总结' }
            ];

            await prisma.category.createMany({
                data: defaultCategories.map(category => ({
                    name: category.name,
                    userId: user.id
                }))
            });

            return user;
        });

        // 5. 返回创建的用户信息（不包含敏感信息）
        return NextResponse.json({
            message: '创建成功',
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.role,
                createdAt: result.createdAt,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('创建用户失败:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: '输入数据验证失败', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: '创建用户失败' },
            { status: 500 }
        );
    }
} 