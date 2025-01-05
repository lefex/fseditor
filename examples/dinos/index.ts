import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser, NodeSpec, Node, Attrs } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup, buildMenuItems } from "prosemirror-example-setup";
import { MenuItem } from "prosemirror-menu"

// https://github.com/ProseMirror/prosemirror-example-setup

const dinos = ["brontosaurus", "stegosaurus", "triceratops", "tyrannosaurus", "pterodactyl"];

const denoNodeSpec: NodeSpec = {
    attrs: {
        type: {
            // Node节点添加属性
            default: 'brontosaurus'
        }
    },
    // 输入inline
    inline: true,
    group: 'inline',
    draggable: true,
    // 如何转换成DOM
    toDOM: (node: Node) => {
        console.log('toDOM', node);
        return [
            'img',
            {
                "dino-type": node.attrs!.type,
                src: "/img/dino/" + node.attrs!.type + ".png",
                title: node.attrs!.type,
                class: "dinosaur"
            }
        ]
    },
    parseDOM: [{
        // 解析DOM的规则，比如复制粘贴的场景
        tag: "img[dino-type]",
        getAttrs: (node: HTMLElement | string) => {
            if (typeof node ==='string') {
                return false
            }
            let type = node.getAttribute("dino-type") || ''
            if ( dinos.indexOf(type) > -1) {
                return {
                    type
                } as Attrs
            }
            return false
        }
    }]
}

const setup = () => {
    // 定义schema
    const mySchema = new Schema({
        nodes: schema.spec.nodes.addBefore('image', 'dino', denoNodeSpec),
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

    const insertDino = (type) => {
        let dinoType = mySchema.nodes.dino;
        return function(state: EditorState, dispatch?: (tr: Transaction) => void) {
            /*
            Selection 选区
            */
            let {$from} = state.selection;
            let index = $from.index();
            if (!$from.parent.canReplaceWith(index, index, dinoType)) {
                return false;
            }
            // dispatch
            console.log('dispatch', dispatch);
            // dispatch 函数用于将一个 Transaction 对象应用到当前的 EditorState 状态上，
            // 从而改变文档内容或其他编辑器的状态
            if (dispatch) {
                // 创建一个dino node
                const dinoNode = dinoType.create({type});
                console.log('create dino node', dinoNode);
                /**
                 * 每次更改，创建一个新的Transaction，用来更新编辑器的状态
                 * 在 ProseMirror 编辑器中，EditorState.tr 是用于创建 Transaction 对象的方法。
                 * Transaction 对象是一个不可变的操作序列，可以记录对文档进行的所有更改和其他状态变化（例如选择区域和标记集合），
                 * 以及与这些更改相关的元数据。
                 * 除此之外，你还可以通过在Transaction 对象上添加元数据属性来描述这个操作所代表的信息，这些元数据可以被客户端代码或插件使用，以便它们可以相应地
                 * 更新其自己的状态。
                 */
                // 创建一个 Transaction
                const tr: Transaction = state.tr;
                console.log('create a traction', tr);
                // 返回一个新的 Transaction
                const newTr = tr.replaceSelectionWith(dinoNode);
                console.log('create a traction', newTr);
                // 发布一个dispatch，来更新状态
                dispatch(newTr)
            }
            return true;
        }
    }

    // 修改顶部工具栏
    let menu = buildMenuItems(mySchema);
    dinos.forEach(name => {
        const menuItem = new MenuItem({
            title: "Insert " + name,
            label: name.charAt(0).toUpperCase() + name.slice(1),
            enable(state) {
                return insertDino(name)(state)
            },
            run: insertDino(name)
        })
        menu.insertMenu.content.push(menuItem);
    })

    const plugins = exampleSetup({
        schema: mySchema,
        menuContent: menu.fullMenu
    });

    console.log('plugins--', plugins);

    const view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins
        })
    })
    view.hasFocus();
}

setup();