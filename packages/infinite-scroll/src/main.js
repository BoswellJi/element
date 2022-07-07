import throttle from 'throttle-debounce/debounce';
import {
  isHtmlElement,
  isFunction,
  isUndefined,
  isDefined
} from 'element-ui/src/utils/types';
import {
  getScrollContainer
} from 'element-ui/src/utils/dom';

const getStyleComputedProperty = (element, property) => {
  if (element === window) {
    element = document.documentElement;
  }

  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  const css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
};

const entries = (obj) => {
  return Object.keys(obj || {})
    .map(key => ([key, obj[key]]));
};

const getPositionSize = (el, prop) => {
  return el === window || el === document
    ? document.documentElement[prop]
    : el[prop];
};

const getOffsetHeight = el => {
  // 获取元素的高度
  return getPositionSize(el, 'offsetHeight');
};

const getClientHeight = el => {
  // 获取元素的高度
  return getPositionSize(el, 'clientHeight');
};

const scope = 'ElInfiniteScroll';
const attributes = {
  delay: {
    type: Number,
    default: 200
  },
  distance: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  immediate: {
    type: Boolean,
    default: true
  }
};

const getScrollOptions = (el, vm) => {
  if (!isHtmlElement(el)) return {};

  return entries(attributes).reduce((map, [key, option]) => {
    const { type, default: defaultValue } = option;
    let value = el.getAttribute(`infinite-scroll-${key}`);
    value = isUndefined(vm[value]) ? value : vm[value];
    switch (type) {
      case Number:
        value = Number(value);
        value = Number.isNaN(value) ? defaultValue : value;
        break;
      case Boolean:
        value = isDefined(value) ? value === 'false' ? false : Boolean(value) : defaultValue;
        break;
      default:
        value = type(value);
    }
    map[key] = value;
    return map;
  }, {});
};

// 获取元素距离顶部/或者带有定位属性的父元素的距离
const getElementTop = el => el.getBoundingClientRect().top;

/**
 * 处理滚动
 * @param {*} cb 
 */
const handleScroll = function(cb) {
  const { el, vm, container, observer } = this[scope];
  const { distance, disabled } = getScrollOptions(el, vm);

  if (disabled) return;
  // 获取元素的尺寸信息
  const containerInfo = container.getBoundingClientRect();
  if (!containerInfo.width && !containerInfo.height) return;

  let shouldTrigger = false;
  
  if (container === el) {
    // be aware of difference between clientHeight & offsetHeight & window.getComputedStyle().height
    const scrollBottom = container.scrollTop + getClientHeight(container);
    // 
    shouldTrigger = container.scrollHeight - scrollBottom <= distance;
  } else {
    // 获取元素的高度 + 滚动元素距离窗口顶部的高度 - 容器的距离窗口顶部的高度
    const heightBelowTop = getOffsetHeight(el) + getElementTop(el) - getElementTop(container);
    // 获取元素高度
    const offsetHeight = getOffsetHeight(container);
    // 
    const borderBottom = Number.parseFloat(getStyleComputedProperty(container, 'borderBottomWidth'));
    // 容器
    shouldTrigger = heightBelowTop - offsetHeight + borderBottom <= distance;
  }
  // 触底了 && 回调是函数
  if (shouldTrigger && isFunction(cb)) {
    cb.call(vm);
  } else if (observer) {
    // 清理内存
    observer.disconnect();
    this[scope].observer = null;
  }

};

export default {
  // 无缝滚动
  name: 'InfiniteScroll',
  /**
   * 替换，被绑定元素插入父节点时调用
   * @param {*} el 绑定指令的html标签的dom对象vm
   * @param {*} binding 绑定信息
   * @param {*} vnode 绑定指令的html标签的vnode对象
   */
  inserted(el, binding, vnode) {
    const cb = binding.value;
    // vnode的上下文，指的是vnode安装时，挂载到的组Vue实例
    const vm = vnode.context;
    
    // only include vertical scroll 
    const container = getScrollContainer(el, true);
    const { delay, immediate } = getScrollOptions(el, vm);
    // 每次滚动都会加载
    const onScroll = throttle(delay, handleScroll.bind(el, cb));
    // ElInfiniteScroll 
    el[scope] = { el, vm, container, onScroll };

    // 元素存在，添加事件
    if (container) {
      container.addEventListener('scroll', ()=>{
        console.log(1);
        onScroll()
      });
      
      if (immediate) {
        const observer = el[scope].observer = new MutationObserver(onScroll);
        observer.observe(container, { childList: true, subtree: true });
        onScroll();
      }
    }
  },
  unbind(el) {
    const { container, onScroll } = el[scope];
    if (container) {
      container.removeEventListener('scroll', onScroll);
    }
  }
};

