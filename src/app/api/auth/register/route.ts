import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        // 验证输入
        if (!email || !password) {
            return NextResponse.json(
                { error: '请填写所有必填字段' },
                { status: 400 }
            );
        }

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: '邮箱已被注册' },
                { status: 409 }
            );
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户和默认分类（使用事务确保原子性）
        const result = await prisma.$transaction(async (prisma) => {
            // 1. 创建用户
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null,
                },
            });

            console.log('用户创建成功:', user);

            // 2. 创建默认分类
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

        return NextResponse.json({
            message: '注册成功',
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
            },
        });
    } catch (error) {
        console.log('注册错误:', error);
        return NextResponse.json(
            { error: '注册失败，请稍后重试' },
            { status: 500 }
        );
    }
} 