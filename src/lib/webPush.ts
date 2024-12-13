// 客户端订阅推送服务
export async function subscribeUserToPush() {
    try {
        // 1. 注册 Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker 注册成功:', registration);

        // 检查是否已有订阅
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            console.log('已有推送订阅:', existingSubscription);
            // 2.1 删除旧的订阅
            console.log('删除旧的推送订阅...');
            await existingSubscription.unsubscribe();
            console.log('旧的推送订阅已删除');
        }

        // 2. 订阅推送服务
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; // VAPID 公钥
        const convertedKey = urlBase64ToUint8Array(publicKey); // 转换成 Uint8Array 格式

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true, // 必须
            applicationServerKey: convertedKey
        });
        console.log('推送订阅成功:', subscription);

        // 3. 将订阅信息发送到服务器保存
        await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        console.log('订阅信息已发送到服务器');
        return subscription;
    } catch (error) {
        console.error('推送订阅失败:', error);
        return false;
    }
}

// 工具函数：将 Base64 字符串转换为 Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
