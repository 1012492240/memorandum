'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
    _count: {
        notes: number;
        categories: number;
    };
}

export default function Profile() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (!res.ok) throw new Error('获取个人信息失败');
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError('获取个人信息失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('token');
            router.push('/auth/login');
        } catch (error) {
            setError('退出失败，请重试');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/')}
                            className="back-button"
                        >
                            <svg
                                className="back-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold">个人信息</h1>
                        <div className="w-12"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-lg mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {profile && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-3xl text-white">
                                        {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-lg font-medium">{profile.name || '未设置用户名'}</div>
                                    <div className="text-gray-500">{profile.email}</div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        注册于 {new Date(profile.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                                <div className="text-2xl font-bold text-blue-500 mb-1">
                                    {profile._count.notes}
                                </div>
                                <div className="text-gray-600">笔记数量</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                                <div className="text-2xl font-bold text-blue-500 mb-1">
                                    {profile._count.categories}
                                </div>
                                <div className="text-gray-600">分类数量</div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            退出登录
                        </button>
                    </div>
                )}
            </main>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-medium mb-3">确认退出</h3>
                        <p className="text-gray-600 mb-6">确定要退出登录吗？</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                确认退出
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 