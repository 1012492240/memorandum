'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AIChatPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* <nav className="bg-white shadow-sm p-4">
                <button
                    onClick={() => router.push('/')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    返回首页
                </button>
            </nav> */}
            <iframe
                src="https://cloud.fastgpt.cn/chat/share?shareId=ke41odrh432tedglkw0gqnuy"
                className="w-full h-full"
                style={{ border: 'none', height: '100vh' }}
                title="AI Chat"
            />
        </div>
    );
} 