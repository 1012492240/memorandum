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
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <nav className="bg-white shadow-sm backdrop-blur-md bg-opacity-80 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-blue-800">个人信息</h1>
                        <div className="w-12"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {profile && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-blue-100 hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative">
                                    <div className="w-36 h-36 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                                        <span className="text-5xl text-white font-medium">
                                            {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="text-center md:text-left space-y-3 flex-1">
                                    <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
                                        {profile.name || '未设置用户名'}
                                    </h2>
                                    <p className="text-blue-700 text-lg flex items-center justify-center md:justify-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        {profile.email}
                                    </p>
                                    <div className="text-blue-400 text-sm flex items-center justify-center md:justify-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        注册时间：{new Date(profile.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md hover:translate-y-[-2px] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-3xl md:text-4xl font-bold text-blue-700">
                                            {profile._count.notes}
                                        </div>
                                        <div className="text-blue-500">笔记数量</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md hover:translate-y-[-2px] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-3xl md:text-4xl font-bold text-blue-700">
                                            {profile._count.categories}
                                        </div>
                                        <div className="text-blue-500">分类数量</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="px-8 py-3 bg-white border border-red-200 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-all transform hover:scale-[1.02] shadow-sm flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 2.5V5a.5.5 0 01.5-.5h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5H14v.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V7h-.5a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5h.5z" clipRule="evenodd" />
                                </svg>
                                退出登录
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-blue-900/30 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-blue-100 animate-fadeIn">
                        <h3 className="text-xl font-semibold mb-4 text-blue-900">确认退出</h3>
                        <p className="text-blue-700 mb-6">您确定要退出当前账号吗？</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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