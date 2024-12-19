import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

function MyEditor({ onChange, initialContent, }: { onChange: (html: string) => void, initialContent: string, }) {

    // editor 实例
    const [editor, setEditor] = useState<IDomEditor | null>(null) // TS 语法
    // const [editor, setEditor] = useState(null)                   // JS 语法
    const [isClient, setIsClient] = useState(false);

    // 编辑器内容
    const [html, setHtml] = useState(initialContent || '')

    // 模拟 ajax 请求，异步设置 html


    useEffect(() => {
        setHtml(initialContent)
    }, [initialContent])



    useEffect(() => {
        setIsClient(true); // 在客户端渲染时将 isClient 设置为 true
    }, []);


    // 工具栏配置
    const toolbarConfig: Partial<IToolbarConfig> = {} // TS 语法
    // const toolbarConfig = { }                        // JS 语法

    // 编辑器配置
    const editorConfig: Partial<IEditorConfig> = {
        // TS 语法
        // const editorConfig = {                         // JS 语法
        placeholder: '请输入内容...',
    }

    // 及时销毁 editor ，重要！
    useEffect(() => {
        return () => {
            if (editor == null) return
            editor.destroy()
            setEditor(null)
        }
    }, [editor])

    if (!isClient) {
        return <></>; // 服务器端不渲染任何内容
    }

    return (
        <>
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
                <Toolbar
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    mode="default"
                    style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                    defaultConfig={editorConfig}
                    value={html}

                    onChange={(editor) => {

                        const html = editor.getHtml();
                        // console.log(html, 'html执行');
                        onChange(html);

                    }}
                    mode="default"
                    style={{ height: '500px', overflowY: 'hidden' }}
                />
            </div>

        </>
    )
}

export default MyEditor