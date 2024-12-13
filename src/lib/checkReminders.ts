import { prisma } from './prisma';
import webpush from 'web-push';

export async function checkReminders() {
    try {
        // 查找需要提醒的笔记
        const notes = await prisma.note.findMany({
            where: {
                hasReminder: true,
                reminderTime: {
                    lte: new Date(),
                    gt: new Date(Date.now() - 60000) // 最近一分钟内
                }
            },
            include: {
                user: true
            }
        });

        // 发送提醒
        for (const note of notes) {
            if (note.user.pushSubscription) {
                try {
                    await webpush.sendNotification(
                        JSON.parse(note.user.pushSubscription),
                        JSON.stringify({
                            title: note.title,
                            content: note.content.substring(0, 100),
                            noteId: note.id
                        })
                    );
                } catch (error) {
                    console.error('发送提醒失败:', error);
                }
            }
        }
    } catch (error) {
        console.error('检查提醒失败:', error);
    }
}
