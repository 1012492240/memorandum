'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
    id: number;
    name: string;
    createdAt: string;
    _count?: {
        notes: number;
    };
}

export default function Categories() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('获取分类失败');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            setError('获取分类失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newCategory }),
            });

            if (!res.ok) throw new Error('创建分类失败');

            setNewCategory('');
            fetchCategories();
        } catch (err) {
            setError('创建分类失败');
        }
    };

    const handleDelete = async (categoryId: number) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }

            setShowDeleteConfirm(null);
            fetchCategories();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

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
                        <h1 className="text-xl font-bold text-blue-800">分类管理</h1>
                        <div className="w-12"></div>
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

                {/* 添加分类表单 */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-blue-100">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">新建分类</h2>
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="输入分类名称"
                            className="flex-1 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            添加
                        </button>
                    </form>
                </div>

                {/* 分类列表 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">我的分类</h2>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-10 text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
                            </svg>
                            <p>暂无分类，请添加您的第一个分类</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-blue-900">{category.name}</div>
                                            <div className="text-sm text-blue-500">
                                                {category._count?.notes || 0} 条笔记 · {new Date(category.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDeleteConfirm(category.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 删除确认对话框 */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-blue-900/30 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-blue-100 animate-fadeIn">
                            <h3 className="text-xl font-semibold mb-4 text-blue-900">确认删除</h3>
                            <p className="text-blue-700 mb-6">
                                确定要删除这个分类吗？如果分类下有笔记，需要先删除或移动笔记。
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    disabled={isDeleting}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>删除中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>确认删除</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}