import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

function MyEditor({ onChange, formData }: {
    onChange: (html: string) => void,
    formData: any
}) {
    console.log(formData, 'formData外部')
    const [editor, setEditor] = useState<IDomEditor | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [html, setHtml] = useState(formData.content)

    // 监听 formData 变化
    useEffect(() => {
        if (formData.content) {
            setHtml(formData.content)
        }
    }, [formData.content])

    useEffect(() => {
        setIsClient(true)
    }, [])

    const toolbarConfig: Partial<IToolbarConfig> = {}

    const editorConfig: Partial<IEditorConfig> = {
        placeholder: '请输入内容...',
    }

    useEffect(() => {
        return () => {
            if (editor) {
                editor.destroy()
                setEditor(null)
            }
        }
    }, [editor])

    if (!isClient) {
        return null
    }

    return (
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
                    const newHtml = editor.getHtml()
                    setHtml(newHtml)
                    onChange(newHtml)
                }}
                mode="default"
                style={{ height: '500px', overflowY: 'hidden' }}
            />
        </div>
    )
}

export default MyEditor