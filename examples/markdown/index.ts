import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import {schema, defaultMarkdownParser, defaultMarkdownSerializer} from "prosemirror-markdown"
import { exampleSetup } from "prosemirror-example-setup";

// https://github.com/ProseMirror/prosemirror-example-setup

class MarkdownView {
    textarea: HTMLTextAreaElement;

    constructor(target, content) {
        this.textarea = target.appendChild(document.createElement("textarea"))
        this.textarea.value = content
    }

    get content() {
        return this.textarea.value
    }

    focus() {
        this.textarea.focus()
    }

    destroy() {
        this.textarea.remove()
    }
}

class ProseMirrorView {
    view: EditorView;
    constructor(target, content) {
      this.view = new EditorView(target, {
        state: EditorState.create({
          doc: defaultMarkdownParser.parse(content) as Node,
          plugins: exampleSetup({schema})
        })
      })
    }

    get content() {
      return defaultMarkdownSerializer.serialize(this.view.state.doc)
    }

    focus() {
        this.view.focus()
    }

    destroy() {
        this.view.destroy()
    }
  }

const setup = () => {
    // 定义schema
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

    let view = new MarkdownView(rootEl, (document.querySelector("#content") as HTMLTextAreaElement).value)

    document.querySelectorAll("input[type=radio]").forEach(button => {
        button.addEventListener("change", () => {
          if (!button.checked) return
          let View = button.value == "markdown" ? MarkdownView : ProseMirrorView
          if (view instanceof View) return
          let content = view.content
          view.destroy()
          view = new View(rootEl, content)
          view.focus()
        })
    })
}

setup();