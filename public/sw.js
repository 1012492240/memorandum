// sw.js - Service Worker 文件

// 监听 install 事件
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    // 安装完成后，强制跳过等待阶段，立即激活
    self.skipWaiting();
});

// 监听 activate 事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated...');
    // 清理旧的缓存等工作
    event.waitUntil(clients.claim());
});

// 监听推送通知
self.addEventListener('push', function(event) {

    const data = event.data.json();
    console.log('收到推送消息123:', data);
    if (data.title && data.content) {
        console.log('尝试显示通知');
        self.registration.showNotification(data.title, {
            body: data.content,
            data: { noteId: data.noteId },
        });
    } else {
        console.error('推送消息缺少必要字段:', data);
    }
});

// 监听通知点击事件
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    clients.openWindow(`/notes/${event.notification.data.noteId}`);
});
