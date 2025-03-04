'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Note {
    id: number;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    categoryId: number;
    category: {
        name: string;
    };
    hasReminder: boolean;
    reminderTime: string | null;
}

interface Category {
    id: number;
    name: string;
    _count: {
        notes: number;
    };
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    _count: {
        notes: number;
        categories: number;
    };
    categories: Category[];
    createdAt: string;
}

interface PageProps {
    params: Promise<{ userId: string }>;
}

export default function TeamMemberNotes({ params }: PageProps) {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [member, setMember] = useState<TeamMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const resolvedParams = use(params);

    useEffect(() => {
        fetchMemberAndNotes();
    }, [resolvedParams.userId]);

    const fetchMemberAndNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            // 获取成员信息
            const memberRes = await fetch(`/api/team/members/${resolvedParams.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!memberRes.ok) throw new Error('获取成员信息失败');
            const memberData = await memberRes.json();
            setMember(memberData);

            // 获取成员的笔记
            const notesRes = await fetch(`/api/team/notes/${resolvedParams.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!notesRes.ok) throw new Error('获取笔记失败');
            const notesData = await notesRes.json();
            setNotes(notesData);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '加载失败';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // 筛选和排序笔记
    const filteredNotes = notes
        .filter(note =>
            // 先按分类筛选
            (selectedCategory === null || note.categoryId === selectedCategory) &&
            // 再按搜索词筛选
            (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (a.isPinned === b.isPinned) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return a.isPinned ? -1 : 1;
        });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* 背景装饰 */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.15]">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M0 32V0h32" fill="none" stroke="rgb(59 130 246)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* 导航栏 */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/team')}
                            className="p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <div className="flex-1 max-w-2xl mx-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="搜索笔记..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-xl"
                                />
                                <svg
                                    className="absolute left-3 top-2.5 h-5 w-5 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="w-6"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* 成员信息卡片 */}
                {member && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-blue-100 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium shadow-lg">
                                {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-blue-900 mb-2">{member.name || member.email}</h2>
                                <div className="text-blue-600 mb-1">{member.email}</div>
                                <div className="text-blue-400 text-sm">
                                    共创建了 {member._count.notes} 条笔记 · {member._count.categories} 个分类
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 分类列表 */}
                {member && member.categories && (
                    <div className="mb-8 bg-white rounded-xl shadow-sm p-4 border border-blue-100">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === null
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                            >
                                全部
                                <span className="ml-2 text-xs">
                                    ({member._count.notes})
                                </span>
                            </button>
                            {member.categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                >
                                    {category.name}
                                    <span className="ml-2 text-xs">
                                        ({category._count.notes})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 笔记列表 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => router.push(`/notes/${note.id}`)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-lg text-gray-800">
                                    {note.title}
                                </h3>
                                {note.isPinned && (
                                    <span className="text-yellow-500">📌</span>
                                )}
                            </div>
                            <div
                                className="text-gray-600 text-sm line-clamp-3 prose prose-sm max-w-none mb-4"
                                dangerouslySetInnerHTML={{
                                    __html: note.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                                }}
                            />
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                <span className="px-3 py-1 bg-blue-50 rounded-full text-blue-600 font-medium">
                                    {note.category.name}
                                </span>
                            </div>
                            {note.hasReminder && note.reminderTime && (
                                <div className="mt-3 text-sm text-blue-600 flex items-center bg-blue-50/50 rounded-xl p-2.5">
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {new Date(note.reminderTime).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 空状态 */}
                {!isLoading && filteredNotes.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-6xl mb-4 animate-bounce">📝</div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? '没有找到相关笔记' : '暂无笔记'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
} 