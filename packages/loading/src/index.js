import Vue from 'vue';
import loadingVue from './loading.vue';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';
import { PopupManager } from 'element-ui/src/utils/popup';
import afterLeave from 'element-ui/src/utils/after-leave';
import merge from 'element-ui/src/utils/merge';

// 创建 LoadingVue 类的子类，继承 LoadingVue和Vue类
const LoadingConstructor = Vue.extend(loadingVue);

const defaults = {
  text: null,
  fullscreen: true,
  body: false,
  lock: false,
  customClass: ''
};

let fullscreenLoading;

// 加载组件的公共状态
LoadingConstructor.prototype.originalPosition = '';
LoadingConstructor.prototype.originalOverflow = '';

LoadingConstructor.prototype.close = function () {
  // 全屏幕
  if (this.fullscreen) {
    // 置空
    fullscreenLoading = undefined;
  }
  // 300毫秒后，执行离开之后的操作
  afterLeave(this, _ => {
    // 获取容器dom
    const target = this.fullscreen || this.body
      ? document.body
      : this.target;
    // 移除样式
    removeClass(target, 'el-loading-parent--relative');
    removeClass(target, 'el-loading-parent--hidden');
    // 移除加载组件
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    // 销毁组件
    this.$destroy();
  }, 300);
  this.visible = false;
};

/**
 * 给dom节点添加样式
 * @param {*} options 
 * @param {*} parent 父容器
 * @param {*} instance 组件实例
 */
const addStyle = (options, parent, instance) => {
  let maskStyle = {};
  // 全屏配置
  if (options.fullscreen) {
    // 获取body样式给组件
    instance.originalPosition = getStyle(document.body, 'position');
    instance.originalOverflow = getStyle(document.body, 'overflow');
    maskStyle.zIndex = PopupManager.nextZIndex();
    // 覆盖body
  } else if (options.body) {
    // 获取dom元素的定位类型
    instance.originalPosition = getStyle(document.body, 'position');
    // 给遮罩元素添加位置信息，根据目标dom对象的信息
    ['top', 'left'].forEach(property => {
      // 获取遮罩元素的y轴滚动距离
      let scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
      maskStyle[property] = options.target.getBoundingClientRect()[property] +
        // 获取body元素的y轴滚动
        document.body[scroll] +
        document.documentElement[scroll] +
        'px';
    });
    // 给遮罩设置目标容器的大小尺寸
    ['height', 'width'].forEach(property => {
      maskStyle[property] = options.target.getBoundingClientRect()[property] + 'px';
    });
  } else {
    // 获取组件当前位置
    instance.originalPosition = getStyle(parent, 'position');
  }
  // 将遮罩的样式设置给加载组件
  Object.keys(maskStyle).forEach(property => {
    instance.$el.style[property] = maskStyle[property];
  });
};

/**
 * 加载构造函数
 * @param {*} options 
 */
const Loading = (options = {}) => {
  // 服务端返回
  if (Vue.prototype.$isServer) return;
  // 合并参数
  options = merge({}, defaults, options);
  // loading覆盖的dom节点
  if (typeof options.target === 'string') {
    // 获取dom节点
    options.target = document.querySelector(options.target);
  }
  // 本身已是dom对象,否则全局
  options.target = options.target || document.body;
  // 存在target参数，不存在target，设置是否全屏问题
  if (options.target !== document.body) {
    options.fullscreen = false;
  } else {
    options.body = true;
  }
  // 全屏加载 && 全屏加载组件
  if (options.fullscreen && fullscreenLoading) {
    return fullscreenLoading;
  }
  // 加载容器dom对象
  let parent = options.body ? document.body : options.target;
  // 实例化loading，Loading的子类，所有，Loading类的属性，都有
  let instance = new LoadingConstructor({
    // 将组件添加到指定的dom元素中，可以单独指定组件的挂载容器
    el: document.createElement('div'),
    data: options
  });

  // 添加样式
  addStyle(options, parent, instance);

  // 定位
  if (instance.originalPosition !== 'absolute' && instance.originalPosition !== 'fixed') {
    // 相对定位
    addClass(parent, 'el-loading-parent--relative');
  }
  // 全屏 && 上锁
  if (options.fullscreen && options.lock) {
    // 添加溢出隐藏
    addClass(parent, 'el-loading-parent--hidden');
  }
  // 将Loading组件添加到dom对象的容器中
  parent.appendChild(instance.$el);

  Vue.nextTick(() => {
    // 组件展示
    instance.visible = true;
  });
  // 是否全屏，保存全屏的组件实例
  if (options.fullscreen) {
    fullscreenLoading = instance;
  }
  return instance;
};

export default Loading;
