export function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

// 节点类型
export function isHtmlElement(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}

export const isFunction = (functionToCheck) => {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

// 是否时undefined类型
export const isUndefined = (val)=> {
  return val === void 0;
};

// 不为空说明变量被定义
export const isDefined = (val) => {
  return val !== undefined && val !== null;
};
