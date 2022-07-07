import Popper from 'element-ui/src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';
import { addClass, removeClass, on, off } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';
import Vue from 'vue';

export default {
  name: 'ElTooltip',

  mixins: [Popper],

  props: {
    // 延迟出现的毫秒数
    openDelay: {
      type: Number,
      default: 0
    },
    // 是否可用
    disabled: Boolean,
    // 手动控制
    manual: Boolean,
    // 提供默认主体
    effect: {
      type: String,
      default: 'dark'
    },
    // 
    arrowOffset: {
      type: Number,
      default: 0
    },
    // popper添加的class
    popperClass: String,
    // 内容
    content: String,
    // 是否展示箭头
    visibleArrow: {
      default: true
    },
    // 过渡动画class
    transition: {
      type: String,
      default: 'el-fade-in-linear'
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false
        };
      }
    },
    // 鼠标是否可以进入tooltip
    enterable: {
      type: Boolean,
      default: true
    },
    // 出现后，自动隐藏延时
    hideAfter: {
      type: Number,
      default: 0
    },
    // 
    tabindex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      tooltipId: `el-tooltip-${generateId()}`,
      timeoutPending: null,
      focusing: false
    };
  },
  beforeCreate() {
    // 是服务器端
    if (this.$isServer) return;

    // 创建弹框
    this.popperVM = new Vue({
      // vnode
      data: { node: '' },
      render(h) {
        return this.node;
      }
    }).$mount();

    // 防抖关闭popper,不会一值关闭，只会最后一次执行关闭
    this.debounceClose = debounce(200, () => this.handleClosePopper());
  },

  render(h) {
    if (this.popperVM) {
      // 给组件添加vnode
      this.popperVM.node = (
        <transition
          name={ this.transition }
          onAfterLeave={ this.doDestroy }>
          <div
          // 这里是popper元素的事件
            // 鼠标离开： 设置关闭状态； 
            onMouseleave={ () => { this.setExpectedState(false); this.debounceClose(); } }
            // 鼠标进入： 设置打开状态
            onMouseenter= { () => { this.setExpectedState(true); } }
            ref="popper"
            role="tooltip"
            id={this.tooltipId}
            aria-hidden={ (this.disabled || !this.showPopper) ? 'true' : 'false' }
            v-show={!this.disabled && this.showPopper}
            class={
              ['el-tooltip__popper', 'is-' + this.effect, this.popperClass]
            }>
              {/* 获取了：content插槽,或者属性content内容 */}
            { this.$slots.content || this.content }
          </div>
        </transition>);
    }

    // 获取第一个标签元素
    const firstElement = this.getFirstElement();
    // 没有元素
    if (!firstElement) return null;
    // 获取vnode的data
    const data = firstElement.data = firstElement.data || {};
    data.staticClass = this.addTooltipClass(data.staticClass);

    // 组件只展示，插槽中的元素
    return firstElement;
  },

  mounted() {
    // 获取组件的dom节点
    this.referenceElm = this.$el;
    // 元素类型
    if (this.$el.nodeType === 1) {
      // 给dom元素绑定事件
      this.$el.setAttribute('aria-describedby', this.tooltipId);
      this.$el.setAttribute('tabindex', this.tabindex);
      // 给dom绑定事件
      on(this.referenceElm, 'mouseenter', this.show);
      on(this.referenceElm, 'mouseleave', this.hide);
      // 使用tab键获取焦点
      on(this.referenceElm, 'focus', () => {
        // 没有插槽内容 
        if (!this.$slots.default || !this.$slots.default.length) {
          this.handleFocus();
          return;
        }
        // 获取插槽组件实例
        const instance = this.$slots.default[0].componentInstance;
        // 组件存在focus方法
        if (instance && instance.focus) {
          instance.focus();
        } else {
          this.handleFocus();
        }
      });
      on(this.referenceElm, 'blur', this.handleBlur);
      on(this.referenceElm, 'click', this.removeFocusing);
    }
    // fix issue https://github.com/ElemeFE/element/issues/14424
    // 
    if (this.value && this.popperVM) {
      this.popperVM.$nextTick(() => {
        if (this.value) {
          this.updatePopper();
        }
      });
    }
  },
  watch: {
    focusing(val) {
      if (val) {
        addClass(this.referenceElm, 'focusing');
      } else {
        removeClass(this.referenceElm, 'focusing');
      }
    }
  },
  methods: {
    // 展示tooltip
    show() {
      this.setExpectedState(true);
      this.handleShowPopper();
    },
    // 隐藏tooltip
    hide() {
      this.setExpectedState(false);
      this.debounceClose();
    },
    // 组件正在聚焦，展示tooptip
    handleFocus() {
      this.focusing = true;
      this.show();
    },
    // 组件失去焦点
    handleBlur() {
      this.focusing = false;
      this.hide();
    },
    // 移除焦点
    removeFocusing() {
      this.focusing = false;
    },
    /**
     * 添加tooltip类，
     * @param {*} prev 上一个
     */
    addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip';
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '');
      }
    },

    handleShowPopper() {
      // 关闭的 || 手动的
      if (!this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      // 展示弹框，延迟展示
      this.timeout = setTimeout(() => {
        this.showPopper = true;
      }, this.openDelay);

      if (this.hideAfter > 0) {
        // 延迟消失
        this.timeoutPending = setTimeout(() => {
          this.showPopper = false;
        }, this.hideAfter);
      }
    },

    /**
     * 关闭弹框
     */
    handleClosePopper() {
      // 可以进入 && 期待状态 || 手动，不能关闭
      if (this.enterable && this.expectedState || this.manual) return;
      clearTimeout(this.timeout);

      if (this.timeoutPending) {
        clearTimeout(this.timeoutPending);
      } 
      this.showPopper = false;

      if (this.disabled) {
        this.doDestroy();
      }
    },
    /**
     * 设置期待的状态
     * @param {*} expectedState 
     */
    setExpectedState(expectedState) {
      // 关闭
      if (expectedState === false) {
        clearTimeout(this.timeoutPending);
      }
      this.expectedState = expectedState;
    },

    getFirstElement() {
      // 获取插槽中的元素
      const slots = this.$slots.default;
      // 非数组
      if (!Array.isArray(slots)) return null;
      let element = null;
      // 遍历插槽元素
      for (let index = 0; index < slots.length; index++) {
        // 存在插槽元素，必须是标签元素
        if (slots[index] && slots[index].tag) {
          element = slots[index];
          break;
        };
      }
      return element;
    }
  },

  beforeDestroy() {
    this.popperVM && this.popperVM.$destroy();
  },

  destroyed() {
    const reference = this.referenceElm;
    if (reference.nodeType === 1) {
      off(reference, 'mouseenter', this.show);
      off(reference, 'mouseleave', this.hide);
      off(reference, 'focus', this.handleFocus);
      off(reference, 'blur', this.handleBlur);
      off(reference, 'click', this.removeFocusing);
    }
  }
};
