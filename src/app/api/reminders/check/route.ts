import { NextResponse } from 'next/server';


import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import { scheduleJob } from 'node-schedule';

export async function GET() {
    return NextResponse.json({
        message: 'Hello World!'
    });
}



const prisma = new PrismaClient();

// 打印当前使用的 VAPID keys 用于调试
console.log('Using VAPID keys:', {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 10) + '...',
    privateKey: process.env.VAPID_PRIVATE_KEY?.substring(0, 10) + '...'
});

webpush.setVapidDetails(
    "mailto:liljet121@163.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

async function checkReminders() {
    try {
        console.log('检查提醒任务开始执行...');
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
        console.log('notes长度', notes.length);

        for (const note of notes) {
            if (note.user.pushSubscription) {
                console.log('发送提醒给用户:', {
                    noteId: note.id,
                    subscription: note.user.pushSubscription
                });

                try {
                    await webpush.sendNotification(
                        JSON.parse(note.user.pushSubscription),
                        JSON.stringify({
                            title: note.title,
                            content: note.content,
                            noteId: note.id
                        })
                    );
                    console.log(`成功发送提醒: ${note.title}`);
                } catch (err: any) {  // 使用 any 类型
                    console.error('发送单个提醒失败:', {
                        noteId: note.id,
                        error: err.message,
                        statusCode: err.statusCode,
                        body: err.body
                    });
                }
            }
        }
    } catch (err) {
        console.error('检查提醒失败1:', err);
    }
}

// 启动定时任务
scheduleJob('* * * * *', checkReminders);
// scheduleJob('*/10 * * * * *', checkReminders);
// 立即执行一次检查
checkReminders();

console.log('提醒服务已启动');