import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
        }

        const response = await fetch('http://47.99.87.50:3000/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer sk-KZmittpSEz3lAT13E1F8C768690c4502BcF4F368AcAf03E2"
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: `请优化以下内容的布局和文本，使其更加专业。
                        1.为每个部分添加的标题（只能用用h2-h5标签，如果原文不是需要改正），并且加上序号且序号不能重复！。
                        2.图片大小和图片地址不变。
                        4.优化后的内容应采用专业的论文排版格式。
                        5.首尾不要携带html标签。
                        7.<code>标签内的内容不要修改，如果代码没有换行那么一定要换行进行格式化。
                        6.仅返回最终优化结果：${content}`
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            // 尝试获取错误信息
            const errorText = await response.text();
            throw new Error(`优化服务请求失败: ${errorText}`);
        }

        // 使用 Response.body.getReader() 处理流数据
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('无法读取响应数据');
        }

        let fullText = '';
        const decoder = new TextDecoder();

        // 循环读取所有数据
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value, { stream: true });
        }

        // 处理最后的数据块
        fullText += decoder.decode(undefined, { stream: false });

        try {
            // 尝试解析完整的JSON响应
            const jsonResponse = JSON.parse(fullText);
            return NextResponse.json(jsonResponse);
        } catch (error) {
            // 如果无法解析为JSON，则直接返回文本内容
            return NextResponse.json({ content: fullText });
        }

    } catch (error) {
        console.error('内容优化失败:', error);
        return NextResponse.json(
            { error: '内容优化失败，请稍后重试' },
            { status: 500 }
        );
    }
}
