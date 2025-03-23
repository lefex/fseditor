import { Plugin, PluginKey } from "prosemirror-state";
import { isNodeEmpty } from "../../helper/isNodeEmpty";

/**
 * 行编辑插件
 */
export function createBlockEditPlugin() {
  return new Plugin({
    key: new PluginKey("pmplaceholder"),
    props: {
      handleDOMEvents: {
        mousemove(view, event) {
          // console.log('mousemove', event.target);
          return false;
        },
        mouseenter(view, event) {
          console.log('mouseenter', event.target);
          return false;
        },
        mouseleave(view, event) {
          console.log('mouseleave', event.target);
          return false;
        },
        mouseover(view, event) {
          console.log('mouseover', event.target);
          return false;
        }
      },
    }
  });
}