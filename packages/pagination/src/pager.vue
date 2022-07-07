<template>
  <ul @click="onPagerClick" class="el-pager">
    <!-- 第一页 -->
    <li :class="{ active: currentPage === 1, disabled }" v-if="pageCount > 0" class="number">1</li>
    <!-- 向左移动按钮 -->
    <li
      class="el-icon more btn-quickprev"
      :class="[quickprevIconClass, { disabled }]"
      v-if="showPrevMore"
      @mouseenter="onMouseenter('left')"
      @mouseleave="quickprevIconClass = 'el-icon-more'"
    ></li>
    <!-- 中间页码 -->
    <li
      v-for="pager in pagers"
      :key="pager"
      :class="{ active: currentPage === pager, disabled }"
      class="number"
    >{{ pager }}</li>
    <!-- 向右移动按钮 -->
    <li
      class="el-icon more btn-quicknext"
      :class="[quicknextIconClass, { disabled }]"
      v-if="showNextMore"
      @mouseenter="onMouseenter('right')"
      @mouseleave="quicknextIconClass = 'el-icon-more'"
    ></li>
    <!-- 最后一页 -->
    <li
      :class="{ active: currentPage === pageCount, disabled }"
      class="number"
      v-if="pageCount > 1"
    >{{ pageCount }}</li>
  </ul>
</template>

<script type="text/babel">
export default {
  name: "ElPager",

  props: {
    // 当前页
    currentPage: Number,
    // 总页数
    pageCount: Number,
    // 页码器数量
    pagerCount: Number,
    // 不可用
    disabled: Boolean,
  },

  watch: {
    // 展示向前更多按钮
    showPrevMore(val) {
      if (!val) this.quickprevIconClass = "el-icon-more";
    },
    // 展示向下更多按钮
    showNextMore(val) {
      if (!val) this.quicknextIconClass = "el-icon-more";
    },
  },

  methods: {
    onPagerClick(event) {
      const target = event.target;
      if (target.tagName === "UL" || this.disabled) {
        return;
      }
      // 获取页码按钮的文本
      let newPage = Number(event.target.textContent);
      // 获取总页数
      const pageCount = this.pageCount;
      // 获取当前页码
      const currentPage = this.currentPage;
      // 获取页码器偏移量
      const pagerCountOffset = this.pagerCount - 2;

      // 更多按钮
      if (target.className.indexOf("more") !== -1) {
        // 快速向前按钮
        if (target.className.indexOf("quickprev") !== -1) {
          // 当前页码 - 偏移页数量
          newPage = currentPage - pagerCountOffset;
          // 快速向后按钮
        } else if (target.className.indexOf("quicknext") !== -1) {
          // 当前页码 + 偏移量
          newPage = currentPage + pagerCountOffset;
        }
      }

      /* istanbul ignore if */
      if (!isNaN(newPage)) {
        //
        if (newPage < 1) {
          newPage = 1;
        }

        if (newPage > pageCount) {
          newPage = pageCount;
        }
      }
      // 不是点击的相同的页码按钮才会触发
      if (newPage !== currentPage) {
        this.$emit("change", newPage);
      }
    },

    /**
     * 鼠标移上事件，根据移动到的方向判断快速更多按钮的样式
     */
    onMouseenter(direction) {
      if (this.disabled) return;

      if (direction === "left") {
        this.quickprevIconClass = "el-icon-d-arrow-left";
      } else {
        this.quicknextIconClass = "el-icon-d-arrow-right";
      }
    },
  },

  computed: {
    // 页码器,根据当前操作，调整分页组件
    pagers() {
      // 总页码数，一共展示几个页码按钮
      const pagerCount = this.pagerCount;

      // 因为总页码器数量是奇数，所以中间位置的索引是，下面的计算方式
      // 中间页码的向左一个页码
      const halfPagerCount = (pagerCount - 1) / 2;

      // 获取当前页码
      const currentPage = Number(this.currentPage);
      // 总页数
      const pageCount = Number(this.pageCount);
      // 展示前一个更多按钮，后一个更多按钮
      let showPrevMore = false;
      let showNextMore = false;

      // 总页数 > 页码器数量[1,2,3,...,4,5,6,...,7,8,9]
      if (pageCount > pagerCount) {
        // 展示左边更多按钮条件是：当前页码 > 中间页码
        // 当前页码 > 页码器数量 - 中间位置 展示前一个更多按钮

        // pagerCount - halfPagerCount ： 这个结果是正好是页码器的中间位置
        // 当前页码大于中间页码，就展示向左按钮
        if (pagerCount - currentPage < halfPagerCount) {
          showPrevMore = true;
        }
        // 总页码 - 当前页码
        // pageCount - currentPage < halfPagerCount

        // 展示右边更多按钮条件：当前页码 < 总页数 - 中间页码
        // pageCount - halfPagerCount ： 从中间页码开始向后的所有页码数量
        if (pageCount - currentPage > halfPagerCount) {
          showNextMore = true;
        }
        // 总页码 - 当前页码
        // pageCount - currentPage > halfPagerCount
      }

      // 中间页码器数组
      const array = [];

      // 展示前更多 && 不展示后更多 前两个数码不会放进去
      // 所以页码开始位置就是总页码-放进去的页码数量
      if (showPrevMore && !showNextMore) {
        const startPage = pageCount - (pagerCount - 2);
        for (let i = startPage; i < pageCount; i++) {
          array.push(i);
        }
        // 不展示前更多 && 展示后更多 最后两个数不会放进去
      } else if (!showPrevMore && showNextMore) {
        // 从2开始往后加
        for (let i = 2; i < pagerCount; i++) {
          array.push(i);
        }
        // 两个更多按钮都展示
      } else if (showPrevMore && showNextMore) {
        // 当前页码的前几个和当前页码的后几个
        // 根据页码器的大小来计算偏移量
        const offset = Math.floor(pagerCount / 2) - 1;

        // 展示页码按钮的数组
        // 当前页码减去前后要加减的偏移量
        for (let i = currentPage - offset; i <= currentPage + offset; i++) {
          array.push(i);
        }
      } else {
        // 按钮都不展示，总页数小于页码按钮的数量
        for (let i = 2; i < pageCount; i++) {
          array.push(i);
        }
      }

      this.showPrevMore = showPrevMore;
      this.showNextMore = showNextMore;

      return array;
    },
  },

  data() {
    return {
      // 当前页码
      current: null,
      // 展示向前更多按钮
      showPrevMore: false,
      // 展示向后更多按钮
      showNextMore: false,
      // 快速向后按钮的样式
      quicknextIconClass: "el-icon-more",
      // 快速向前按钮的样式
      quickprevIconClass: "el-icon-more",
    };
  },
};
</script>
