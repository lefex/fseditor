import { EditorState } from "prosemirror-state";
import { EditorView, Decoration, DecorationSource } from "prosemirror-view";
import { Schema, DOMParser, Node, NodeSpec } from "prosemirror-model";
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from "prosemirror-commands";
import { Resizeable } from '../utils/resizeableEl';

// https://github.com/ProseMirror/prosemirror-example-setup

declare global {
    interface Window {
      pmView: EditorView;
    }
}

const PMImageNodeSchema: NodeSpec = {
    attrs: {
        src: {},
        alt: {default: null},
        width: {default: null},
        align: {default: 'left'},
    },
    group: "block",
    draggable: true,
    selectable: false,
    // content: "text*",
    parseDOM: [{tag: "img[src]", getAttrs(dom: any) {
        return {
            src: dom.getAttribute("src"),
            title: dom.getAttribute("title"),
            alt: dom.getAttribute("alt")
        }
    }}],
    toDOM(node: any) {
        console.log("call image schema toDOM", node);
        return ["img", node.attrs]
    }
};

/**
 * 自定义图片节点视图
 */
class PMImageNodeView {
    // 最终要渲染的dom节点
    dom: HTMLElement;
    // 图片节点
    imageEl!: HTMLImageElement;
    // 可编辑内容的渲染
    contentDOM: HTMLParagraphElement | null = null;
    node: Node;
    view: EditorView;
    getPos: () => number | undefined;

    constructor(
        node: Node, // 通过schema定义的节点
        view: EditorView,
        getPos: () => number | undefined,
        decorations: readonly Decoration[] = [],
        innerDecorations?: DecorationSource) {
        console.log('create image node view', node);
        this.node = node;
        this.view = view;
        this.getPos = getPos;
        this.render(node);
    }

    render(node: Node) {
        const blockEl = document.createElement("div");
        // blockEl.contentEditable = "false";
        blockEl.classList.add('pm-image-block');

        const imageWrapper = document.createElement("div");
        // imageWrapper.contentEditable = "false";
        imageWrapper.classList.add('pm-image-wrapper');
        blockEl.appendChild(imageWrapper);


        const resizableWrapper = document.createElement("div");
        resizableWrapper.classList.add('pm-image-resizable');
        imageWrapper.appendChild(resizableWrapper);

        const imageEl = document.createElement("img");
        imageEl.src = node.attrs.src;
        imageEl.alt = node.attrs.alt;
        imageEl.style.width = '100%';
        imageEl.addEventListener("click", this.onClick);
        imageEl.onload = () => {
            const width = imageEl.width;
            console.log("image width", width);
        };
        resizableWrapper.appendChild(imageEl);

        const altEl = document.createElement("p");
        // altEl.contentEditable = "true";
        altEl.textContent = node.attrs.alt;
        altEl.classList.add('pm-image-alt');
        blockEl.appendChild(altEl);

        // contentDOM 这个有非常大的作用，直接影响元素是否可编辑
        // this.contentDOM = altEl;
        this.dom = blockEl;
        this.imageEl = imageEl;

        setTimeout(() => {
            Resizeable(resizableWrapper);
        }, 0);
    }

    onClick = (e: MouseEvent) => {
        console.log("onClick", e);
    }

    update(node: any) {
        if (node.type !== this.node.type) {
            return false;
        }

        this.node = node;
        this.imageEl.src = node.attrs.src;
        this.imageEl.alt = node.attrs.alt;
        return true;
    }

    ignoreMutation() {
        console.log("ignoreMutation");
        return true;
    }

    destroy() {
        this.imageEl.removeEventListener("click", this.onClick);
    }
}

const setup = () => {
    // 定义schema
    const schema = new Schema({
        nodes: {
            doc: {
                content: "block+"
            },
            paragraph: {
                content: "text*",
                group: "block",
                parseDOM: [{tag: "p"}],
                toDOM() { return ["p", 0] }
            },
            image: PMImageNodeSchema,
            text: {
                group: "inline"
            }
        }
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

    const state = EditorState.create({
        doc:  DOMParser.fromSchema(schema).parse(contentEl),
    });

    const pmview: EditorView = new EditorView(rootEl, {
        state: state,
        plugins: [
            // 处理键盘事件，没有这个插件时，回车、删除这些键盘事件无法正常工作
            keymap(baseKeymap)
        ],
        nodeViews: {
            image(node) {
                return new PMImageNodeView(node, pmview, () => {
                    return pmview.state.doc.nodeSize;
                });
            }
        },
        dispatchTransaction(transaction) {
            // 这个调用的非常频繁
            console.log("dispatchTransaction", transaction);
            const newState = pmview.state.apply(transaction);
            pmview.updateState(newState);
        }
    });

    const imageEl = document.querySelector(".image-btn");
    imageEl?.addEventListener("click", (e) => {
        e.preventDefault();
        // 插入一个图片节点
        const imageNode = schema.nodes.image.create({
            src: "/yang.png",
            alt: "baidu",
            width: '300'
        });
        // 创建一个事务
        const stateTransaction = pmview.state.tr;
        // 当前选区
        const selection = pmview.state.selection;
        console.log("selection from - to:", selection.from, selection.to);
        stateTransaction.insert(selection.from, imageNode);
        // 应用事务
        pmview.dispatch(stateTransaction);
    });

    window.pmView = pmview;
}

setup();