import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import {Decoration, DecorationSet} from "prosemirror-view"

// https://github.com/ProseMirror/prosemirror-example-setup
/**
 * Decoration，装饰，它并不属于文档的一部分，比如查找替换的高亮状态描述
 * Decoration 提供了一种能力，可以控制视图绘制的方法，提供了3种方式：
 * - node decoration：给节点样式，或者其它DOM属性
 * - widget decoration：在给定位置插入一个不是实际文档一部分的 DOM 节点
 * - Inline decorations：向给定范围内的所有行内节点添加样式或属性，类似于节点装饰
 *
 * 一些使用场景：
以下是一些Decorations的实际使用场景：
代码高亮：将不同类型的代码片段用不同的颜色或样式进行区分和突出显示。
拼写检查：将拼写错误的单词或短语标记出来，并可能提供纠正建议。
标签匹配：在文档中找到匹配的开始和结束标签，并用不同的颜色或样式进行标记。
表格边框：在表格周围添加边框、背景色等样式，使其更易于阅读和理解。
链接预览：当用户将鼠标悬停在链接上时，在页面的侧边栏或弹出窗口中显示链接的预览信息。
语法检查：通过分析文本内容，标记可能存在的语法错误，并可能提供修复建议。
编辑器提示：在文档中插入小部件或提示信息，以帮助用户更轻松地编辑文本内容。
 */
const placeholderPlugin = new Plugin({
    state: {
        init() {
            // 初始化为一个空的集合
            return DecorationSet.empty
        },
        apply(tr: Transaction, set: DecorationSet, oldState: EditorState, newState: EditorState) {
            // 每次有新的transition都会调用该方法
            console.log('apply transition: ', tr, set)
            set = set.map(tr.mapping, tr.doc)
            // 通过key来获取具体的meta数据
            const action = tr.getMeta(this)
            if (action && action.add) {
                let widget = document.createElement('placeholder');
                // 创建一个 Decoration.widget
                // Decoration.inline(action.add.pos, action.add.pos);
                // Decoration.node;
                let deco = Decoration.widget(action.add.pos, widget, {
                    id: action.add.id
                })
                set = set.add(tr.doc, [deco])
            }
            else if (action && action.remove) {
                // 删除一个decoration
                set = set.remove(set.find(undefined, undefined, sepc => sepc.id === action.remove.id))
            }
            return set
        },
    },
    props: {
        decorations(state: EditorState) {
            return this.getState(state)
        }
    }
})

const findPlaceholder = (state: EditorState, id: Record<string, any>) => {
    let decos = placeholderPlugin.getState(state)
    if (!decos) {
        return null
    }
    console.log('get placeholder plugin', decos)
    let found = decos.find(null, null, sepc => sepc.id === id)
    return found.length ? found[0].from : null
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

    const plugins = exampleSetup({
        schema: mySchema
    }).concat(placeholderPlugin);

    console.log('plugins--', plugins);

    const view = new EditorView(rootEl, {
        state: EditorState.create({
            doc:  DOMParser.fromSchema(mySchema).parse(contentEl),
            plugins: plugins
        })
    })
    // @ts-expect-error
    window.view = view;

    function uploadFile(file) {
        let reader = new FileReader
        return new Promise((accept, fail) => {
          reader.onload = () => accept(reader.result)
          reader.onerror = () => fail(reader.error)
          // Some extra delay to make the asynchronicity visible
          setTimeout(() => reader.readAsDataURL(file), 1500)
        })
      }

    const startImageUpload = (view: EditorView, file) => {
        console.log('start upload file', file)
        let id = {};
        let tr = view.state.tr
        if (!tr.selection.empty) {
            // 删除选区内容
            tr.deleteSelection()
        }
        // dispatch添加的transition
        tr.setMeta(placeholderPlugin, {add: {id,pos: tr.selection.from}})
        view.dispatch(tr)

        uploadFile(file).then(url => {
            console.log('upload image successful')
            // 查找要插入的位置
            let pos = findPlaceholder(view.state, id);
            if (!pos) {
                console.error('can not find pos');
                return
            }
            // 创建一个图片节点
            const imageNode = mySchema.nodes.image.create({
                src: url
            });
            // 替换成图片节点
            const transtion = view.state.tr.replaceWith(pos, pos, imageNode);
            // 设置meta信息，删除placeholder
            transtion.setMeta(placeholderPlugin, {
                remove: {
                    id
                }
            })
            view.dispatch(transtion);
        }, () => {
            console.log('upload image fail')
            // 清除placeholder
            // 设置meta信息，key为placeholderPlugin，在dispatch之前给transition添加meta数据
            // 这样可以根据meta数据做一些业务逻辑
            const transition = tr.setMeta(placeholderPlugin, {
                remove: {
                    id
                }
            })
            view.dispatch(transition)
        })
    }

    document.querySelector('#image-upload')?.addEventListener('change', (e: any) => {
        // 允许输入inline内容，而且选中了文件
        if (view.state.selection.$from.parent.inlineContent && e.target?.files?.length) {
            // 开始上传文件
            startImageUpload(view, e.target.files[0])
        }
        else {
            console.error('not find file to upload')
        }
        view.focus();
    })
}

setup();


  