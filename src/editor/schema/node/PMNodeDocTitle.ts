import { DOMOutputSpec, Node, NodeSpec } from 'prosemirror-model';

export default class PMNodeDocTitle implements NodeSpec {
  name: string = 'title';
  content: string = 'text*';

// toDOM(node: Node): DOMOutputSpec {
//   return 'h1';
// }

  // toDOM(node: Node): DOMOutputSpec {
  //   const cardEl = document.createElement("div");
  //   cardEl.style.border = "1px solid #000";
  //   const cardContent = document.createElement("div");
  //   cardEl.appendChild(cardContent);
  //   const pel = document.createElement("p");
  //   const text = document.createTextNode("这是一个卡片");
  //   pel.appendChild(text);
  //   cardContent.appendChild(pel);
  //   return cardEl;
  // }

toDOM(node: Node): DOMOutputSpec {
  console.log('toDOM node', node);
  // 标题容器
  const wrapperEl = document.createElement("div");
  wrapperEl.classList.add("pm-title-wrapper");

  const blockEl = document.createElement("div");
  blockEl.classList.add("pm-title-block");
  wrapperEl.appendChild(blockEl);
  // 表情符
  const emoji = document.createElement("div");
  emoji.classList.add("pm-emoji");
  emoji.innerText = "🍎";
  blockEl.appendChild(emoji);
  // 标题内容
  const titleEl = document.createElement("h1");
  titleEl.classList.add("pm-title");
  blockEl.appendChild(titleEl);

  // 状态栏
  const statusEl = document.createElement("div");
  statusEl.classList.add("pm-status-wrapper");
  // 作者
  const authorEl = document.createElement("span");
  authorEl.classList.add("pm-status-item");
  authorEl.innerText = "作者: 素燕";
  statusEl.appendChild(authorEl);
  // 创建时间
  const createTimeEl = document.createElement("span");
  createTimeEl.classList.add("pm-status-item");
  createTimeEl.innerText = "创建时间: 2021-09-07";
  statusEl.appendChild(createTimeEl);
  wrapperEl.appendChild(statusEl);
  return {
    dom: wrapperEl,
    contentDOM: titleEl
  };
}

  // toDOM(node: Node): DOMOutputSpec {
//   return ["h1", { class: "doc-title" }, 0];
// }
}