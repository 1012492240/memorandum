import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();
    cookieStore.delete('token');

    return NextResponse.json({
        message: '退出成功'
    });
} 