import { addClass, removeClass } from 'element-ui/src/utils/dom';

/**
 * 过渡的生命周期
 * 
 * 1. 进入前
 * 2. 进入中
 * 3. 进入后
 * 
 * 4. 离开前 === 进入后
 * 
 * 
 * 5. 离开中 === 进入中
 * 样式是全部都是目标值
 * 
 * 6. 离开后 === 进入前
 * 样式是全部都被初始值
 * 
 */

class Transition {
  // 进入前： 保留原本样式， 初始化新样式
  beforeEnter(el) {
    // 给dom元素添加样式
    addClass(el, 'collapse-transition');
    // dom对象是否存在 dataset属性，没有设置为空对象
    if (!el.dataset) el.dataset = {};

    // 给dom对象的dataset属性
    // 用来保存原始dom对象上的样式
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;

    // 过渡初始新的起始值，设为0
    el.style.height = '0';
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
  }
  // 进入中 目标样式
  enter(el) {
    el.dataset.oldOverflow = el.style.overflow;
    // dom元素的滚动高度不为0，dom元素的尺寸大小（高度
    if (el.scrollHeight !== 0) {
      // 设置为高度
      el.style.height = el.scrollHeight + 'px';
      // 给元素设置原始的样式值，过渡目标
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    } else {
      // 高度设置为空
      el.style.height = '';
      // 设置原始padding
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }
    // 给元素添加溢出隐藏
    el.style.overflow = 'hidden';
  }

  // 进入后 清除动画
  afterEnter(el) {
    // for safari: remove class then reset height is necessary
    // 进入后，删除过渡样式
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
  }

  // 离开前 目标样式
  beforeLeave(el) {
    if (!el.dataset) el.dataset = {};
    // 将元素当前的样式保存下来
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.dataset.oldOverflow = el.style.overflow;

    // 设置开始样式，原始样式（开始过渡样式
    el.style.height = el.scrollHeight + 'px';
    el.style.overflow = 'hidden';
  }

  // 离开中 初始化新样式
  leave(el) {
    if (el.scrollHeight !== 0) {
      // 对于safari: 设置高度后，添加class,或者，或者突然跳到0高度
      // for safari: add class after set height, or it will jump to zero height suddenly, weired
      addClass(el, 'collapse-transition');
      // 设置过渡目标
      el.style.height = 0;
      el.style.paddingTop = 0;
      el.style.paddingBottom = 0;
    }
  }

  // 离开后, 还原原本样式
  afterLeave(el) {
    // 移除过渡
    removeClass(el, 'collapse-transition');
    // 还原dom的样式
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  }
}

/**
 * 过渡组件
 * 定制的vue tranisition 组件
 */
export default {
  name: 'ElCollapseTransition',
  // 函数式子组件
  functional: true,
  render(h, { children }) {
    // vnode属性
    const data = {
      on: new Transition()
    };

    return h('transition', data, children);
  }
};
