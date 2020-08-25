export default {
  name: 'ElRow',

  componentName: 'ElRow',

  props: {
    // 自定义标签
    tag: {
      type: String,
      default: 'div'
    },
    // 每个项目的间隔
    gutter: Number,
    // 布局的模式
    type: String,
    // 主轴居中
    justify: {
      type: String,
      default: 'start'
    },
    // 辅轴居中
    align: {
      type: String,
      default: 'top'
    }
  },

  computed: {
    style() {
      const ret = {};

      if (this.gutter) {
        ret.marginLeft = `-${this.gutter / 2}px`;
        ret.marginRight = ret.marginLeft;
      }

      return ret;
    }
  },

  render(h) {
    return h(this.tag, {
      // 元素的class
      class: [
        'el-row',
        // 水平居中
        this.justify !== 'start' ? `is-justify-${this.justify}` : '',
        // 垂直居中
        this.align !== 'top' ? `is-align-${this.align}` : '',
        // 布局类型
        { 'el-row--flex': this.type === 'flex' }
      ],
      // 使用marginLeft,marginRight设置项目的边距
      style: this.style
    }, this.$slots.default);
  }
};
