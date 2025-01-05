import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { exampleSetup } from "prosemirror-example-setup";
import { findWrapping} from "prosemirror-transform"
import {keymap} from "prosemirror-keymap"
import { toggleMark } from 'prosemirror-commands';

// https://github.com/ProseMirror/prosemirror-example-setup

const setup = () => {
    // 最简单的schema，只允许输入文字
    let mySchema = new Schema({
        nodes: {
            text: {},
            doc: {content: 'text*'}
        }
    })

    // 分组
    mySchema = new Schema({
        nodes: {
            text: {},
            note: {
                content: 'text*',
                toDOM() {
                    return ['note', 0]
                },
                parseDOM: [{
                    tag: 'note'
                }]
            },
            noteGroup: {
                content: 'note+',
                toDOM() {
                    return ['noteGroup', 0]
                },
                parseDOM: [{tag: 'noteGroup'}]
            },
            doc: {
                content: '(note | noteGroup)+'
            }
        }
    });

    mySchema = new Schema({
        nodes: {
            doc: {
                content: 'block+'
            },
            text: {
                group: 'inline',
            },
            star: {
                inline: true,
                // 作为inline分组
                group: 'inline',
                toDOM() {
                    return ['star', "🟊"]
                },
                parseDOM: [{tag:'star'}]
            },
            paragraph: {
                group: 'block',
                content: 'inline*',
                toDOM() {
                    return ['p', 0]
                },
                parseDOM: [{tag:'p'}]
            },
            boring_paragraph: {
                group: 'block',
                content: 'text*',
                marks: '',
                toDOM() {
                    return ['p', {class: 'boring'}, 0]
                },
                parseDOM: [{tag: 'p.boring', priority: 60}]
            }
        },
        marks: { // 定义mark
            shouting: {
                toDOM() {
                    return ['shouting', 0]
                },
                parseDOM: [{tag:'shouting'}]
            },
            link: {
                attrs: { href: {} },
                toDOM(node) {
                    return ['a', {href: node.attrs.href}, 0]
                },
                parseDOM: [{
                    tag: 'a',
                    getAttrs(dom) {
                        return {href: (dom as HTMLLinkElement).href}
                    }
                }],
                // 是否为包裹的，意味着该mark后面的内容或者位于父节点开头除是否会自动包裹
                inclusive: false
            }
        }
    });

    const makeNoteGroup = (state: EditorState, dispatch: (tr: Transaction) => void | undefined) => {
        // https://prosemirror.net/docs/ref/#model.Node.resolve
        /**
         * state.selection.$from 起点 ResolvePos
         * state.selection.$to 终点 ResolvePos
         * 获取选中block的range
         */
        let range = state.selection.$from.blockRange(state.selection.$to)
        console.log('makeNoteGroup range', range)
        if (range) {
            // See if it is possible to wrap that range in a note group
            let wraping = findWrapping(range, mySchema.nodes.noteGroup)
            console.log('makeNoteGroup wraping', wraping)
            if (!wraping) {
                return false
            }
            if (dispatch) {
                // 进行合并
                // tr就是transform，会包含很多方法进行合并操作
                dispatch(state.tr.wrap(range, wraping).scrollIntoView())
            }
            return true
        }
        return false
    }

    const toggleLink =  (state: EditorState, dispatch: (tr: Transaction) => void | undefined) => {
        console.log('toggleLink')
        let {doc, selection} = state
        if (selection.empty) {
            return false
        }
        let attrs: null | {href: string | null} = null
        // 判断选区是否有link
        if (!doc.rangeHasMark(selection.from, selection.to, mySchema.marks.link)) {
            attrs = {
                href: prompt('Enter the URL', '')
            }
            if (!attrs.href) {
                return false
            }
        }
        // 添加或删除link
        return toggleMark(mySchema.marks.link, attrs)(state, dispatch)
    }

    // 创建一个star mark
    const insertStar =  (state: EditorState, dispatch: (tr: Transaction) => void | undefined) => {
        console.log('insertStar')
        let type = mySchema.nodes.star;
        let {$from} = state.selection;
        if (!$from.parent.canReplaceWith($from.index(), $from.index(), type)) {
            return false
        }
        if (dispatch) {
            dispatch(state.tr.replaceSelectionWith(type.create()))
        }
        return true
    }

    const rootEl = document.querySelector("#editor");
    if (!rootEl) {
        console.error("Could not find root element");
        return;
    }

    const contentEl = document.querySelector("#content");
    if (!contentEl) {
        console.error("Could not find content element");
        return;
    }

    const plugins = exampleSetup({
        schema: mySchema
    });

    console.log('plugins--', plugins);

    (window as any).view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins.concat([
                keymap(
                    {
                        'Mod-n': makeNoteGroup,
                        'Mod-l': toggleMark(mySchema.marks.shouting),
                        'Mod-/': toggleLink,
                        'Mod-g': insertStar,
                    }
                )
            ])
        })
    })
}

setup();