<template>
  <section class="el-container" :class="{ 'is-vertical': isVertical }">
    <slot></slot>
  </section>
</template>

<script>
  export default {
    name: 'ElContainer',

    componentName: 'ElContainer',

    props: {
      direction: String
    },

    computed: {
      // 是否垂直
      isVertical() {
        // 垂直
        if (this.direction === 'vertical') {
          return true;

          // 水平
        } else if (this.direction === 'horizontal') {
          return false;
        }

        // 获取插槽实例，
        return this.$slots && this.$slots.default
        // 遍历插槽
          ? this.$slots.default.some(vnode => {
            // 组件的tag为el-header el-footer
            const tag = vnode.componentOptions && vnode.componentOptions.tag;
            // 存在header,footer，元素；就是垂直
            return tag === 'el-header' || tag === 'el-footer';
          })
          : false;
      }
    }
  };
</script>
