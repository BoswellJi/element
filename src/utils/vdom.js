import { hasOwn } from 'element-ui/src/utils/util';

// 是虚拟节点
export function isVNode(node) {
  // 节点不为null 还是object类型的， 有自己的实例属性componentOptions
  return node !== null && typeof node === 'object' && hasOwn(node, 'componentOptions');
};
