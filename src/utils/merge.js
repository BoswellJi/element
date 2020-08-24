/**
 * 将多个对象合并到一个对象上
 * @param {*} target 
 */
export default function(target) {
  // 参数数组遍历
  for (let i = 1, j = arguments.length; i < j; i++) {
    // 获取参数
    let source = arguments[i] || {};
    // 遍历参数对象
    for (let prop in source) {
      // 是否为自身实例属性(非原型属性)
      if (source.hasOwnProperty(prop)) {
        // 获取目标对象的属性的值
        let value = source[prop];
        // 值不为空
        if (value !== undefined) {
          // 将值直接添加到目标对象上,
          target[prop] = value;
        }
      }
    }
  }

  return target;
};