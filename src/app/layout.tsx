'use client';
import './globals.css'
import { useEffect } from 'react';
import { startReminderScheduler } from '@/lib/scheduler';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // useEffect(() => {
  //   // 启动提醒定时任务
  //   console.log('启动提醒定时任务');
  //   fetch('/api/reminders/check')

  // }, []);

  console.log('uuuuuuu')
  return (
    <html lang="zh">
      <head>
        <title>知识库</title>
        <meta name="description" content="知识库" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
