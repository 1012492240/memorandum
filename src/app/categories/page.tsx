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
        <div className="min-h-screen bg-gray-50">
            <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
                <div className="container-custom">
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
                        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                            分类管理
                        </h1>
                        <div className="w-12">{/* 占位，保持标题居中 */}</div>
                    </div>
                </div>
            </nav>

            <main className="pt-20 pb-16 px-4 mx-auto">
                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="新建分类"
                            className="flex-1 p-2 border rounded"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            添加
                        </button>
                    </div>
                </form>

                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                            >
                                <div>
                                    <span className="font-medium">{category.name}</span>
                                    {category._count && (
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({category._count.notes} 条笔记)
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => setShowDeleteConfirm(category.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 删除确认对话框 */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
                            <p className="text-gray-600 mb-6">
                                确定要删除这个分类吗？如果分类下有笔记，需要先删除或移动笔记。
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-600"
                                    disabled={isDeleting}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? '删除中...' : '确认删除'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}