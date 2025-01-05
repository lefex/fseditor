import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser, Node } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import {exitCode} from "prosemirror-commands"
import {undo, redo} from "prosemirror-history"

import { EditorView as CodeMirror, keymap as cmKeymap, drawSelection, ViewUpdate } from "@codemirror/view";
import {javascript} from "@codemirror/lang-javascript"
import {defaultKeymap} from "@codemirror/commands"
import {syntaxHighlighting, defaultHighlightStyle} from "@codemirror/language"

// https://github.com/ProseMirror/prosemirror-example-setup
class CodeBlockView {
    node: Node;
    view: EditorView;
    getPos: () => number;
    cm: CodeMirror;
    dom: HTMLElement;
    updating: boolean;

    constructor(node: Node, view: EditorView, getPos) {
        this.node = node
        this.view = view
        this.getPos = getPos

        this.cm = new CodeMirror({
            doc: this.node.textContent,
            extensions: [
                cmKeymap.of([
                    ...defaultKeymap
                ]),
                drawSelection(),
                syntaxHighlighting(defaultHighlightStyle),
                javascript(),
                CodeMirror.updateListener.of(update => this.forwardUpdate(update))
            ]
        })

        this.dom = this.cm.dom
        this.updating = false
    }

    forwardUpdate(update: ViewUpdate) {
        if (this.updating || !this.cm.hasFocus) {
            return
        }
        let offset = this.getPos() + 1;
        let {main} = update.state.selection;
        let selFrom = offset + main.from;
        let selTo = offset + main.to;
        let pmSel = this.view.state.selection
        if (update.docChanged || pmSel.from != selFrom || pmSel.to!= selTo) {
            let tr = this.view.state.tr
            update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
                if (text.length) {
                    tr.replaceWith(offset + fromA, offset + toA, this.view.state.schema.text(text.toString()))
                }
                else {
                    tr.delete(offset + fromA, offset + toA)
                }
                offset += (toB - fromB) - (toA - fromA)
            })
            tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
            this.view.dispatch(tr)
        }
    }

    setSelection(anchor, head) {
        this.cm.focus()
        this.updating = true
        this.cm.dispatch({
            selection: {
                anchor,
                head
            }
        })
        this.updating = false
    }

    myabeEscape(unit, dir) {

    }

    codeMirrorKeymap() {
        let view = this.view
        return [
            {key: 'ArrowUp', run: () => this.myabeEscape('line', -1)},
            {key: 'ArrowLeft', run: () => this.myabeEscape('char', -1)},
            {key: 'ArrowDown', run: () => this.myabeEscape('line', 1)},
            {key: 'ArrowRight', run: () => this.myabeEscape('char', 1)},
            {key: "Ctrl-Enter", run: () => {
                if (!exitCode(view.state, view.dispatch)) {
                    return false
                }
                view.focus()
                return true
            }},
            {key: "Ctrl-z", mac: "Cmd-z",  run: () => undo(view.state, view.dispatch)},
            {key: "Shift-Ctrl-z", mac: "Shift-Cmd-z", run: () => redo(view.state, view.dispatch)},
            {key: "Ctrl-y", mac: "Cmd-y",run: () => redo(view.state, view.dispatch)}
        ]
    }
}

const setup = () => {
    // 定义schema
    const mySchema = new Schema({
        nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
        marks: schema.spec.marks
    })

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

    const pmview = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins
        }),
        nodeViews: {
            code(node) {
                return new CodeBlockView(node, pmview, () => {
                    return pmview.state.doc.nodeSize;
                });
            }
        },
    })
}

setup();