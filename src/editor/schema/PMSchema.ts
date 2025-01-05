import { Schema } from "prosemirror-model";
import {
  PMNodeDoc,
  PMNodePargraph,
  PMNodeText,
  PMNodeDocTitle
} from "./node";

/**
 * 创建schema
 */
export function createSchema() {
  const schema = new Schema({
    nodes: {
      // 定义节点类型, 一个文档只能有一个doc节点
      doc: new PMNodeDoc(),
      // 文档标题
      title: new PMNodeDocTitle(),
      // 段落节点
      pargraph: new PMNodePargraph(),
      // 文本节点
      text: new PMNodeText()
    },
    marks: {}
  });
  return schema;
}