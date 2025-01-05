import { NodeSpec } from 'prosemirror-model';

export default class PMNodeText implements NodeSpec {
  inline = true;
  group: string = 'inline';
}