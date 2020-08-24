import normalizeWheel from 'normalize-wheel';

// navigator对象是否存在 && userAgent属性转为小写，并存在firefox字符串，即为火狐浏览器
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

/**
 * 鼠标滚路事件
 * @param {*} element dom元素
 * @param {*} callback 回调函数
 */
const mousewheel = function(element, callback) {
  // 存在addEventListener方法
  if (element && element.addEventListener) {
    // 火狐使用DOMMouseScroll事件，其他使用mousewheel事件
    element.addEventListener(isFirefox ? 'DOMMouseScroll' : 'mousewheel', function(event) {
      // 规范化事件对象
      const normalized = normalizeWheel(event);
      // 存在回调函数 才会调用，传递会事件对象
      callback && callback.apply(this, [event, normalized]);
    });
  }
};

export default {
  // 鼠标滚轮指令
  bind(el, binding) {
    mousewheel(el, binding.value);
  }
};
