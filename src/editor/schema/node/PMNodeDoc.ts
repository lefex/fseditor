import { DOMOutputSpec, Node, NodeSpec } from 'prosemirror-model';

export default class PMNodeDoc implements NodeSpec {
  content: string = 'title block+';

  toDOM(node: Node): DOMOutputSpec {
    return ['div', 0];
  }
}