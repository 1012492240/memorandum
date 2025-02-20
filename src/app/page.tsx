'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Note {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  categoryId: number;
  hasReminder: boolean;
  reminderTime: string | null;
}

interface Category {
  id: number;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('未登录')
      router.push('/auth/login');
    } else {

      fetchCategories();
      fetchNotes();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('获取分类失败');
      const data = await res.json();
      console.log(data, 'ddd');
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('获取笔记失败');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.log('获取笔记失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isPinned ? -1 : 1;
  });

  const filteredNotes = sortedNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? note.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      localStorage.removeItem('token'); // 清除本地存储的 token
      router.push('/auth/login');
    } catch (error) {
      console.error('退出失败:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedNotes.length) return;

    if (confirm(`确定要删除选中的 ${selectedNotes.length} 条笔记吗？`)) {
      try {
        const res = await fetch('/api/notes/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedNotes })
        });

        if (!res.ok) throw new Error('删除失败');

        // 更新列表
        setNotes(notes.filter(note => !selectedNotes.includes(note.id)));
        setSelectedNotes([]);
        setIsSelectionMode(false);
      } catch (error) {
        console.error('批量删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">我的知识库</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedNotes([]);
                }}
                className="p-2 text-gray-600 hover:text-gray-700"
              >
                {isSelectionMode ? (
                  '取消'
                ) : (
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>

              {isSelectionMode ? (
                <button
                  onClick={handleBatchDelete}
                  disabled={!selectedNotes.length}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  删除({selectedNotes.length})
                </button>
              ) : (
                <button
                  onClick={() => router.push('/notes/new')}
                  className="p-2 text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {/* 只在桌面端显示的其他按钮 */}
              <div className="hidden md:flex items-center space-x-4">
                <button onClick={() => router.push('/categories')} className="btn-outline">
                  分类管理
                </button>
                <button onClick={() => router.push('/profile')} className="btn-outline">
                  个人信息
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <main className="container-custom py-6">
        {/* 搜索和分类筛选 */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="搜索..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full transition-colors ${selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-full transition-colors ${selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 笔记列表 */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`card p-4 ${isSelectionMode ? 'cursor-pointer' : 'cursor-pointer'} group relative`}
                onClick={(e) => {
                  if (isSelectionMode) {
                    // 在选择模式下，点击卡片任何位置都触发选择
                    setSelectedNotes(prev =>
                      prev.includes(note.id)
                        ? prev.filter(id => id !== note.id)
                        : [...prev, note.id]
                    );
                  } else {
                    router.push(`/notes/${note.id}`);
                  }
                }}
              >
                {/* 显示选择框 */}
                {isSelectionMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={() => { }} // 保持空函数，因为选择逻辑已经在卡片点击时处理
                      className="w-5 h-5 rounded border-gray-300"
                    />
                  </div>
                )}

                <div className={isSelectionMode ? 'pr-8' : ''}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                      {note.title}
                    </h3>
                    {note.isPinned && (
                      <span className="text-yellow-500">📌</span>
                    )}
                  </div>
                  <div
                    className="text-gray-600 text-sm line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: note.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                    }}
                  />
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {categories.find(c => c.id === note.categoryId)?.name}
                    </span>
                  </div>
                  {note.hasReminder && note.reminderTime && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      提醒时间：
                      {new Date(note.reminderTime).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || selectedCategory ? '没有找到相关笔记' : '还没有笔记，开始创建吧！'}
            </p>
          </div>
        )}
      </main>

      {/* 移动端底部导航 */}
      <nav className="mobile-nav">
        <button className="nav-item">
          <span className="text-xl mb-1">📝</span>
          <span>所有笔记</span>
        </button>
        <button onClick={() => router.push('/categories')} className="nav-item">
          <span className="text-xl mb-1">📁</span>
          <span>分类管理</span>
        </button>
        <button onClick={() => router.push('/ai-chat')} className="nav-item">
          <span className="text-xl mb-1">🤖</span>
          <span>AI聊天</span>
        </button>
        <button onClick={() => router.push('/profile')} className="nav-item">
          <span className="text-xl mb-1">👤</span>
          <span>个人信息</span>
        </button>
      </nav>
    </div>
  );
}
