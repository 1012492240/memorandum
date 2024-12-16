'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeUserToPush } from '@/lib/webPush';
import '@wangeditor/editor/dist/css/style.css'; // 引入样式
import { IDomEditor, IEditorConfig, IToolbarConfig, createEditor, createToolbar } from '@wangeditor/editor';
import dynamic from 'next/dynamic';

interface Category {
    id: number;
    name: string;
}

interface FormData {
    title: string;
    content: string;
    categoryId: string;
    isPinned: boolean;
    hasReminder: boolean;
    reminderTime: string;
}

const Editor = dynamic(() => import('./editor'), {
    ssr: false // 禁用服务器端渲染
});

export default function NewNote() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        content: '',
        categoryId: '',
        isPinned: false,
        hasReminder: false,
        reminderTime: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.content.trim()) {
            setError('笔记内容不能为空');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const reminderData = formData.hasReminder ? {
                hasReminder: true,
                reminderTime: new Date(formData.reminderTime).toISOString()
            } : {
                hasReminder: false,
                reminderTime: null
            };

            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ...reminderData
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航 */}
            <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.back()}
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
                        <h1 className="text-xl font-bold">新建笔记</h1>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="text-blue-600 font-medium disabled:opacity-50 hover:text-blue-700"
                        >
                            {isLoading ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 标题输入 */}
                    <div>
                        <input
                            type="text"
                            placeholder="请输入标题"
                            className="w-full text-xl font-semibold p-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-transparent"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* 分类和置顶选项 */}
                    <div className="flex items-center gap-6">
                        <div className="flex-1 relative">
                            <button
                                type="button"
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="w-full px-4 py-2.5 text-left bg-white border rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="flex items-center justify-between">
                                    <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                                        {selectedCategory ? selectedCategory.name : '选择分类'}
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {showCategoryDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 ${formData.categoryId === category.id.toString() ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                } ${category.id === categories[0].id ? 'rounded-t-lg' : ''} 
                                            ${category.id === categories[categories.length - 1].id ? 'rounded-b-lg' : ''}`}
                                            onClick={() => {
                                                setFormData({ ...formData, categoryId: category.id.toString() });
                                                setShowCategoryDropdown(false);
                                            }}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPinned}
                                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">置顶笔记</span>
                        </label>
                    </div>

                    {/* 内容编辑器 */}
                    <div className="mt-4">
                        <Editor
                            onChange={(html: string) => {
                                setFormData(prev => ({
                                    ...prev,
                                    content: html || ''
                                }));
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.hasReminder}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        hasReminder: e.target.checked,
                                        reminderTime: e.target.checked ? formData.reminderTime : ''
                                    });
                                    if (e.target.checked) {
                                        subscribeUserToPush();
                                    }
                                }}
                                className="mr-2"
                            />
                            设置提醒
                        </label>
                        {formData.hasReminder && (
                            <input
                                type="datetime-local"
                                value={formData.reminderTime}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    reminderTime: e.target.value
                                })}
                                min={new Date().toISOString().slice(0, 16)}
                                className="border rounded px-2 py-1"
                            />
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}