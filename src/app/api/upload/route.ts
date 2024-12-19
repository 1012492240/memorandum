import { NextResponse } from 'next/server'
import { writeFile, mkdir, access } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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

        // 获取文件扩展名
        const ext = path.extname(file.name)
        // 生成唯一文件名
        const fileName = `${uuidv4()}${ext}`

        // 转换文件为 Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // 确保上传目录存在
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        await createDirIfNotExists(uploadDir)

        // 写入文件
        const filePath = path.join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        // 返回可访问的URL
        const fileUrl = `/uploads/${fileName}`

        return NextResponse.json({
            errno: 0, // wangEditor 需要这个字段
            data: {
                url: fileUrl,
                alt: file.name,
                href: fileUrl
            }
        })

    } catch (error) {
        console.error('上传文件失败:', error)
        return NextResponse.json(
            { error: "上传文件失败" },
            { status: 500 }
        )
    }
}

// 创建目录的辅助函数
async function createDirIfNotExists(dirPath: string) {
    try {
        await access(dirPath)
    } catch {
        await mkdir(dirPath, { recursive: true })
    }
}

// 限制文件大小为 10MB
export const config = {
    api: {
        bodyParser: false,
        sizeLimit: '10mb',
    },
} 