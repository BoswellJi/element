<template>
<!-- 阻止默认事件 -->
  <div
    :class="carouselClasses"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave">
    <div
      class="el-carousel__container"
      :style="{ height: height }">
      <!-- 内置动画组件Vue,左按钮 -->
      <transition
        v-if="arrowDisplay"
        name="carousel-arrow-left">
        <button
          type="button"
          v-show="(arrow === 'always' || hover) && (loop || activeIndex > 0)"
          @mouseenter="handleButtonEnter('left')"
          @mouseleave="handleButtonLeave"
          @click.stop="throttledArrowClick(activeIndex - 1)"
          class="el-carousel__arrow el-carousel__arrow--left">
          <i class="el-icon-arrow-left"></i>
        </button>
      </transition>
      <!-- 内置动画组件Vue,右按钮 -->
      <transition
        v-if="arrowDisplay"
        name="carousel-arrow-right">
        <button
          type="button"
          v-show="(arrow === 'always' || hover) && (loop || activeIndex < items.length - 1)"
          @mouseenter="handleButtonEnter('right')"
          @mouseleave="handleButtonLeave"
          @click.stop="throttledArrowClick(activeIndex + 1)"
          class="el-carousel__arrow el-carousel__arrow--right">
          <i class="el-icon-arrow-right"></i>
        </button>
      </transition>
      <!-- 每条项目 -->
      <slot></slot>
    </div>
    <!-- 指示按钮 -->
    <ul
      v-if="indicatorPosition !== 'none'"
      :class="indicatorsClasses">
      <li
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'el-carousel__indicator',
          'el-carousel__indicator--' + direction,
          { 'is-active': index === activeIndex }]"
        @mouseenter="throttledIndicatorHover(index)"
        @click.stop="handleIndicatorClick(index)">
        <button class="el-carousel__button">
          <span v-if="hasLabel">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import throttle from 'throttle-debounce/throttle';
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

export default {
  name: 'ElCarousel',

  props: {
    // 初始索引，轮播项目
    initialIndex: {
      type: Number,
      default: 0
    },
    // 轮播高度
    height: String,
    // 
    trigger: {
      type: String,
      default: 'hover'
    },
    // 自动播放
    autoplay: {
      type: Boolean,
      default: true
    },
    // 时间间隔
    interval: {
      type: Number,
      default: 3000
    },
    // 指示按钮位置
    indicatorPosition: String,
    // 是否需要指示按钮
    indicator: {
      type: Boolean,
      default: true
    },
    // 
    arrow: {
      type: String,
      default: 'hover'
    },
    type: String,
    loop: {
      type: Boolean,
      default: true
    },
    //播放方向
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) !== -1;
      }
    }
  },

  data() {
    return {
      
      items: [],
      activeIndex: -1,
      containerWidth: 0,
      timer: null,
      hover: false
    };
  },

  computed: {
    // 箭头展示情况，
    arrowDisplay() {
      // 不为never配置，以及不是垂直方向播放的 展示箭头
      return this.arrow !== 'never' && this.direction !== 'vertical';
    },

    // 子项目是否存在
    hasLabel() {
      return this.items.some(item => item.label.toString().length > 0);
    },

    /**
     * 轮播容器的样式
     * 根据轮播的方向,轮播类型添加样式
     */
    carouselClasses() {
      const classes = ['el-carousel', 'el-carousel--' + this.direction];
      if (this.type === 'card') {
        classes.push('el-carousel--card');
      }
      return classes;
    },

    // 指示按钮样式
    indicatorsClasses() {
      const classes = ['el-carousel__indicators', 'el-carousel__indicators--' + this.direction];
      if (this.hasLabel) {
        classes.push('el-carousel__indicators--labels');
      }
      if (this.indicatorPosition === 'outside' || this.type === 'card') {
        classes.push('el-carousel__indicators--outside');
      }
      return classes;
    }
  },

  watch: {
    /**
     * 设置轮播中的项目
     */
    items(val) {
      // 
      if (val.length > 0) this.setActiveItem(this.initialIndex);
    },

// 下一个 val  oldVal， 上一个
    activeIndex(val, oldVal) {
      this.resetItemPosition(oldVal);
      if (oldVal > -1) {
        this.$emit('change', val, oldVal);
      }
    },
// 自动播放来清定时器
    autoplay(val) {
      val ? this.startTimer() : this.pauseTimer();
    },

  // 根据是否轮询处理轮播边界0 length-1
    loop() {
      this.setActiveItem(this.activeIndex);
    }
  },

  methods: {
    // 鼠标引入暂停定时器
    handleMouseEnter() {
      this.hover = true;
      this.pauseTimer();
    },

    handleMouseLeave() {
      this.hover = false;
      this.startTimer();
    },

    /**
     * 判断
     * @param {Object} item 选项实例
     * @param {Number} index 选项索引
     */
    itemInStage(item, index) {
      // 轮播选项个数
      const length = this.items.length;
      // 索引为最后一个
      if (index === length - 1 && item.inStage && this.items[0].active ||
        (item.inStage && this.items[index + 1] && this.items[index + 1].active)) {
        return 'left';
      } else if (index === 0 && item.inStage && this.items[length - 1].active ||
        (item.inStage && this.items[index - 1] && this.items[index - 1].active)) {
        return 'right';
      }
      return false;
    },

  /**
   * 处理鼠标进入元素
   */
    handleButtonEnter(arrow) {
      // 轮播方向为垂直，不做处理（不展示箭头
      if (this.direction === 'vertical') return;
      // 
      this.items.forEach((item, index) => {
        if (arrow === this.itemInStage(item, index)) {
          item.hover = true;
        }
      });
    },

    /**
     * 处理鼠标移开
     */
    handleButtonLeave() {
      // 垂直方向播放，不处理
      if (this.direction === 'vertical') return;

      this.items.forEach(item => {
        item.hover = false;
      });
    },

    /**
     * 初始化，子项目组件name 为ElCarouselItem，为真正子项目
     */
    updateItems() {
      this.items = this.$children.filter(child => child.$options.name === 'ElCarouselItem');
    },

    resetItemPosition(oldIndex) {
      this.items.forEach((item, index) => {
        item.translateItem(index, this.activeIndex, oldIndex);
      });
    },

    playSlides() {
      if (this.activeIndex < this.items.length - 1) {
        this.activeIndex++;
      } else if (this.loop) {
        this.activeIndex = 0;
      }
    },

    // 暂停定时器
    pauseTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    startTimer() {
      // 时间间隔大于0， 并且自动播放 并且timer不存在（不重复开定时器
      if (this.interval <= 0 || !this.autoplay || this.timer) return;
      this.timer = setInterval(this.playSlides, this.interval);
    },

// index 下一个索引
    setActiveItem(index) {
      // 索引为字符串
      if (typeof index === 'string') {
        // 项目名称
        const filteredItems = this.items.filter(item => item.name === index);
        // 多个项目，只能选一个
        if (filteredItems.length > 0) {
          index = this.items.indexOf(filteredItems[0]);
        }
      }
      index = Number(index);
      // 索引不是一个number 或者向下取整不等自身
      if (isNaN(index) || index !== Math.floor(index)) {
        console.warn('[Element Warn][Carousel]index must be an integer.');
        return;
      }
      // 获取轮播项目个数
      let length = this.items.length;
      // 获取当前这个活跃索引
      const oldIndex = this.activeIndex;

      // 下一个索引小于0，如果配置轮询，就到最后一个，否则还是当前0
      // 如果大于数组长度，一样判断，中间的话，那就正常进行
      if (index < 0) {
        this.activeIndex = this.loop ? length - 1 : 0;
      } else if (index >= length) {
        this.activeIndex = this.loop ? 0 : length - 1;
      } else {
        this.activeIndex = index;
      }
      if (oldIndex === this.activeIndex) {
        // 重置项目位置
        this.resetItemPosition(oldIndex);
      }
    },

// 上一个，（activeIndex，当前活跃的元素索引
    prev() {
      this.setActiveItem(this.activeIndex - 1);
    },
// 下一个
    next() {
      this.setActiveItem(this.activeIndex + 1);
    },
// 点击指示按钮
    handleIndicatorClick(index) {
      this.activeIndex = index;
    },

// 鼠标移上指示按钮，是hover，并且不是当前元素的
    handleIndicatorHover(index) {
      if (this.trigger === 'hover' && index !== this.activeIndex) {
        this.activeIndex = index;
      }
    }
  },

  created() {
    this.throttledArrowClick = throttle(300, true, index => {
      this.setActiveItem(index);
    });
    this.throttledIndicatorHover = throttle(300, index => {
      this.handleIndicatorHover(index);
    });
  },

  mounted() {
    this.updateItems();
    // 等待渲染任务完成
    this.$nextTick(() => {
      addResizeListener(this.$el, this.resetItemPosition);
      if (this.initialIndex < this.items.length && this.initialIndex >= 0) {
        this.activeIndex = this.initialIndex;
      }
      this.startTimer();
    });
  },

  beforeDestroy() {
    if (this.$el) removeResizeListener(this.$el, this.resetItemPosition);
    this.pauseTimer();
  }
};
</script>
