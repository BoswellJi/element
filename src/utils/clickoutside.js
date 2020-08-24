import Vue from 'vue';
import { on } from 'element-ui/src/utils/dom';

const nodeList = [];
const ctx = '@@clickoutsideContext';

let startClick;
let seed = 0;

// 没有在服务端 && 给document添加mousedown事件
!Vue.prototype.$isServer && on(document, 'mousedown', e => (startClick = e));

// 没有在服务端时，给document添加mouseup事件
!Vue.prototype.$isServer && on(document, 'mouseup', e => {
  // 执行节点的 @@clickoutsideContext对象的documentHandler方法
  nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
});

/**
 * 创建文档处理器
 * @param {*} el dom元素
 * @param {*} binding 
 * @param {*} vnode 
 */
function createDocumentHandler(el, binding, vnode) {
  // 鼠标抬起 鼠标按下
  return function(mouseup = {}, mousedown = {}) {
    // 非vnode 
    if (!vnode ||
      // vnode没有context上下文对象
      !vnode.context ||
      // 鼠标抬起，没有target对象
      !mouseup.target ||
      // 鼠标按下，没有target对象
      !mousedown.target ||
      // dom元素中包含，鼠标抬起的目标对象
      el.contains(mouseup.target) ||
      // dom元素中包含鼠标按下的目标对象
      el.contains(mousedown.target) ||
      // dom元素本身就是鼠标抬起事件的目标对象
      el === mouseup.target ||
      // 
      (vnode.context.popperElm &&
      (vnode.context.popperElm.contains(mouseup.target) ||
      vnode.context.popperElm.contains(mousedown.target)))) return;
    // 指令绑定的表达式
    if (binding.expression &&
      // 指令的方法名
      el[ctx].methodName &&
      // 
      vnode.context[el[ctx].methodName]) {
      vnode.context[el[ctx].methodName]();
    } else {
      el[ctx].bindingFn && el[ctx].bindingFn();
    }
  };
}

/**
 * v-clickoutside 指令
 * @desc 点击元素外面才会触发的事件
 * @example
 * ```vue
 * <div v-element-clickoutside="handleClose">
 * ```
 */
export default {
  /**
   * 
   * @param {*} el dom元素
   * @param {*} binding 绑定的参数
   * @param {*} vnode 节点的vnode
   */
  bind(el, binding, vnode) {
    // 将绑定的指令的dom元素添加到nodelist
    nodeList.push(el);
    // 使用的次数
    const id = seed++;
    // 给dom元素添加熟属性 '@@clickoutsideContext'
    el[ctx] = {
      // 次数标识
      id,
      // 
      documentHandler: createDocumentHandler(el, binding, vnode),
      // 方法名称
      methodName: binding.expression,
      bindingFn: binding.value
    };
  },

  update(el, binding, vnode) {
    el[ctx].documentHandler = createDocumentHandler(el, binding, vnode);
    el[ctx].methodName = binding.expression;
    el[ctx].bindingFn = binding.value;
  },

  unbind(el) {
    let len = nodeList.length;

    for (let i = 0; i < len; i++) {
      if (nodeList[i][ctx].id === el[ctx].id) {
        nodeList.splice(i, 1);
        break;
      }
    }
    delete el[ctx];
  }
};
