'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
}

export default function Team() {
    const router = useRouter();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'USER' as const,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<'USER' | 'ADMIN'>('USER');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        // 解析 token 获取用户角色
        try {

            fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.role) {
                        console.log(data.role, '当前用户角色');
                        setCurrentUserRole(data.role);
                    }
                });
        } catch (error) {
            console.error('获取用户角色失败:', error);
        }

        fetchMembers();
    }, [router]);

    // 获取团队成员列表
    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未登录');
            }

            const res = await fetch('/api/team/members', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '获取团队成员失败');
            }

            setMembers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '获取团队成员失败';
            setError(errorMessage);

            // 如果是未授权错误，重定向到登录页
            if (errorMessage === '未登录' || errorMessage === '未授权访问') {
                router.push('/auth/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 创建新成员
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未登录');
            }

            const res = await fetch('/api/team/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    isTeamMember: true
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '创建成员失败');
            }

            // 重置表单
            setFormData({
                email: '',
                password: '',
                name: '',
                role: 'USER'
            });
            setShowCreateForm(false);

            // 显示成功消息
            setError('');
            // 刷新成员列表
            fetchMembers();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '创建成员失败';
            setError(errorMessage);

            // 如果是未授权错误，重定向到登录页
            if (errorMessage === '未登录' || errorMessage === '未授权访问') {
                router.push('/auth/login');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 打开删除确认弹窗
    const openDeleteConfirm = (member: TeamMember) => {
        setMemberToDelete(member);
        setShowDeleteConfirm(true);
    };

    // 关闭删除确认弹窗
    const closeDeleteConfirm = () => {
        setMemberToDelete(null);
        setShowDeleteConfirm(false);
        setIsDeleting(false);
    };

    // 删除成员
    const handleDelete = async () => {
        if (!memberToDelete) return;

        setIsDeleting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未登录');
            }

            const res = await fetch(`/api/team/delete?id=${memberToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '删除成员失败');
            }

            // 关闭弹窗
            closeDeleteConfirm();
            // 刷新成员列表
            fetchMembers();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '删除成员失败';
            setError(errorMessage);

            if (errorMessage === '未登录' || errorMessage === '未授权访问') {
                router.push('/auth/login');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const getRoleBadgeClass = (role: string) => {
        return role === 'ADMIN'
            ? 'bg-purple-100 text-purple-800 border-purple-200'
            : 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const getRoleLabel = (role: string) => {
        return role === 'ADMIN' ? '管理员' : '成员';
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
            {/* 导航栏 */}
            <nav className="bg-white shadow-sm backdrop-blur-md bg-opacity-80 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-blue-800">团队成员</h1>
                        {currentUserRole === 'ADMIN' && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                </svg>
                                创建成员
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* 主内容区 */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* 团队信息卡片 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-blue-100 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-4 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-blue-900 mb-2">我的团队</h2>
                            <p className="text-blue-700">共 {members.length} 位成员</p>
                            <p className="text-blue-500 text-sm mt-1">协作更高效，创作更轻松</p>
                        </div>
                    </div>
                </div>

                {/* 成员列表 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-blue-900">团队成员</h2>
                        {currentUserRole === 'ADMIN' && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="创建新成员"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {members.map((member) => (
                            <div key={member.id} className=" cursor-pointer border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm">
                                        {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="font-medium text-blue-900">{member.name || '未设置姓名'}</div>
                                                <div className="text-sm text-blue-600">{member.email}</div>
                                            </div>
                                            <div className="mt-2 sm:mt-0 flex items-center gap-2">
                                                <span className={`text-xs px-3 py-1 rounded-full border ${getRoleBadgeClass(member.role)}`}>
                                                    {getRoleLabel(member.role)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(member.createdAt).toLocaleDateString()}
                                                </span>
                                                {currentUserRole === 'ADMIN' && member.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => openDeleteConfirm(member)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                        title="删除成员"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* 创建成员弹窗 */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-blue-900/30 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-blue-100 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-blue-900">创建新成员</h3>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-blue-800 text-sm font-medium mb-2">
                                        邮箱地址
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="请输入邮箱地址"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-blue-800 text-sm font-medium mb-2">
                                        密码
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="请输入密码"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-blue-800 text-sm font-medium mb-2">
                                        姓名
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="请输入姓名"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-blue-800 text-sm font-medium mb-2">
                                        角色
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                                        className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="USER">成员</option>
                                        <option value="ADMIN">管理员</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>创建中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                            </svg>
                                            <span>创建成员</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 删除确认弹窗 */}
            {showDeleteConfirm && memberToDelete && (
                <div className="fixed inset-0 bg-blue-900/30 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-blue-100 animate-fadeIn">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                确认删除成员
                            </h3>
                            <p className="text-gray-500 mb-6">
                                您确定要删除成员 <span className="font-medium text-blue-600">{memberToDelete.name || memberToDelete.email}</span> 吗？此操作不可撤销。
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={closeDeleteConfirm}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                                    disabled={isDeleting}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>删除中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>确认删除</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 