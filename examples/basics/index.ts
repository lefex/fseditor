import { EditorState } from "prosemirror-state";
import { EditorView, DecorationSet, Decoration } from "../../node_modules/prosemirror-view/dist/index";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";

// https://github.com/ProseMirror/prosemirror-example-setup

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

    (window as any).view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins
        })
    })
}

setup();