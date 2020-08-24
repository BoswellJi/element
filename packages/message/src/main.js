import Vue from 'vue';
import Main from './main.vue';
import { PopupManager } from 'element-ui/src/utils/popup';
import { isVNode } from 'element-ui/src/utils/vdom';
let MessageConstructor = Vue.extend(Main);

let instance;
let instances = [];
let seed = 1;

const Message = function(options) {
  if (Vue.prototype.$isServer) return;
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options
    };
  }
  // 用户自定义关闭回调
  let userOnClose = options.onClose;
  let id = 'message_' + seed++;

  // 这里是 Message子类的组件的data选项
  // 关闭方法，默认的
  options.onClose = function() {
    // 调用静态关闭方法
    Message.close(id, userOnClose);
  };
  // 实例化Message子类
  instance = new MessageConstructor({
    data: options
  });
  instance.id = id;
  // 组件message是否为vnode
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }
  // 安装组件
  instance.$mount();
  // 获取组件的dom
  document.body.appendChild(instance.$el);

  let verticalOffset = options.offset || 20;
  // 获取组件元素的高度之和
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16;
  });
  // 设置组件的data属性
  instance.verticalOffset = verticalOffset;
  instance.visible = true;
  instance.$el.style.zIndex = PopupManager.nextZIndex();
  // 存储多个实例
  instances.push(instance);
  return instance;
};

['success', 'warning', 'info', 'error'].forEach(type => {
  // 给Message添加静态属性
  Message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      };
    }
    options.type = type;
    // 不同类型的Message
    return Message(options);
  };
});

Message.close = function(id, userOnClose) {
  let len = instances.length;
  let index = -1;
  let removedHeight;
  for (let i = 0; i < len; i++) {
    // 在当前的Message中找到指定的实例
    if (id === instances[i].id) {
      // 获取元素高度
      removedHeight = instances[i].$el.offsetHeight;
      index = i;
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i]);
      }
      // 移除
      instances.splice(i, 1);
      break;
    }
  }
  // 只有一个实例 || 没有找到  ||  索引大于组件实例数组
  if (len <= 1 || index === -1 || index > instances.length - 1) return;
  // 将之后的弹框都移除掉
  for (let i = index; i < len - 1 ; i++) {
    // 组件的dom节点
    let dom = instances[i].$el;
    // 将距离top的高度 - 自身元素的高度 -16
    dom.style['top'] =
      parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px';
  }
};

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close();
  }
};

export default Message;
