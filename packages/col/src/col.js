export default {
  name: 'ElCol',

  props: {
    // 平均分几分
    span: {
      type: Number,
      default: 24
    },
    // 自定义标签
    tag: {
      type: String,
      default: 'div'
    },
    // 偏移多少
    offset: Number,
    // 向左移动
    pull: Number,
    // 向右移动
    push: Number,
    // <768下的栅格数量
    xs: [Number, Object],
    // >=768下的栅格数量
    sm: [Number, Object],
    // >=992下的栅格数量
    md: [Number, Object],
    // >=1200下的栅格数量
    lg: [Number, Object],
    // >=1920下的栅格数量
    xl: [Number, Object]
  },

  computed: {
    gutter() {
      // 获取符组件实例
      let parent = this.$parent;
      // 父组件非ElRow组件，就继续找到父组件为ElRow组件为止
      while (parent && parent.$options.componentName !== 'ElRow') {
        parent = parent.$parent;
      }
      // 返回父组件的gutter属性
      return parent ? parent.gutter : 0;
    }
  },
  render(h) {
    let classList = [];
    let style = {};

    // 根据设置的间距，计算每个项目的padding，box-sizing:border-box
    if (this.gutter) {
      style.paddingLeft = this.gutter / 2 + 'px';
      style.paddingRight = style.paddingLeft;
    }

    // 设置每个el-col元素：偏移量
    ['span', 'offset', 'pull', 'push'].forEach(prop => {
      // 对应偏移的量的大小 大小 || 为0
      if (this[prop] || this[prop] === 0) {
        
        classList.push(
          prop !== 'span'
            ? `el-col-${prop}-${this[prop]}`
            : `el-col-${this[prop]}`
        );
      }
    });

    // 设置尺寸大小下的：列的占用大小
    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
      // 判断设置的尺寸下的占比为number,根据单独设置 :md="1" :lg="1"
      if (typeof this[size] === 'number') {
        // 添加到class
        classList.push(`el-col-${size}-${this[size]}`);
        // 配置的是对象
      } else if (typeof this[size] === 'object') {
        // 解析对象中的参数
        let props = this[size];
        // { pull:3,push:4 }
        Object.keys(props).forEach(prop => {
          classList.push(
            prop !== 'span'
              ? `el-col-${size}-${prop}-${props[prop]}`
              : `el-col-${size}-${props[prop]}`
          );
        });
      }
    });

    // 给el-col元素设置样式，class,和内容 vnode
    return h(this.tag, {
      class: ['el-col', classList],
      style
    }, this.$slots.default);
  }
};
