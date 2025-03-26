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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchNotes();
    }
  }, [currentPage, pageSize, searchTerm]);

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
  useEffect(() => {
    // 当 selectedCategory 改变时，重新获取 notes
    fetchNotes();
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = async () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 && !isLoadingMore && currentPage < totalPages) {
        setIsLoadingMore(true);
        try {
          const url = new URL('/api/notes', window.location.origin);
          url.searchParams.append('page', (currentPage + 1).toString());
          url.searchParams.append('pageSize', pageSize.toString());
          if (selectedCategory !== null) {
            url.searchParams.append('categoryId', selectedCategory.toString());
          }
          if (searchTerm) {
            url.searchParams.append('searchTerm', searchTerm);
          }
          const res = await fetch(url.toString());
          if (!res.ok) throw new Error('获取笔记失败');
          const data = await res.json();
          setNotes(prev => [...prev, ...data.notes]);
          setCurrentPage(prev => prev + 1);
        } catch (error) {
          console.error('加载更多笔记失败:', error);
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, totalPages, pageSize, isLoadingMore]);

  const fetchNotes = async () => {
    try {
      const url = new URL('/api/notes', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      if (selectedCategory !== null) {
        url.searchParams.append('categoryId', selectedCategory.toString());
      }
      if (searchTerm) {
        url.searchParams.append('searchTerm', searchTerm);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('获取笔记失败');
      const data = await res.json();
      setNotes(prevNotes => {
        if (currentPage === 1) return data.notes;
        // 确保不添加重复的笔记
        const newNotes = data.notes.filter((newNote: { id: number; }) =>
          !prevNotes.some(existingNote => existingNote.id === newNote.id)
        );
        return [...prevNotes, ...newNotes];
      });
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
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
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 使用单个 SVG 作为背景图案 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V0M40 40V0" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-600/20" />
              <path d="M0 40H40M0 0H40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-600/20" />
            </pattern>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="grid-fade">
              <rect x="0" y="0" width="100%" height="100%" fill="url(#fade)" />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" mask="url(#grid-fade)" />
        </svg>

        {/* 渐变光晕效果 */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-indigo-200/20 rounded-full blur-3xl"></div>

        {/* 顶部装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>

      {/* 内容区域添加玻璃拟态效果 */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl shadow-sm z-50 border-b border-blue-100/50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
                <circle
                  cx="16.5"
                  cy="10"
                  r="2"
                  className="fill-blue-500"
                  strokeWidth="0"
                />
                <path
                  d="M15 11.5L18 8.5"
                  className="stroke-blue-500"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                BrainBox
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedNotes([]);
                }}
                className="p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
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
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 rounded-full hover:bg-red-50 transition-all"
                >
                  删除({selectedNotes.length})
                </button>
              ) : (
                <button
                  onClick={() => router.push('/notes/new')}
                  className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {/* 桌面端按钮 */}
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => router.push('/categories')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all flex items-center"
                >
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  分类管理
                </button>
                <button
                  onClick={() => router.push('/team')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all flex items-center"
                >
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  小伙伴们
                </button>
                <button
                  onClick={() => router.push('/ai-chat')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"
                    />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                  </svg>
                  AI助手
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all flex items-center"
                >
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  个人信息
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-custom py-8 relative">
        {/* 搜索框增加玻璃拟态效果 */}
        <div className="space-y-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索笔记..."
              className="w-full px-4 py-3 pl-12 rounded-2xl border border-blue-100/50 
                       focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all 
                       bg-white/70 backdrop-blur-md shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setNotes([]);
              }}
            />
            <svg className="w-5 h-5 text-blue-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 分类按钮增加玻璃拟态效果 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage(1);
                setNotes([]);
                fetchNotes();
              }}
              className={`px-4 py-2 rounded-xl transition-all backdrop-blur-sm ${selectedCategory === null
                ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-200/50'
                : 'bg-white/50 text-gray-600 hover:bg-blue-50/50 border border-blue-100/50'
                }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                  setNotes([]);
                }}
                className={`px-4 py-2 rounded-xl transition-all backdrop-blur-sm ${selectedCategory === category.id
                  ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-200/50'
                  : 'bg-white/50 text-gray-600 hover:bg-blue-50/50 border border-blue-100/50'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 笔记卡片增加玻璃拟态效果 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-sm 
                         hover:shadow-xl transition-all duration-300 
                         border border-blue-100/50 hover:border-blue-200/50 
                         ${isSelectionMode ? 'cursor-pointer' : ''} 
                         group relative overflow-hidden`}
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
              {isSelectionMode && (
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note.id)}
                    onChange={() => { }} // 保持空函数，因为选择逻辑已经在卡片点击时处理
                    className="w-5 h-5 rounded-lg border-blue-200 text-blue-500 focus:ring-blue-400"
                  />
                </div>
              )}

              <div className={`p-5 ${isSelectionMode ? 'pr-12' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {note.title}
                  </h3>
                  {note.isPinned && (
                    <span className="text-yellow-500 transform hover:scale-110 transition-transform">📌</span>
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
                    {categories.find(c => c.id === note.categoryId)?.name}
                  </span>
                </div>
                {note.hasReminder && note.reminderTime && (
                  <div className="mt-3 text-sm text-blue-600 flex items-center bg-blue-50/50 rounded-xl p-2.5">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
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

        {/* 空状态 */}
        {!isLoading && filteredNotes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4 animate-bounce">📝</div>
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedCategory ? '没有找到相关笔记' : '还没有笔记，开始创建吧！'}
            </p>
          </div>
        )}

        {/* 加载更多指示器 */}
        {isLoadingMore && currentPage < totalPages && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {currentPage >= totalPages && total > 0 && (
          <div className="text-center mt-8 text-gray-500">
            已加载全部内容
          </div>
        )}
      </main>

      {/* 移动端导航栏也添加玻璃拟态效果 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-blue-100/50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          <button className="nav-item text-blue-600">
            <span className="text-xl mb-1">📝</span>
            <span className="text-xs">笔记</span>
          </button>
          <button onClick={() => router.push('/categories')} className="nav-item hover:text-blue-600 transition-colors">
            <span className="text-xl mb-1">📁</span>
            <span className="text-xs">分类</span>
          </button>
          <button onClick={() => router.push('/team')} className="nav-item hover:text-blue-600 transition-colors">
            <span className="text-xl mb-1">👥</span>
            <span className="text-xs">团队</span>
          </button>
          <button onClick={() => router.push('/ai-chat')} className="nav-item hover:text-blue-600 transition-colors">
            <span className="text-xl mb-1">🤖</span>
            <span className="text-xs">AI助手</span>
          </button>
          <button onClick={() => router.push('/profile')} className="nav-item hover:text-blue-600 transition-colors">
            <span className="text-xl mb-1">👤</span>
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// // 在文件顶部添加动画关键帧
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes blob {
//     0% { transform: translate(0px, 0px) scale(1); }
//     33% { transform: translate(30px, -50px) scale(1.1); }
//     66% { transform: translate(-20px, 20px) scale(0.9); }
//     100% { transform: translate(0px, 0px) scale(1); }
//   }
// `;
// document.head.appendChild(style);

// 在 tailwind.config.js 中添加以下配置
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         blob: "blob 7s infinite",
//       },
//       keyframes: {
//         blob: {
//           "0%": {
//             transform: "translate(0px, 0px) scale(1)",
//           },
//           "33%": {
//             transform: "translate(30px, -50px) scale(1.1)",
//           },
//           "66%": {
//             transform: "translate(-20px, 20px) scale(0.9)",
//           },
//           "100%": {
//             transform: "translate(0px, 0px) scale(1)",
//           },
//         },
//       },
//     },
//   },
// };


