import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 121988;

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();


        if (!email || !password) {
            return NextResponse.json(
                { error: '请填写所有必填字段' },
                { status: 400 }
            );
        }


        const user = await prisma.user.findUnique({
            where: { email },
        });


        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 400 }
            );
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: '密码错误' },
                { status: 400 }
            );
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 设置 cookie
        const cookieStore = cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7天
        });

        return NextResponse.json({
            message: '登录成功',
            token, // 返回 token 给前端
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('登录错误详情:', error);
        return NextResponse.json(
            { error: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
} 