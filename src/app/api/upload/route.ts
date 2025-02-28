import OSS from 'ali-oss';
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// 初始化OSS客户端
const client = new OSS({
    region: process.env.ALI_OSS_REGION,
    accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.ALI_OSS_BUCKET!,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: "没有找到文件" },
                { status: 400 }
            )
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: "只允许上传图片文件" },
                { status: 400 }
            )
        }

        // 生成唯一文件名
        const ext = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;

        // 转换文件为Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // 上传到OSS
        const result = await client.put(
            `uploads/${fileName}`, // OSS存储路径
            buffer,
            { headers: { 'Content-Type': file.type } }
        );

        // 返回可访问的URL
        const fileUrl = result.url;

        return NextResponse.json({
            errno: 0,
            data: {
                url: fileUrl,
                alt: file.name,
                href: fileUrl
            }
        })

    } catch (error) {
        console.error('上传文件失败:', error);
        return NextResponse.json(
            { error: "上传文件失败" },
            { status: 500 }
        )
    }
}

// 保留原有的config配置
export const config = {
    api: {
        bodyParser: false,
        sizeLimit: '10mb',
    },
}; 