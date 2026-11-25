import { h, type ComponentChild } from 'preact';
import { executionTeaching, type ExecutionNode } from './execution-view';

function renderExecutionNode(node: ExecutionNode): ComponentChild {
  return typeof node === 'string'
    ? node
    : h(node.tag, node.attrs, node.children.map(renderExecutionNode));
}
export function Execution() {
  return (
    <>
      <div class="execution-screen">{renderExecutionNode(executionTeaching())}</div>
      <div class="execution-print">{renderExecutionNode(executionTeaching('print'))}</div>
    </>
  );
}
