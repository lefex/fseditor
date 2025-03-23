import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";
import { isNodeEmpty } from "../../helper/isNodeEmpty";

const placeholderMap: Record<string, any> = {
  pargraph: `输入"/"快速插入内容`,
  title: "请输入标题"
};

/**
 * 标题只要内容为空时，就要显示placeholder
 * 内容，内容为空且当前光标在该节点内时，就要显示placeholder
 * @returns 
 */
export function createPlaceholderPlugin() {
  return new Plugin({
    key: new PluginKey("pmplaceholder"),
    props: {
      decorations(state) {
        const { doc, selection } = state;
        // 创建一个空的DecorationSet
        const decorations: Decoration[] = []
        // 遍历文档的所有后代节点
        doc.descendants((node, pos) => {
          const isEmpty = !node.isLeaf && isNodeEmpty(node);
          console.log('isEmpty', node, isEmpty, pos);
          const addPlaceHolder = () => {
            const nodeDecoration = Decoration.node(pos, pos + node.nodeSize, {
              // 给DOM添加的空class
              class: 'pm-is-empty',
              // 添加一个数据属性
              'data-placeholder': placeholderMap[node.type.name]
            });
            decorations.push(nodeDecoration);
          }

          let selectionInNode = false;
          if (selection instanceof TextSelection) {
            // 当前是文本选区（光标）
            if (selection.empty) {
              const selectionNode = selection.$from.parent;
              if (selectionNode === node) {
                selectionInNode = true;
              }
            }
          }

          if (isEmpty) {
            if (node.type.name === 'title') {
              addPlaceHolder();
            }
            else if (selection.empty && selectionInNode) {
              addPlaceHolder();
            }
          }
        });
        return DecorationSet.create(doc, decorations);
      }
    }
  });
}