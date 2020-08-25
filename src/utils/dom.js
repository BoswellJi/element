/* istanbul ignore next */

import Vue from 'vue';

const isServer = Vue.prototype.$isServer;
// 特殊的字符 反斜杠都是转义字符
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
// moz[A-Z]
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = isServer ? 0 : Number(document.documentMode);

/* istanbul ignore next */
const trim = function(string) {
  // \s: 空格  \uFEFF:'' +: 一个及以上
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};
/* istanbul ignore next */
// a-b -> aB
const camelCase = function(name) {
  // 替换特殊字符 参数: 被匹配到的字符 , 索引位置 , 整个字符串
  return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  }).replace(MOZ_HACK_REGEXP, 'Moz$1');
};

/* istanbul ignore next */
export const on = (function() {
  // 注册监听函数方法
  if (!isServer && document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        // 进行注册监听事件
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
/**
 * 解绑监听事件
 */
export const off = (function() {
  if (!isServer && document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
/**
 * 执行一次就解绑
 * @param {*} el 
 * @param {*} event 
 * @param {*} fn 
 */
export const once = function(el, event, fn) {
  var listener = function() {
    if (fn) {
      fn.apply(this, arguments);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

/* istanbul ignore next */
/**
 * 是否有class
 * @param {*} el 元素
 * @param {*} cls 类名
 */
export function hasClass(el, cls) {
  // 有一个不存在就返回false
  if (!el || !cls) return false;
  // 检查类名是否包含空格
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  // 获取当前元素的css类
  if (el.classList) {
    // 检查元素是否存在指定的css类
    return el.classList.contains(cls);
  } else {
    // 没有classlist, 获取元素的css类名
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
};

/* istanbul ignore next */
export function addClass(el, cls) {
  // dom元素不存在
  if (!el) return;
  // 获取css 类名
  var curClass = el.className;
  // 以空格来分割字符串 'a b c' => [a,b,c]
  var classes = (cls || '').split(' ');
  // 遍历css类
  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    // 为空格,跳过
    if (!clsName) continue;
    // 元素存在clasList对象
    if (el.classList) {
      // 添加css类
      el.classList.add(clsName);
      // 元素没有这个css类
    } else if (!hasClass(el, clsName)) {
      // 
      curClass += ' ' + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
};

/* istanbul ignore next */
export function removeClass(el, cls) {
  if (!el || !cls) return;
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
};

/* istanbul ignore next */
/**
 * 根据元素的样式名称获取样式值
 * @param {} element dom元素
 * @param {} styleName 样式名
 */
export const getStyle = ieVersion < 9 ? function(element, styleName) {
  // 服务器端，返回
  if (isServer) return;
  // 没有元素或者样式名称
  if (!element || !styleName) return null;
  // 将样式名称 a-b aB 驼峰化
  styleName = camelCase(styleName);
  // 样式名===float
  if (styleName === 'float') {
    // 改写为styleFloat
    styleName = 'styleFloat';
  }
  try {
    switch (styleName) {
      // 样式名为opacity
      case 'opacity':
        try {
          // 
          return element.filters.item('alpha').opacity / 100;
        } catch (e) {
          return 1.0;
        }
      default:
        // 获取元素的样式对象
        return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
    }
  } catch (e) {
    return element.style[styleName];
  }
} : function(element, styleName) {
  if (isServer) return;
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    // 获取元素计算样式
    var computed = document.defaultView.getComputedStyle(element, '');
    // 
    return element.style[styleName] || computed ? computed[styleName] : null;
  } catch (e) {
    return element.style[styleName];
  }
};

/* istanbul ignore next */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return;

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
    } else {
      element.style[styleName] = value;
    }
  }
};

/**
 * 是否是滚动
 * @param {*} el 
 * @param {*} vertical 垂直,水平 x,y
 */
export const isScroll = (el, vertical) => {
  if (isServer) return;
  // 确定滚动方向 (等于null同时也要等于undefined)
  const determinedDirection = vertical !== null || vertical !== undefined;
   
  const overflow = determinedDirection
    ? vertical
      ? getStyle(el, 'overflow-y')
      : getStyle(el, 'overflow-x')
    : getStyle(el, 'overflow');

  return overflow.match(/(scroll|auto)/);
};

/**
 * 获取滚动元素的容器
 * @param {*} el 
 * @param {*} vertical 垂直
 */
export const getScrollContainer = (el, vertical) => {
  if (isServer) return;

  let parent = el;
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) {
      return window;
    }
    if (isScroll(parent, vertical)) {
      return parent;
    }
    parent = parent.parentNode;
  }

  return parent;
};

export const isInContainer = (el, container) => {
  if (isServer || !el || !container) return false;

  const elRect = el.getBoundingClientRect();
  let containerRect;

  if ([window, document, document.documentElement, null, undefined].includes(container)) {
    containerRect = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0
    };
  } else {
    containerRect = container.getBoundingClientRect();
  }

  return elRect.top < containerRect.bottom &&
    elRect.bottom > containerRect.top &&
    elRect.right > containerRect.left &&
    elRect.left < containerRect.right;
};
