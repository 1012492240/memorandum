import { prisma } from './prisma';
import webpush from 'web-push';

export async function sendReminders() {
    try {
        // 获取需要提醒的笔记
        const notes = await prisma.note.findMany({
            where: {
                hasReminder: true,
                reminderTime: {
                    lte: new Date(),
                    gt: new Date(Date.now() - 60000) // 最近一分钟内需要提醒的
                }
            },
            include: {
                user: true,
                category: true
            }
        });

        // 发送提醒
        for (const note of notes) {
            if (note.user.pushSubscription) {
                const payload = JSON.stringify({
                    title: `提醒: ${note.title}`,
                    content: `分类: ${note.category.name}\n${note.content.substring(0, 100)}...`,
                    noteId: note.id,
                    timestamp: new Date().toISOString()
                });

                await webpush.sendNotification(
                    JSON.parse(note.user.pushSubscription),
                    payload
                );
            }
        }
    } catch (error) {
        console.error('发送提醒失败:', error);
    }
} 