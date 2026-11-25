import { h, type ComponentChild } from 'preact';
import { loopTeaching, type LoopNode } from './loop-view';

export function renderLoopNode(node: LoopNode): ComponentChild {
  if (typeof node === 'string') return node;
  return h(node.tag, node.attrs, node.children.map(renderLoopNode));
}
export function Loop() {
  return <>{renderLoopNode(loopTeaching())}</>;
}
