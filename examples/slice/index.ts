import { EditorState } from "prosemirror-state";
import { EditorView, Decoration, DecorationSet } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { drawDocTree } from '../utils/drawDocTree';
import { tableEditing, columnResizing, tableNodes, fixTables } from 'prosemirror-tables';
// https://github.com/ProseMirror/prosemirror-example-setup

const setup = () => {
    const tableNode = tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
        cellAttributes: {
          background: {
            default: null,
            getFromDOM(dom) {
              return dom.style.backgroundColor || null;
            },
            setDOMAttr(value, attrs) {
              if (value)
                attrs.style = (attrs.style || '') + `background-color: ${value};`;
            },
          },
        },
      });
    // 定义schema
    const schema = new Schema({
        nodes: {
            doc: {
                content: "block+ | table+"
            },
            paragraph: {
                content: "(text | img)*",
                group: "block",
                toDOM(node) {
                    return ["p", 0]
                }
            },
            blockquote: {
                content: "paragraph+",
                group: "block",
                toDOM() {
                    return ["blockquote", 0]
                }
            },
            card: {
                content: "paragraph+",
                group: "block",
                toDOM() {
                    const content = ['div', {class: 'card-content'}, 0];
                    const sub = ['div', {class: 'card-inner'}, content];
                    return ['div', {class: 'card', 'card-type': 'normal'}, sub, ['div', {class: 'card-footer'}]];
                }
            },
            ...tableNode,
            img: {
                inline: true,
                attrs: {
                    src: {}
                },
                group: "inline",
                toDOM(node) {
                    return ["img", { src: node.attrs.src }]
                }
            },
            text: {
                inline: true
            }
        },
        topNode: 'doc'
    });

    console.log('tableNode', tableNode)

    const p1 = schema.node("paragraph", null, [
        schema.text("123"),
    ]);
    const p2 = schema.node("paragraph", null, [
        schema.text("789"),
        schema.node("img", {src: "https://www.baidu.com/favicon.ico"}),
        schema.text("A"),
    ]);
    const blockquote = schema.node("blockquote", null, [p2]);

    const tableContent = (text: string) => {
        const p = schema.node("paragraph", null, [
            schema.text(text),
        ]);
        return p;
    };
    const createTd = (text: string) => {
        return schema.node("table_cell", null, [tableContent(text)]);
    }
    const card = schema.node("card", null, [
        tableContent('card')
    ]);
    const table = schema.node("table", null, [
        schema.node("table_row", null, [
            createTd('A'),
            createTd('B'),
        ]),
        schema.node("table_row", null, [
            createTd('EF'),
            createTd('GHJ'),
        ]),
    ]);
    let doc = schema.node("doc", null, [
        p1,
        blockquote,
        table,
        tableContent('end'),
        card
    ]);
    console.log(doc);
    const slice = doc.slice(0, 3);
    console.log(slice, slice.toJSON());

    drawDocTree(doc);

    const rootEl = document.querySelector("#editor");
    const view = new EditorView(rootEl, {
        state: EditorState.create({
            doc: doc
        }),
        dispatchTransaction(transaction) {
            const newState = view.state.apply(transaction);
            if (transaction) {
                const from = transaction.selection.from;
                const el = document.getElementById('selection-value') as HTMLElement;
                el.innerText = from.toString();
            }
            view.updateState(newState);
        }
    })
    window.view = view;
}

setup();