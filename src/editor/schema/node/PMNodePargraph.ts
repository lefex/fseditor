import { DOMOutputSpec, Node, NodeSpec, ParseRule } from 'prosemirror-model';

export default class PMNodePargraph implements NodeSpec {
  content: string = 'inline*';
  group: string = 'block';

  toDOM(node: Node): DOMOutputSpec {
    return ['p', 0];
  }
}