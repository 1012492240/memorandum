'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Note {
    id: number;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    category: {
        id: number;
        name: string;
    };
}

export default function NoteDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



    const fetchNoteDetail = useCallback(async () => {
        try {
            const res = await fetch(`/api/notes/${resolvedParams.id}`);
            if (!res.ok) throw new Error('获取笔记详情失败');
            const data = await res.json();
            setNote(data);
        } catch (err) {
            setError('获取笔记详情失败');
        } finally {
            setIsLoading(false);
        }
    }, [resolvedParams.id]);

    useEffect(() => {
        fetchNoteDetail();
    }, [fetchNoteDetail]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/notes/${resolvedParams.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('删除失败');
            }

            router.push('/');
            router.refresh();
        } catch (err) {
            setError('删除失败，请重试');
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">{error || '笔记不存在'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航 */}
            <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                <div className=" mx-auto px-4">
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
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push(`/notes/${note.id}/edit`)}
                                className="text-blue-600"
                            >
                                编辑
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-red-600"
                                disabled={isDeleting}
                            >
                                {isDeleting ? '删除中...' : '删除'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 主要内容 */}
            <main className="pt-20 pb-16 px-4 mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* 笔记标题和标签 */}
                    <div className="flex items-start justify-between">
                        <h1 className="text-2xl font-bold">{note.title}</h1>
                        <div className="flex items-center gap-2">
                            {note.isPinned && (
                                <span className="text-yellow-500">📌</span>
                            )}
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                                {note.category.name}
                            </span>
                        </div>
                    </div>

                    {/* 创建时间 */}
                    <div className="text-sm text-gray-500">
                        创建于 {new Date(note.createdAt).toLocaleString()}
                    </div>

                    {/* 笔记内容 */}
                    <div className="prose max-w-none">
                        <div
                            className="w-full"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                    </div>
                </div>
            </main>

            {/* 删除确认对话框 */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold mb-4">确认删除</h3>
                        <p className="text-gray-600 mb-6">
                            确定要删除这个笔记吗？此操作不可恢复。
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600"
                                disabled={isDeleting}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? '删除中...' : '确认删除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 