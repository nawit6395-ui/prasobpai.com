'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Mark, mergeAttributes } from '@tiptap/core';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
    Image as ImageIcon, Youtube as YoutubeIcon, Code,
    Undo, Redo, MapPin, Smile, EyeOff, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

// 1. Define Spoiler Extension
const Spoiler = Mark.create({
    name: 'spoiler',

    addAttributes() {
        return {
            class: {
                default: 'spoiler',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: (element) => (element.classList.contains('spoiler') && null),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            toggleSpoiler: () => ({ commands }) => {
                return commands.toggleMark(this.name);
            },
        };
    },
});

const MenuBar = ({ editor, onAddImage, onAddYoutube, onSetLink, onAddEmoji }) => {
    if (!editor) return null;

    const btnClass = (isActive = false) =>
        `p-2 rounded hover:bg-slate-700 transition-colors ${isActive ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`;

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-800 border-b border-slate-700 rounded-t-lg items-center">
            {/* History */}
            <div className="flex gap-1 border-r border-slate-600 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnClass()}>
                    <Undo size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnClass()}>
                    <Redo size={18} />
                </button>
            </div>

            {/* Media */}
            <div className="flex gap-1 border-r border-slate-600 pr-2 mr-1">
                <button type="button" onClick={onAddImage} className={btnClass()} title="Upload Image">
                    <ImageIcon size={18} />
                </button>
                <button type="button" onClick={onAddYoutube} className={btnClass(editor.isActive('youtube'))} title="Embed YouTube">
                    <YoutubeIcon size={18} />
                </button>
                <button type="button" className={`opacity-50 cursor-not-allowed ${btnClass()}`} title="Location (Coming Soon)">
                    <MapPin size={18} />
                </button>
                <button type="button" onClick={onAddEmoji} className={btnClass()} title="Emoji">
                    <Smile size={18} />
                </button>
            </div>

            {/* Formatting */}
            <div className="flex gap-1 border-r border-slate-600 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>
                    <Bold size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>
                    <Italic size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))}>
                    <UnderlineIcon size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))}>
                    <Strikethrough size={18} />
                </button>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r border-slate-600 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))}>
                    <AlignLeft size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))}>
                    <AlignCenter size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))}>
                    <AlignRight size={18} />
                </button>
            </div>

            {/* Links & Extras */}
            <div className="flex gap-1">
                <button type="button" onClick={onSetLink} className={btnClass(editor.isActive('link'))}>
                    <LinkIcon size={18} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))}>
                    <Code size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleSpoiler().run()}
                    className={btnClass(editor.isActive('spoiler'))}
                    title="Spoiler Tag"
                >
                    <EyeOff size={18} /> <span className="text-xs font-bold ml-1">spoil</span>
                </button>
            </div>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, userId }) {

    const uploadImage = async (file) => {
        if (!userId) {
            Swal.fire('กรุณาเข้าสู่ระบบ', 'ต้องเข้าสู่ระบบก่อนอัพโหลดรูป', 'warning');
            return null;
        }
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire('ไฟล์ใหญ่เกินไป', 'ขนาดรูปต้องไม่เกิน 5MB', 'warning');
            return null;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('story-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('story-images').getPublicUrl(filePath);
            return data.publicUrl;

        } catch (error) {
            console.error('Upload error:', error);
            if (error.message.includes('Bucket')) {
                Swal.fire('Error', 'Bucket "story-images" missing. Please run the SQL script.', 'error');
            } else {
                Swal.fire('Error', 'อัพโหลดรูปไม่สำเร็จ', 'error');
            }
            return null;
        }
    };

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Spoiler,
            Image.configure({
                inline: true,
                allowBase64: false,
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        width: {
                            default: '100%',
                            renderHTML: attributes => ({
                                width: attributes.width,
                                style: `width: ${attributes.width}`
                            }),
                        },
                    };
                },
            }),
            Youtube.configure({
                controls: false,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
            }),
            CharacterCount.configure({
                limit: 10000,
            }),
            Placeholder.configure({
                placeholder: 'เขียนเรื่องราวของคุณที่นี่...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] text-slate-300',
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        uploadImage(file).then((url) => {
                            if (url) {
                                const { schema } = view.state;
                                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.insert(coordinates.pos, node);
                                view.dispatch(transaction);
                            }
                        });
                        return true;
                    }
                }
                return false;
            }
        },
    });

    const handleAddYoutube = async () => {
        const { value: url } = await Swal.fire({
            title: 'ใส่ลิงก์ YouTube',
            input: 'url',
            inputPlaceholder: 'https://www.youtube.com/watch?v=...',
            showCancelButton: true,
            confirmButtonText: 'ฝังคลิป',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#0f172a',
            background: '#fff',
        });

        if (url && editor) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const handleSetLink = async () => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;

        const { value: url } = await Swal.fire({
            title: 'ใส่ลิงก์',
            input: 'url',
            inputValue: previousUrl,
            inputPlaceholder: 'https://example.com',
            showCancelButton: true,
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#0f172a',
        });

        if (url === undefined) return;

        if (url === null || url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleAddEmoji = () => {
        const emojiList = ['😀', '😂', '😍', '😭', '😡', '👍', '👎', '🎉', '❤️', '🔥', '✨', '🌟', '🍕', '🚗', '🐶', '🐱', '✅', '❌', '💀', '👻'];
        Swal.fire({
            title: 'เลือกอิโมจิ',
            html: `
                <div id="emoji-grid" class="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1">
                    ${emojiList.map(e =>
                `<button type="button" class="emoji-btn text-2xl p-2 hover:bg-slate-100 rounded transition-colors w-full aspect-square flex items-center justify-center">${e}</button>`
            ).join('')}
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#0f172a',
            didOpen: () => {
                const container = document.getElementById('emoji-grid');
                if (container) {
                    const buttons = container.querySelectorAll('.emoji-btn');
                    buttons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const emoji = btn.textContent;
                            Swal.close();
                            if (editor) {
                                editor.chain().focus().insertContent(emoji).run();
                            }
                        });
                    });
                }
            }
        });
    };

    const handleImageBtn = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target).files?.[0];
            if (file) {
                const url = await uploadImage(file);
                if (url && editor) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            }
        };
        input.click();
    };

    return (
        <div
            className="bg-[#0f242a] border border-slate-700 rounded-lg overflow-hidden shadow-inner"
            onClick={(e) => {
                const target = e.target; // Simple HTMLElement
                if (target.classList.contains('spoiler')) {
                    target.classList.toggle('is-revealed');
                }
            }}
        >
            <MenuBar
                editor={editor}
                onAddImage={handleImageBtn}
                onAddYoutube={handleAddYoutube}
                onSetLink={handleSetLink}
                onAddEmoji={handleAddEmoji}
            />

            <div className="bg-[#163038] text-slate-200 p-2 min-h-[350px]">
                <EditorContent editor={editor} />
            </div>
            <div className="bg-[#0f242a] px-4 py-2 text-xs text-slate-400 border-t border-slate-800 flex justify-between">
                <span>* พิมพ์ข้อความได้ไม่เกิน 10,000 ตัวอักษร</span>
                <span>{editor?.storage.characterCount.characters() || 0} / 10000</span>
            </div>
        </div>
    );
}
