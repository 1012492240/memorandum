import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log(pathname, 'pathname')
    // 排除静态资源和所有认证相关路径
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/auth/') ||  // 排除所有 auth 路径
        pathname.startsWith('/api/auth/') ||  // 排除所有 auth API
        pathname === '/favicon.ico'
    ) {
        console.log(pathname, '登录成功')
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    // // 未登录用户
    if (!token) {
        // API 请求返回 401
        if (pathname.startsWith('/api')) {
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }
        // 页面请求重定向到登录页，并保存返回地址
        const returnUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(
            new URL(`/auth/login?returnUrl=${returnUrl}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
        '/api/:path*',
        '/auth/:path*',
    ],
};
