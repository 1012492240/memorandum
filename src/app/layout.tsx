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

  return (
    <html lang="zh">
      <head>
        <title>备忘录</title>
        <meta name="description" content="备忘录" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
