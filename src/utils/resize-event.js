import ResizeObserver from 'resize-observer-polyfill';

// 是否为服务器端
const isServer = typeof window === 'undefined';

/* istanbul ignore next */
const resizeHandler = function(entries) {
  for (let entry of entries) {
    const listeners = entry.target.__resizeListeners__ || [];
    if (listeners.length) {
      listeners.forEach(fn => {
        fn();
      });
    }
  }
};

/* istanbul ignore next */
/**
 * 添加调整大小监听器
 * @param {*} element dom元素
 * @param {*} fn 回调函数
 */
export const addResizeListener = function(element, fn) {
  // 服务器端，直接返回
  if (isServer) return;
  // 不存在大小调整监听器
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    // 实例化监听器
    element.__ro__ = new ResizeObserver(resizeHandler);
    // 注册观察对象
    element.__ro__.observe(element);
  }
  // 监听器队列
  element.__resizeListeners__.push(fn);
};

/* istanbul ignore next */
/**
 * 移除调整大小监听器
 * @param {*} element dom元素 
 * @param {*} fn 回调函数
 */
export const removeResizeListener = function(element, fn) {
  // 元素不存在 || 元素不存在监听器队列
  if (!element || !element.__resizeListeners__) return;
  // 移除指定监听器
  element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
  // 监听器队列为空
  if (!element.__resizeListeners__.length) {
    // 断开监听
    element.__ro__.disconnect();
  }
};
