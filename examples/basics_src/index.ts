import { EditorState } from "../../pmsrc/prosemirror-state/src/index";
import { EditorView } from "../../pmsrc/prosemirror-view/src/index";
import { Schema, DOMParser } from "../../pmsrc/prosemirror-model/src/index";

// https://github.com/ProseMirror/prosemirror-example-setup

const setup = () => {
    // 定义schema
    const mySchema = new Schema({
        nodes: {
            doc: {
                content: "paragraph+"
            },
            paragraph: {
                group: "block",
                content: "text*",
                toDOM(node) {
                    return ['p', 0]
                }
            },
            text: {
                inline: true
            }
        },
        marks: {
    
        },
        topNode: 'doc'
    });

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

    (window as any).view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl)
        })
    })
}

setup();