export const NODE_KEY = '$treeNodeId';

/**
 * 标记节点数据
 * @param {*} node 
 * @param {*} data 
 */
export const markNodeData = function(node, data) {
  // 没有数据 || 已经存在 NODE_KEY属性，返回
  if (!data || data[NODE_KEY]) return;
  // 给node设置id
  Object.defineProperty(data, NODE_KEY, {
    value: node.id,
    enumerable: false,
    configurable: false,
    writable: false
  });
};

// 没有指定的key就返回默认的key
export const getNodeKey = function(key, data) {
  if (!key) return data[NODE_KEY];
  return data[key];
};

/**
 * 找到最近的组件
 * @param {*} element 
 * @param {*} componentName 
 */
export const findNearestComponent = (element, componentName) => {
  // 
  let target = element;
  // 元素存在，标签不是body 就继续向上找
  while (target && target.tagName !== 'BODY') {
    // node节点__vue__组件实例 && name属性为指定组件名
    if (target.__vue__ && target.__vue__.$options.name === componentName) {
      // 返回组件实例
      return target.__vue__;
    }
    // 节点的父节点
    target = target.parentNode;
  }
  return null;
};
