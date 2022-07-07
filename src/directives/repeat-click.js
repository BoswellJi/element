import { once, on } from 'element-ui/src/utils/dom';

// 重复点击指令v-repeat-click，双击
export default {
  bind(el, binding, vnode) {
    // 定时器对象
    let interval = null;
    // 开始时间
    let startTime;
    // 节点的vnode的context对象，获取表达式
    const handler = () => vnode.context[binding.expression].apply();
    // 清除
    const clear = () => {
      // 现在时间 - 开始时间 < 100 毫秒，就开始处理
      if (Date.now() - startTime < 100) {
        handler();
      }
      // 否则清除定时器
      clearInterval(interval);
      interval = null;
    };

    /**
     * 1. 只点击一次，
     */

    // 给dom元素绑定mousedown事件
    on(el, 'mousedown', (e) => {
      // 事件对象的button不为0，直接返回
      if (e.button !== 0) return;
      // 记录下当前点一次点击时间
      startTime = Date.now();
      // 给文档对象，绑定mouseup事件，当鼠标松开时， 调用清理按钮，在有效期内，执行处理函数
      once(document, 'mouseup', clear);
      // 清理定时器
      clearInterval(interval);
      // 开启定时器
      interval = setInterval(handler, 100);
    });
  }
};
