import { createSchema } from "./schema/PMSchema";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands"
import { createPlaceholderPlugin } from "./plugin/placeholder/PMPlaceholderPlugin";
import { createBlockEditPlugin } from "./plugin/blockEdit/PMBlockEditPlugin";
import { createRoot } from "react-dom/client";

export default class PMeditor {
  view: EditorView | null = null;
  constructor() {
    console.log('PMEditor constructor');
    this._initEditor();
    this._initUI();
  }

  private _initEditor() {
    const schema = createSchema();
    const rootEl = document.querySelector("#pm-editor");
    if (!rootEl) {
      console.error("Could not find root element");
      return;
    }

    // 设置初始化数据
    // const doc = schema.nodeFromJSON({});

    const state = EditorState.create({
      schema,
      plugins: [
        /**
         * 这个插件的作用是能够响应键盘事件，比如回车后能够换行
         */
        keymap(baseKeymap),
        /**
         * 这个插件创建placeholder插件
         */
        createPlaceholderPlugin(),
        /**
         * 行块编辑
         */
        createBlockEditPlugin(),
      ]
    });

    this.view = new EditorView(rootEl, {
      state,
    });
  }

  private _initUI() {
    // editor-ui
  }
}