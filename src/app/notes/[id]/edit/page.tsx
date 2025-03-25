'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { subscribeUserToPush } from '@/lib/webPush';
import '@wangeditor/editor/dist/css/style.css';
import { IDomEditor, IEditorConfig, IToolbarConfig, createEditor, createToolbar } from '@wangeditor/editor';
import Editor from '../../components/editor';
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

export default function EditNote({ params }: { params: Promise<{ id: string }> }) {


    console.log('打标签测试');
    const resolvedParams = use(params);
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editor, setEditor] = useState<IDomEditor | null>(null);
    const editorRef = useRef<IDomEditor | null>(null);

    const [isSave, setIsSave] = useState(0);
    const [isOptimizing, setIsOptimizing] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchNoteDetails();

        const handleKeyDown = (e: KeyboardEvent) => {

            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                setIsSave(prevState => prevState + 1);
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        console.log(isSave, 'ssss')
        if (isSave !== 0) {
            const formEvent = new Event('submit') as React.FormEvent;
            handleSubmit(formEvent, true);
        }

    }, [isSave])



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

    const fetchNoteDetails = async () => {
        try {
            const res = await fetch(`/api/notes/${resolvedParams.id}`);
            if (!res.ok) throw new Error('获取笔记详情失败');
            const data = await res.json();

            let reminderTime = '';
            if (data.reminderTime) {
                const date = new Date(data.reminderTime);
                reminderTime = date.toLocaleString('sv', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: undefined
                }).replace(' ', 'T');
            }

            setFormData({
                title: data.title,
                content: data.content,
                categoryId: data.categoryId.toString(),
                isPinned: data.isPinned,
                hasReminder: data.hasReminder,
                reminderTime: reminderTime
            });
        } catch (err) {
            setError('获取笔记详情失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, isKeyboardSave = false) => {
        e.preventDefault();
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

            const res = await fetch(`/api/notes/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ...reminderData
                }),
            });

            if (!res.ok) throw new Error('更新失败');

            if (isKeyboardSave) {
                // 显示保存成功提示
                setError('保存成功');
                setTimeout(() => setError(''), 2000); // 2秒后清除提示
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    console.log('formData', formData)

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                <div className=" mx-auto px-4">
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
                        <h1 className="text-xl font-semibold">编辑笔记</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={async () => {
                                    try {
                                        setIsOptimizing(true);
                                        const res = await fetch('/api/optimize', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                content: formData.content
                                            })
                                        });
                                        if (!res.ok) throw new Error('优化失败');
                                        const data = await res.json();
                                        console.log('优化结果:', data.choices[0].message.content);
                                        setFormData(prev => ({
                                            ...prev,
                                            content: data.choices[0].message.content
                                        }));
                                    } catch (err) {
                                        setError('优化失败');
                                    } finally {
                                        setIsOptimizing(false);
                                    }
                                }}
                                className="text-blue-600 font-medium disabled:opacity-50 hover:text-blue-700 flex items-center gap-2"
                                disabled={isOptimizing}
                            >
                                {isOptimizing ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        优化中...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 3a1 1 0 011-1h10a1 1 0 011 1v12a1 1 0 01-1 1h-2.586l-2.707 2.707a1 1 0 01-1.414 0L5.586 16H3a1 1 0 01-1-1V3zm1 0v12h2.586l2.707 2.707 2.707-2.707H16V3H5z" clipRule="evenodd" />
                                        </svg>
                                        优化
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="text-blue-600 font-medium disabled:opacity-50"
                            >
                                {isLoading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav >

            <main className="pt-20 pb-16 px-4  mx-auto">
                {error && (
                    <div className={`p-3 rounded mb-4 ${error === '保存成功' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="标题"
                            className="w-full text-2xl font-semibold p-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-transparent placeholder:text-black"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                <option value="">选择分类</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPinned"
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={formData.isPinned}
                                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                            />
                            <label htmlFor="isPinned" className="ml-2 text-gray-700">
                                置顶笔记
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 bg-white">

                        <Editor
                            onChange={(html) => {
                                setFormData(prev => ({
                                    ...prev,
                                    content: html
                                }));
                            }}
                            initialContent={formData.content}

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
        </div >
    );
}