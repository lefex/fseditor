// 根据ProseMirror的doc节点来绘制一颗树
import { Node } from "prosemirror-model";

// 递归绘制doc节点的树形结构
const drawNode = (node: Node, container: HTMLElement) => {
    const nodeEl = document.createElement("div");
    nodeEl.style.border = "1px solid #000";
    nodeEl.style.margin = "10px";
    nodeEl.style.padding = "10px";
    nodeEl.style.backgroundColor = "#f0f0f0";
    nodeEl.style.display = "flex";
    nodeEl.style.flexDirection = "column";
    container.appendChild(nodeEl);

    const typeEl = document.createElement("div");
    typeEl.innerText = `${node.type.name}_[${node.nodeSize}]`;
    typeEl.style.cursor = "pointer";
    typeEl.addEventListener("click", () => {
        alert(JSON.stringify(node.toJSON(), null, 2));
    });
    nodeEl.appendChild(typeEl);

    if (node.isText) {
        const textEl = document.createElement("div");
        textEl.innerText = node.text || '';
        textEl.style.color = "#aaa";
        nodeEl.appendChild(textEl);
    } else {
        node.content.forEach(child => {
            drawNode(child, nodeEl);
        });
    }
}

export const drawDocTree = (node: Node, level = 0) => {
    const container = document.createElement("div");
    // container.style.border = "1px solid #000";
    container.style.minHeight = "200px";
    document.body.appendChild(container);

    drawNode(node, container);
}