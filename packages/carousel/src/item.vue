<template>
  <div
    v-show="ready"
    class="el-carousel__item"
    :class="{
      'is-active': active,
      'el-carousel__item--card': $parent.type === 'card',
      'is-in-stage': inStage,
      'is-hover': hover,
      'is-animating': animating
    }"
    @click="handleItemClick"
    :style="itemStyle">
    <div
      v-if="$parent.type === 'card'"
      v-show="!active"
      class="el-carousel__mask">
    </div>
    <slot></slot>
  </div>
</template>

<script>
  import { autoprefixer } from 'element-ui/src/utils/util';
  const CARD_SCALE = 0.83;
  export default {
    name: 'ElCarouselItem',

    props: {
      name: String,
      label: {
        type: [String, Number],
        default: ''
      }
    },

    data() {
      return {
        hover: false,
        translate: 0,
        scale: 1,
        active: false,
        ready: false,
        inStage: false,
        animating: false
      };
    },

    methods: {
      /**
       * 处理索引(计算下一个索引)
       * 下一个索引
       * 当前索引
       * 长度
       * 
       */
      processIndex(index, activeIndex, length) {
        // 所在第一个
        if (activeIndex === 0 && index === length - 1) {
          return -1;
          // 最后一个
        } else if (activeIndex === length - 1 && index === 0) {
          return length;
        // 
        } else if (index < activeIndex - 1 && activeIndex - index >= length / 2) {
          return length + 1;
        } else if (index > activeIndex + 1 && index - activeIndex >= length / 2) {
          return -2;
        }
        return index;
      },

/**
 * 计算卡的过度,缩放
 */
      calcCardTranslate(index, activeIndex) {
        // 获取容器宽度
        const parentWidth = this.$parent.$el.offsetWidth;

        if (this.inStage) {
          return parentWidth * ((2 - CARD_SCALE) * (index - activeIndex) + 1) / 4;
          // 当前索引大于下一个索引,向左滚
        } else if (index < activeIndex) {
          return -(1 + CARD_SCALE) * parentWidth / 4;
           // 当前索引大于下一个索引,向右滚
        } else {
          return (3 + CARD_SCALE) * parentWidth / 4;
        }
      },

// 计算位置的过度
      calcTranslate(index, activeIndex, isVertical) {
        // 根据轮播的方向,获取容器的宽度或者高度
        const distance = this.$parent.$el[isVertical ? 'offsetHeight' : 'offsetWidth'];
        // 计算移动距离,有正负(正:向右  负:向左)
        return distance * (index - activeIndex);
      },

    /**
     * 过度移动元素
     * @param {Number} index 项目索引
     */
      translateItem(index, activeIndex, oldIndex) {
        // 容器类型,容器播放方向
        const parentType = this.$parent.type;
        const parentDirection = this.parentDirection;
        // 轮播项目的数量
        const length = this.$parent.items.length;
        // 
        if (parentType !== 'card' && oldIndex !== undefined) {
          this.animating = index === activeIndex || index === oldIndex;
        }
        if (index !== activeIndex && length > 2 && this.$parent.loop) {
          index = this.processIndex(index, activeIndex, length);
        }
        if (parentType === 'card') {
          if (parentDirection === 'vertical') {
            console.warn('[Element Warn][Carousel]vertical directionis not supported in card mode');
          }
          this.inStage = Math.round(Math.abs(index - activeIndex)) <= 1;
          this.active = index === activeIndex;
          this.translate = this.calcCardTranslate(index, activeIndex);
          this.scale = this.active ? 1 : CARD_SCALE;
        } else {
          this.active = index === activeIndex;
          const isVertical = parentDirection === 'vertical';
          this.translate = this.calcTranslate(index, activeIndex, isVertical);
        }
        this.ready = true;
      },

      handleItemClick() {
        const parent = this.$parent;
        // 容器为card 类型
        if (parent && parent.type === 'card') {
          // 获取下一个元素的索引
          const index = parent.items.indexOf(this);
          // 设置下一个元素
          parent.setActiveItem(index);
        }
      }
    },

    computed: {
      // 获取容器设置的轮播方向
      parentDirection() {
        return this.$parent.direction;
      },

      /**
       * 元素当前样式
       */
      itemStyle() {
        // 轮播为垂直方向，处理元素的Y轴，轮播是水平方向为x轴
        const translateType = this.parentDirection === 'vertical' ? 'translateY' : 'translateX';
        // 样式属性计算
        const value = `${translateType}(${ this.translate }px) scale(${ this.scale })`;
        const style = {
          transform: value
        };
        // 添加属性前缀
        return autoprefixer(style);
      }
    },

    created() {
      this.$parent && this.$parent.updateItems();
    },

    destroyed() {
      this.$parent && this.$parent.updateItems();
    }
  };
</script>
