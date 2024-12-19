import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

function MyEditor({ onChange, initialContent }: { onChange: (html: string) => void, initialContent: string }) {
    // editor 实例
    const [editor, setEditor] = useState<IDomEditor | null>(null) // TS 语法
    // const [editor, setEditor] = useState(null)                   // JS 语法

    // 编辑器内容
    const [html, setHtml] = useState(initialContent)


    useEffect(() => {
        setHtml(initialContent)
    }, [initialContent])
    // 工具栏配置
    const toolbarConfig: Partial<IToolbarConfig> = {} // TS 语法
    // const toolbarConfig = { }                        // JS 语法

    // 编辑器配置
    const editorConfig: Partial<IEditorConfig> = {
        // TS 语法
        // const editorConfig = {                         // JS 语法
        placeholder: '请输入内容...',
        MENU_CONF: {
            uploadImage: {
                server: '/api/upload',
                fieldName: 'file',
                maxFileSize: 10 * 1024 * 1024, // 10MB
                maxNumberOfFiles: 10,
                allowedFileTypes: ['image/*'],
                // 自定义上传参数，按照 wangEditor 的返回格式处理
                customInsert(res: any, insertFn: any) {
                    if (res.errno === 0) {
                        // 上传成功
                        insertFn(res.data.url, res.data.alt, res.data.href)
                    } else {
                        console.error('上传失败:', res)
                    }
                },
                // 上传之前触发
                onBeforeUpload(file: File) {
                    return file // 返回 false 则停止上传
                },
                // 上传进度回调
                onProgress(progress: number) {
                    console.log('progress', progress)
                },
                // 单个文件上传成功之后
                onSuccess(file: File, res: any) {
                    console.log('success', file, res)
                },
                // 单个文件上传失败
                onFailed(file: File, res: any) {
                    console.log('failed', file, res)
                },
                // 上传错误，或者触发 timeout 超时
                onError(file: File, err: any, res: any) {
                    console.log('error', file, err, res)
                },
            }
        }
    }


    // 及时销毁 editor ，重要！
    useEffect(() => {
        return () => {
            if (editor == null) return
            editor.destroy()
            setEditor(null)
        }
    }, [editor])

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
                    onCreated={setEditor}
                    onChange={(editor) => {
                        setHtml(editor.getHtml())
                        onChange(editor.getHtml())
                    }}
                    mode="default"
                    style={{ height: '500px', overflowY: 'hidden' }}
                />
            </div>

        </>
    )
}

export default MyEditor