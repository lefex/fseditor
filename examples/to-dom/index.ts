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
            card: {
                content: "paragraph+",
                group: "block",
                toDOM() {
                    /**
                     * 直接返回一个div元素，该div元素是无法编辑的
                     */
                    const cardEl = document.createElement("div");
                    cardEl.style.border = "1px solid #000";
                    const cardContent = document.createElement("div");
                    cardEl.appendChild(cardContent);
                    const pel = document.createElement("p");
                    const text = document.createTextNode("这是一个卡片");
                    pel.appendChild(text);
                    cardContent.appendChild(pel);
                    // return cardEl;

                    const content = ['div', {class: 'card-content'}, 0];
                    const sub = ['div', {class: 'card-content-wrapper'}, content];
                    return ['div', {class: 'card', 'card-type': 'normal'}, sub, ['div', {class: 'card-footer'}]];
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

    const createP = (text: string) => {
        return schema.node("paragraph", null, [schema.text(text)]);
    }

    const p1 = schema.node("paragraph", {
        align: "center"
    }, [
        schema.text("你好"),
        schema.text("ProseMirror", [schema.mark("strong")])
    ]);
    const p2 = createP("这是一个段落");
    const card = schema.node("card", null, [createP('卡片内容')]);

    let doc = schema.node("doc", null, [
        p1,
        p2,
        card
    ]);
    console.log(doc);

    drawDocTree(doc);

    const rootEl = document.querySelector("#editor");
    const view = new EditorView(rootEl, {
        state: EditorState.create({
            doc: doc
        })
    })
}

setup();