import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";

// https://github.com/ProseMirror/prosemirror-example-setup

class SelectionSizeTooltip {
    tooltip: HTMLElement;

    constructor(view: EditorView) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        view.dom.parentNode?.appendChild(this.tooltip);

        this.update(view)
    }

    update(view: EditorView, lastState?: EditorState) {
        const state = view.state;
        if (lastState
            && lastState.doc.eq(state.doc)
            && lastState.selection.eq(state.selection)) {
            // doc 或者selection未发生任何改变，不做任何处理
            return;
        }

        if (state.selection.empty) {
            // 没有选中，则不显示tooltipx
            this.tooltip.style.display = 'none';
            return;
        }

        this.tooltip.style.display = '';
        // 选区的起点和终点
        const {from, to} = state.selection;
        // 根据选区来获取具体坐标
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const box = this.tooltip.offsetParent!.getBoundingClientRect();
        let left = Math.max((start.left + end.left) / 2, start.left + 3)
        this.tooltip.style.left = (left - box.left) + "px"
        this.tooltip.style.bottom = (box.bottom - start.top) + "px"
        this.tooltip.textContent = `${to - from}`
    }

    destroy() {
        this.tooltip.remove();
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

    // 创建一个选区的插件，需要学会如何创建一个插件
    const selectionSizePlugin = new Plugin({
        // 当需要与editor view 交互时，可以使用这个函数，返回一个 PluginView
        view(view) {
            return new SelectionSizeTooltip(view);
        },
    })

    const plugins = exampleSetup({
        schema: mySchema
    }).concat(selectionSizePlugin);

    console.log('plugins--', plugins);

    (window as any).view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins
        })
    })
}

setup();