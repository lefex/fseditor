import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { drawDocTree } from '../utils/drawDocTree';
// https://github.com/ProseMirror/prosemirror-example-setup

const setup = () => {
    // 定义schema
    const schema = new Schema({
        nodes: {
            doc: {
                content: "block+"
            },
            paragraph: {
                group: "block",
                content: "text*",
                attrs: {
                    align: {
                        default: "left"
                    }
                },
                toDOM(node) {
                    return ["p", { style: `text-align: ${node.attrs.align}` }, 0]
                }
            },
            text: {
                inline: true
            }
        },
        marks: {
            strong: {
                toDOM() {
                    return ['strong', 0]
                }
            }
        },
        topNode: 'doc'
    });

    const p1 = schema.node("paragraph", {
        align: "center"
    }, [
        schema.text("你好"),
        schema.text("ProseMirror", [schema.mark("strong")])
    ]);
    const p2 = schema.node("paragraph", null, [schema.text("这是一个段落")]);
    let doc = schema.node("doc", null, [
        p1,
        p2
    ]);
    console.log(doc);

    drawDocTree(doc);

    doc.descendants((node, pos) => {
        console.log(node.type.name, pos);
    });

    const rootEl = document.querySelector("#editor");
    const view = new EditorView(rootEl, {
        state: EditorState.create({
            doc: doc
        })
    })
}

setup();