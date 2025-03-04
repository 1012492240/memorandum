'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    joinedAt: string;
}

export default function Team() {
    const router = useRouter();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');

    useEffect(() => {
        // 模拟获取团队成员数据
        setTimeout(() => {
            const demoMembers: TeamMember[] = [
                {
                    id: 1,
                    name: '张三',
                    email: 'zhangsan@example.com',
                    role: 'admin',
                    avatar: 'Z',
                    joinedAt: '2023-01-15T08:30:00Z'
                },
                {
                    id: 2,
                    name: '李四',
                    email: 'lisi@example.com',
                    role: 'editor',
                    avatar: 'L',
                    joinedAt: '2023-02-20T10:15:00Z'
                },
                {
                    id: 3,
                    name: '王五',
                    email: 'wangwu@example.com',
                    role: 'member',
                    avatar: 'W',
                    joinedAt: '2023-03-10T14:45:00Z'
                },
                {
                    id: 4,
                    name: '赵六',
                    email: 'zhaoliu@example.com',
                    role: 'member',
                    avatar: 'Z',
                    joinedAt: '2023-04-05T09:20:00Z'
                }
            ];
            setMembers(demoMembers);
            setIsLoading(false);
        }, 0);
    }, []);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        // 模拟邀请成员
        setMembers([
            ...members,
            {
                id: Date.now(),
                name: inviteEmail.split('@')[0],
                email: inviteEmail,
                role: inviteRole,
                avatar: inviteEmail[0].toUpperCase(),
                joinedAt: new Date().toISOString()
            }
        ]);

        setInviteEmail('');
        setInviteRole('member');
        setShowInviteForm(false);
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'editor':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return '管理员';
            case 'editor':
                return '编辑者';
            default:
                return '成员';
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
            {/* 导航栏 */}
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
                        <h1 className="text-xl font-bold text-blue-800">团队成员</h1>
                        <button
                            onClick={() => setShowInviteForm(true)}
                            className="p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
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
                    <h2 className="text-lg font-semibold text-blue-900 mb-6">团队成员</h2>

                    <div className="space-y-4">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm">
                                        {member.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="font-medium text-blue-900">{member.name}</div>
                                                <div className="text-sm text-blue-600">{member.email}</div>
                                            </div>
                                            <div className="mt-2 sm:mt-0 flex items-center gap-2">
                                                <span className={`text-xs px-3 py-1 rounded-full border ${getRoleBadgeClass(member.role)}`}>
                                                    {getRoleLabel(member.role)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(member.joinedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* 邀请成员弹窗 */}
            {showInviteForm && (
                <div className="fixed inset-0 bg-blue-900/30 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-blue-100 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-blue-900">邀请新成员</h3>
                            <button
                                onClick={() => setShowInviteForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleInvite}>
                            <div className="mb-4">
                                <label className="block text-blue-800 text-sm font-medium mb-2">
                                    邮箱地址
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="请输入邮箱地址"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-blue-800 text-sm font-medium mb-2">
                                    角色
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="member">成员</option>
                                    <option value="editor">编辑者</option>
                                    <option value="admin">管理员</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteForm(false)}
                                    className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                    </svg>
                                    发送邀请
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 