import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import {Decoration, DecorationSet} from "prosemirror-view"
import {Plugin} from "prosemirror-state"

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

    const paragraphDecorationPlugin = new Plugin({
        state: {
            init(_, {doc}) {
                let speackles: Decoration[] = [];
                for (let i = 0; i < doc.content.size; i++) {
                    speackles.push(Decoration.inline(i, i + 1, {class: 'red-bg'}))
                }
                return DecorationSet.create(doc, speackles);
            },
            apply(tr, set) {
                set = set.map(tr.mapping, tr.doc);
                const decortaions: Decoration[] = [];
                tr.doc.descendants((node, pos) => {
                    console.log('node--', node.type.name, node.textContent);
                    if (node.type.name === 'paragraph') {
                       if (node.textContent === '红色') {
                           decortaions.push(
                            Decoration.node(pos, pos + node.nodeSize, {class: 'red-bg'})
                        )
                       }
                    }
                });
                console.log('decortaions--', decortaions);
                return set;
            }
        },
        props: {
            decorations(state) {
                const set = this.getState(state);
                console.log('decorations set--', set);
                return set;
            },
        }
    });

    const plugins = exampleSetup({
        schema: mySchema
    });

    console.log('plugins--', plugins);

    (window as any).view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins.concat([paragraphDecorationPlugin])
        }),
        decorations(state: EditorState) {
            const set = DecorationSet.create(state.doc, [
                // 创建一个节点装饰项。from 和 to 应该精确地指向文档中的一个节点之前和之后。只有该节点，且仅有该节点，将接收给定的属性。
                Decoration.node(1, 3, {style: 'color: red;'})
            ]);
            return set;
        }
        // decorations(state: EditorState) {
        //     // inline decoration
        //     const set = DecorationSet.create(state.doc, [
        //         Decoration.inline(1, 3, {style: 'color: red;'})
        //     ]);
        //     return set;
        // }
    })
}

setup();