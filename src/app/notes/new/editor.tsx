'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import '@wangeditor/editor/dist/css/style.css';
import { IDomEditor, IEditorConfig, IToolbarConfig, createEditor, createToolbar } from '@wangeditor/editor';

interface EditorProps {
    onChange: (html: string) => void;
}

export default function Editor({ onChange }: EditorProps) {
    const [editor, setEditor] = useState<IDomEditor | null>(null);
    const editorRef = useRef<IDomEditor | null>(null);
    const toolbarRef = useRef<any>(null);

    // 使用 useCallback 包装 handleChange 函数
    const handleChange = useCallback((editor: IDomEditor) => {
        const html = editor.getHtml();
        onChange(html);
    }, [onChange]);

    useEffect(() => {
        // 确保只在客户端运行
        if (typeof window === 'undefined') return;

        // 清理之前的实例
        const cleanup = () => {
            if (toolbarRef.current) {
                toolbarRef.current = null;
            }
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };

        // 如果已经存在实例，先清理
        cleanup();

        try {
            // 创建编辑器配置
            const editorConfig: Partial<IEditorConfig> = {
                placeholder: '请输入内容...',
                onChange: handleChange,
                MENU_CONF: {},
                autoFocus: false,
                scroll: true,
                maxLength: 100000,
                customAlert: (info: string, type: string) => {
                    // 自定义提示
                },
                onCreated: (editor: IDomEditor) => {
                    // 编辑器创建完成时的回调
                },
                onDestroyed: (editor: IDomEditor) => {
                    // 编辑器销毁时的回调
                },
                onMaxLength: (editor: IDomEditor) => {
                    // 达到最大长度时的回调
                }
            };

            // 创建工具栏配置
            const toolbarConfig: Partial<IToolbarConfig> = {
                excludeKeys: [] // 可以在这里配置要排除的工具栏按钮
            };

            // 创建编辑器
            const editorInstance = createEditor({
                selector: '#editor-container',
                html: '',
                config: editorConfig,
                mode: 'default'
            });

            // 创建工具栏
            const toolbarInstance = createToolbar({
                editor: editorInstance,
                selector: '#toolbar-container',
                config: toolbarConfig,
                mode: 'default'
            });

            // 设置默认段落
            editorInstance.insertText('\n');

            // 保存实例引用
            editorRef.current = editorInstance;
            toolbarRef.current = toolbarInstance;
            setEditor(editorInstance);

        } catch (error) {
            console.error('Editor initialization error:', error);
        }

        // 组件卸载时清理
        return cleanup;
    }, []); // 依赖数组为空，因为 handleChange 已经被 useCallback 包装

    // 当 onChange prop 改变时更新编辑器的 onChange 处理函数
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.on('change', handleChange);
        }
        return () => {
            if (editorRef.current) {
                editorRef.current.off('change', handleChange);
            }
        };
    }, [handleChange]);

    return (
        <div className="border rounded-lg overflow-hidden">
            <div
                id="toolbar-container"
                className="border-b"
                style={{ backgroundColor: '#fff' }}
            />
            <div
                id="editor-container"
                style={{
                    height: '400px',
                    backgroundColor: '#fff',
                    overflowY: 'auto'
                }}
                className="prose max-w-none"
            />
        </div>
    );
} 