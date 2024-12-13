import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// 配置 Web Push
webpush.setVapidDetails(
    'mailto:liljet121@163.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
    try {
        const notes = await prisma.note.findMany({
            where: {
                hasReminder: true,
                reminderTime: {
                    lte: new Date(),
                    gt: new Date(Date.now() - 60000)
                }
            },
            include: {
                user: true
            }
        });

        for (const note of notes) {
            if (note.user.pushSubscription) {
                await webpush.sendNotification(
                    JSON.parse(note.user.pushSubscription),
                    JSON.stringify({
                        title: note.title,
                        content: note.content,
                        noteId: note.id
                    })
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('发送提醒失败:', error);
        return NextResponse.json({ error: '发送提醒失败' }, { status: 500 });
    }
} 