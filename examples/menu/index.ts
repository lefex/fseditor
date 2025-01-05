import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import { toggleMark, setBlockType, wrapIn, selectAll } from "prosemirror-commands";

// https://github.com/ProseMirror/prosemirror-example-setup
type DispatchFn = (tr: Transaction) => void;
class MenuItem {
    dom: HTMLElement;
    command: (state: EditorState, dispatch: DispatchFn | null, editorView: EditorView) => boolean;
}

// Helper function to create menu icons
function icon(text, name) {
    let span = document.createElement("span")
    span.className = "menuicon " + name
    span.title = name
    span.textContent = text
    return span
}

class MenuView {
    dom: HTMLElement;
    items: MenuItem[];
    editorView: EditorView;
    constructor(items: MenuItem[], editorView: EditorView) {
        this.items = items;
        this.editorView = editorView;

        this.dom = document.createElement('div');
        this.dom.classList.add('menubar')
        items.forEach((item) => {
            this.dom.appendChild(item.dom);
        });

        this.dom.addEventListener('mousedown', (e: MouseEvent) => {
            // 这个作用非常大，可以阻止失去焦点
            e.preventDefault();
            editorView.focus();

            items.forEach(item => {
                let {dom, command} = item;
                if (dom.contains(e.target as Node)) {
                    console.log('click', e.target)
                    command(editorView.state, editorView.dispatch, editorView);
                }
            })
        });
    }

    update() {
        this.items.forEach(item => {
            const {dom, command} = item;
            const active = command(this.editorView.state, null, this.editorView);
            if (active) {
                dom.classList.add('active');
            }
            else {
                dom.classList.remove('active');
            }
        })
    }

    destroy() {
        this.dom.remove();
    }
}

const setup = () => {
    // 定义schema
    const mySchema = new Schema({
        nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
        marks: schema.spec.marks
    })

    // Create an icon for a heading at the given level
    function heading(level) {
        return {
            command: setBlockType(mySchema.nodes.heading, {level}),
            dom: icon("H" + level, "heading")
        }
    }

    /**
     * command:
     * toggleMark设置mark
     * setBlockType：设置block的type
     * wrapIn：进行包裹
     *
     * mark是应用到文本上的标记，可以用了装饰node
     * node是文档的结构
     */

    let menus = [
        {command: toggleMark(mySchema.marks.strong), dom: icon("B", "strong")},
        {command: toggleMark(mySchema.marks.em), dom: icon("i", "em")},
        {command: setBlockType(mySchema.nodes.paragraph), dom: icon("p", "paragraph")},
        heading(1), heading(2), heading(3),
        {command: wrapIn(mySchema.nodes.blockquote), dom: icon(">", "blockquote")}
    ]

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

    const menuPlgun = new Plugin({
        view(editorView: EditorView) {
            let view =  new MenuView(menus, editorView);
            editorView.dom.parentNode?.insertBefore(view.dom, editorView.dom)
            return view;
        }
    })

    console.log('plugins--', plugins);

    let view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: [menuPlgun]
        })
    })
    const all = selectAll(view.state);
    toggleMark(mySchema.marks.strong);
}

setup();