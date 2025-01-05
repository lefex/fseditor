import { EditorState, Transaction } from "prosemirror-state";
import { EditorView, DecorationSet, Decoration } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";

// https://github.com/ProseMirror/prosemirror-example-setup

const setup = () => {
    // 定义schema
const mySchema = new Schema({
    nodes: {
        doc: {
            // 至少有一个card
            content: "card+"
        },
        card: {
            // 至少有一个block
            content: "block+",
            attrs: {
                id: {
                    default: 1
                },
                layout: {
                    default: 'blank'
                }
            },
            parseDOM: [{
                tag: 'div',
                getAttrs(dom: any) {
                    return {
                        id: dom.getAttribute('id')
                    }
                }
            }],
            /**
             * 转换成HTML的规则
             * @param node 
             * @returns 
             */
            toDOM(node) {
                return ['div', {
                    id: node.attrs.id,
                    layout: node.attrs.layout,
                    class: "card-wrapper",
                    style: "border: 1px solid red"
                }, 0]
            }
        },
        heading: {
            group: "block",
            content: "inline*",
            marks: "_",
            attrs: {
                level: {
                    default: 1
                }
            },
            parseDOM: [
                {tag: 'h1', attrs: {level: 1}},
                {tag: 'h2', attrs: {level: 2}},
                {tag: 'h3', attrs: {level: 3}},
                {tag: 'h4', attrs: {level: 4}},
                {tag: 'h5', attrs: {level: 5}},
                {tag: 'h6', attrs: {level: 6}}
            ],
            toDOM(node) {
                return ['h' + node.attrs.level, {level: node.attrs.level}, 0]
            }
        },
        paragraph: {
            content: "inline*",
            group: "block",
            marks: "_",
            toDOM(node) {
                return ['p', 0]
            },
            parseDOM: [
                {tag: "p"}
            ]
        },
        image: {
            inline: true,
            attrs: {
                src: {},
                alt: {default: null},
                title: {default: null}
            },
            group: "inline",
            draggable: true,
            parseDOM: [{
                tag: "img[src]",
                getAttrs(dom: any) {
                    return {
                        src: dom.getAttribute("src"),
                        title: dom.getAttribute("title"),
                        alt: dom.getAttribute("alt")
                    }
                }
            }],
            toDOM(node) {
                let {src, alt, title} = node.attrs
                return ["img", {src, alt, title}]
            }
        },
        blockquote: {
            group: "block", content: "block+"
        },
        text: {
            group: 'inline',
            inline: true
        }
    },
    marks: {
        link: {
            attrs: {
                href: {},
                title: {default: null}
            },
            inclusive: false,
            toDOM(node) {
                return ['a', {
                    href: node.attrs.href,
                    title: node.attrs.title
                }, 0]
            },
            parseDOM: [{
                tag: 'a',
                getAttrs(dom: HTMLElement) {
                    return {
                        href: dom.getAttribute('href'),
                        title: dom.getAttribute('title')
                    }
                }
            }]
        },
        em: {
            parseDOM: [
                {tag: 'i'},
                {tag: 'em'},
                {style: 'font-style=italic'}
            ],
            toDOM() {
                return ['em', 0]
            }
        },
        strong: {
            parseDOM: [
                {tag: 'strong'},
                {tag: 'b'}
            ]
        }

    },
    topNode: 'doc'
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

    // 插入一个card
    const insertCard = () => {
        const cardNode = mySchema.nodes.card.create({
            id: 2,
            layout: 'left'
        });
        const state = (window as any).view.state;
        const { $to } = state.selection;
        const positionToInsert = $to.end();

        const tr = state.tr.insert(positionToInsert, cardNode);
        state.apply(tr);
    }

    const insertCardCommand = (state: EditorState, dispatch: (tr: Transaction) => boolean) => {

    };

    setTimeout(() => {
        insertCard();
    }, 100);
}

setup();