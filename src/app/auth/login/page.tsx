'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Login() {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
        } else {
            console.log('已登录1')
            router.push('/');
        }
    }, []);


    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            console.log(data, 'data');

            // 保存 token 到 localStorage
            localStorage.setItem('token', data.token);

            console.log(data.token, '保存token');
            // 登录成功后跳转
            router.push('/');
            // router.refresh();
        } catch (err: Error | unknown) {
            console.log(err, 'err');
            setError(err instanceof Error ? err.message : '未知错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* 背景装饰 */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full bg-blue-100 opacity-20"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full bg-indigo-100 opacity-20"></div>
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-6">
                {/* Logo和标题组合 */}
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                        <span className="text-2xl text-white">📝</span>
                    </div>
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
                        <p className="text-sm text-gray-600">登录以继续使用知识库</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg py-6 px-4 shadow-xl rounded-2xl sm:px-8 border border-gray-100">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-2 rounded text-sm">
                            <p className="flex items-center">
                                <span className="mr-2">⚠️</span>
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                邮箱地址
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    ✉️
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                密码
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    🔒
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
                            disabled={isLoading}
                        >
                            {isLoading ? '登录中...' : '登录'}
                        </button>
                    </form>

                    {/* <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">
                            还没有账号？{' '}
                            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
                                注册新账号
                            </Link>
                        </span>
                    </div> */}
                </div>

                {/* 底部文本 */}
                <p className="mt-4 text-center text-xs text-gray-500">
                    登录即表示您同意我们的
                    <a href="#" className="text-blue-600 hover:text-blue-500 ml-1">
                        服务条款
                    </a>
                </p>
            </div>
        </div>
    );
}