import Pager from './pager.vue';
import ElSelect from 'element-ui/packages/select';
import ElOption from 'element-ui/packages/option';
import ElInput from 'element-ui/packages/input';
import Locale from 'element-ui/src/mixins/locale';
import { valueEquals } from 'element-ui/src/utils/util';

export default {
  // 为注册用的组件名
  name: 'ElPagination',

  // 组件暴露的属性
  props: {
    // 每页尺寸
    pageSize: {
      type: Number,
      default: 10
    },
    
    // 按钮大小 
    small: Boolean,

    // 总条数
    total: Number,

    // 页数
    pageCount: Number,

    // 页码按钮的数量
    pagerCount: {
      type: Number,
      validator(value) {
        // 奇数 (value | 0)：当位falsy值时，返回0
        return (value | 0) === value && value > 4 && value < 22 && (value % 2) === 1;
      },
      default: 7
    },

    // 当前页码
    currentPage: {
      type: Number,
      default: 1
    },

    // 组件布局
    layout: {
      default: 'prev, pager, next, jumper, ->, total'
    },

    // 每页显示选择器的选项
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 40, 50, 100];
      }
    },

    // 每页显示个数选择器的下拉框类名
    popperClass: String,

    // 上一个文本
    prevText: String,

    // 下一页文本
    nextText: String,

    // 分页按钮添加背景
    background: Boolean,

    // 不可用
    disabled: Boolean,

    // 只有一页时是否隐藏
    hideOnSinglePage: Boolean
  },

  data() {
    return {
      // 内部当前页面
      internalCurrentPage: 1,
      // 内部页面尺寸
      internalPageSize: 0,
      // 
      lastEmittedPage: -1,
      // 用户修改页尺寸
      userChangePageSize: false
    };
  },

  render(h) {
    // 当前布局配置
    const layout = this.layout;
    // 没有布局，返回
    if (!layout) return null;
    // 只有一页时，隐藏
    if (this.hideOnSinglePage && (!this.internalPageCount || this.internalPageCount === 1)) return null;

    let template = <div class={['el-pagination', {
      'is-background': this.background,
      'el-pagination--small': this.small
    }] }></div>;

    
    // 分页布局对应的组件
    const TEMPLATE_MAP = {
      // 上一页
      prev: <prev></prev>,
      // 输入框跳转
      jumper: <jumper></jumper>,
      // 页码组件
      pager: <pager currentPage={ this.internalCurrentPage } pageCount={ this.internalPageCount } pagerCount={ this.pagerCount } on-change={ this.handleCurrentChange } disabled={ this.disabled }></pager>,
      // 下一页
      next: <next></next>,
      // 分页器，改变每页的条数
      sizes: <sizes pageSizes={ this.pageSizes }></sizes>,
      // 自定义元素vnode
      slot: <slot>{ this.$slots.default ? this.$slots.default : '' }</slot>,
      // 总条目/总页面数
      total: <total></total>
    };
    // 布局顺序，文本
    const components = layout.split(',').map((item) => item.trim());
    // 右边包裹
    const rightWrapper = <div class="el-pagination__rightwrapper"></div>;
    // 默认没有右边
    let haveRightWrapper = false;

    // 模板的子类 vnode
    template.children = template.children || [];

    // 给右边添加子组件
    rightWrapper.children = rightWrapper.children || [];
    // 组件的文本
    components.forEach(compo => {
      // 有右边包裹组件
      if (compo === '->') {
        // 切换方法
        haveRightWrapper = true;
        return;
      }

      // 没有右边包裹
      if (!haveRightWrapper) {
        // 将分页中的布局组件添加到模板的子组件中
        template.children.push(TEMPLATE_MAP[compo]);
      } else {
        // 将右边包裹
        rightWrapper.children.push(TEMPLATE_MAP[compo]);
      }
    });
    // 有右边,将右边组件添加到分页模板的右边
    if (haveRightWrapper) {
      template.children.unshift(rightWrapper);
    }

    // 整个分页组件的vnode
    return template;
  },

  components: {
    Prev: {
      render(h) {
        return (
          // 前一页按钮
          <button
            type="button"
            class="btn-prev"
            // 不可用时 || 内部的当前页<=1,就是在第一页
            disabled={ this.$parent.disabled || this.$parent.internalCurrentPage <= 1 }
            // 点击按钮的事件
            on-click={ this.$parent.prev }>
            {
              this.$parent.prevText
                ? <span>{ this.$parent.prevText }</span>
                : <i class="el-icon el-icon-arrow-left"></i>
            }
          </button>
        );
      }
    },

    Next: {
      render(h) {
        return (
          <button
            type="button"
            class="btn-next"
            disabled={ this.$parent.disabled || this.$parent.internalCurrentPage === this.$parent.internalPageCount || this.$parent.internalPageCount === 0 }
            on-click={ this.$parent.next }>
            {
              this.$parent.nextText
                ? <span>{ this.$parent.nextText }</span>
                : <i class="el-icon el-icon-arrow-right"></i>
            }
          </button>
        );
      }
    },

    Sizes: {
      mixins: [Locale],

      props: {
        pageSizes: Array
      },

      watch: {
        pageSizes: {
          immediate: true,
          handler(newVal, oldVal) {
            if (valueEquals(newVal, oldVal)) return;
            if (Array.isArray(newVal)) {
              this.$parent.internalPageSize = newVal.indexOf(this.$parent.pageSize) > -1
                ? this.$parent.pageSize
                : this.pageSizes[0];
            }
          }
        }
      },

      render(h) {
        return (
          // 下拉列表，选择一页的条目数量
          <span class="el-pagination__sizes">
            <el-select
              value={ this.$parent.internalPageSize }
              popperClass={ this.$parent.popperClass || '' }
              size="mini"
              on-input={ this.handleChange }
              disabled={ this.$parent.disabled }>
              {
                this.pageSizes.map(item =>
                  <el-option
                    value={ item }
                    label={ item + this.t('el.pagination.pagesize') }>
                  </el-option>
                )
              }
            </el-select>
          </span>
        );
      },

      components: {
        ElSelect,
        ElOption
      },

      methods: {
        /**
         * 修改每页的条目数量
         * @param {*} val 
         */
        handleChange(val) {
          // 切换相等的时候，才会修改，其他不会
          if (val !== this.$parent.internalPageSize) {
            // 设置内部页面尺寸
            this.$parent.internalPageSize = val = parseInt(val, 10);
            // 设置是否用户改变
            this.$parent.userChangePageSize = true;
            this.$parent.$emit('update:pageSize', val);
            this.$parent.$emit('size-change', val);
          }
        }
      }
    },

    Jumper: {
      mixins: [Locale],

      components: { ElInput },

      data() {
        return {
          userInput: null
        };
      },

      watch: {
        '$parent.internalCurrentPage'() {
          this.userInput = null;
        }
      },

      methods: {
        handleKeyup({ keyCode, target }) {
          // Chrome, Safari, Firefox triggers change event on Enter
          // Hack for IE: https://github.com/ElemeFE/element/issues/11710
          // Drop this method when we no longer supports IE
          if (keyCode === 13) {
            this.handleChange(target.value);
          }
        },
        handleInput(value) {
          this.userInput = value;
        },
        handleChange(value) {
          // 跳转到指定页码的页面
          this.$parent.internalCurrentPage = this.$parent.getValidCurrentPage(value);
          this.$parent.emitChange();
          this.userInput = null;
        }
      },

      render(h) {
        return (
          <span class="el-pagination__jump">
            { this.t('el.pagination.goto') }
            <el-input
              class="el-pagination__editor is-in-pagination"
              min={ 1 }
              max={ this.$parent.internalPageCount }
              value={ this.userInput !== null ? this.userInput : this.$parent.internalCurrentPage }
              type="number"
              disabled={ this.$parent.disabled }
              nativeOnKeyup={ this.handleKeyup }
              onInput={ this.handleInput }
              onChange={ this.handleChange }/>
            { this.t('el.pagination.pageClassifier') }
          </span>
        );
      }
    },

    Total: {
      mixins: [Locale],

      render(h) {
        return (
          typeof this.$parent.total === 'number'
            ? <span class="el-pagination__total">{ this.t('el.pagination.total', { total: this.$parent.total }) }</span>
            : ''
        );
      }
    },

    Pager
  },

  methods: {
    // 处理当前改变
    handleCurrentChange(val) {
      // 获取有效当前页码
      this.internalCurrentPage = this.getValidCurrentPage(val);
      // 用户手动设置
      this.userChangePageSize = true;
      // 触发改变事件
      this.emitChange();
    },

    /**
     * 上一页
     */
    prev() {
      // 不可用
      if (this.disabled) return;
      // 当前页面减1
      const newVal = this.internalCurrentPage - 1;
      // 获取有效当前页
      this.internalCurrentPage = this.getValidCurrentPage(newVal);
      // 调用前一个点击事件，传入当前页码
      this.$emit('prev-click', this.internalCurrentPage);
      this.emitChange();
    },

    next() {
      if (this.disabled) return;
      // 当前页面加1
      const newVal = this.internalCurrentPage + 1;
      this.internalCurrentPage = this.getValidCurrentPage(newVal);
      this.$emit('next-click', this.internalCurrentPage);
      this.emitChange();
    },

    /**
     * 获取有效的当前页码
     * @param {*} value 页码
     */
    getValidCurrentPage(value) {
      // 转换为10进制数字
      value = parseInt(value, 10);
      // 总页数
      const havePageCount = typeof this.internalPageCount === 'number';

      let resetValue;
      // 不是数值类型
      if (!havePageCount) {
        // NaN || <1 返回 1，第一页
        if (isNaN(value) || value < 1) resetValue = 1;
      } else {
        // 页码小于1，为1
        if (value < 1) {
          resetValue = 1;
        } else if (value > this.internalPageCount) {
          // 大于总页数，用最大页码
          resetValue = this.internalPageCount;
        }
      }
      // 重置页码 不存在
      if (resetValue === undefined && isNaN(value)) {
        resetValue = 1;
        // 重置页码为0
      } else if (resetValue === 0) {
        resetValue = 1;
      }

      return resetValue === undefined ? value : resetValue;
    },
    // 发射当前改变
    emitChange() {
      this.$nextTick(() => {
        // 内部当前页码 最后发射页码 || 用户设置一页此村
        if (this.internalCurrentPage !== this.lastEmittedPage || this.userChangePageSize) {
          // 发射当前页码改变事件
          this.$emit('current-change', this.internalCurrentPage);
          // 当前页码就是最后一个页码
          this.lastEmittedPage = this.internalCurrentPage;
          // 非用户设置
          this.userChangePageSize = false;
        }
      });
    }
  },

  computed: {
    // 内部总页数
    // 根据总条目 || 总页数  进行处理
    internalPageCount() {
      // 判断是否为数值类型
      if (typeof this.total === 'number') {
        // 获取最大值 向上取整
        return Math.max(1, Math.ceil(this.total / this.internalPageSize));
        // 总页数
      } else if (typeof this.pageCount === 'number') {
        return Math.max(1, this.pageCount);
      }
      return null;
    }
  },

  watch: {
    currentPage: {
      immediate: true,
      handler(val) {
        this.internalCurrentPage = this.getValidCurrentPage(val);
      }
    },

    pageSize: {
      immediate: true,
      handler(val) {
        this.internalPageSize = isNaN(val) ? 10 : val;
      }
    },

    internalCurrentPage: {
      immediate: true,
      handler(newVal) {
        this.$emit('update:currentPage', newVal);
        this.lastEmittedPage = -1;
      }
    },

    internalPageCount(newVal) {
      /* istanbul ignore if */
      const oldPage = this.internalCurrentPage;
      if (newVal > 0 && oldPage === 0) {
        this.internalCurrentPage = 1;
      } else if (oldPage > newVal) {
        this.internalCurrentPage = newVal === 0 ? 1 : newVal;
        this.userChangePageSize && this.emitChange();
      }
      this.userChangePageSize = false;
    }
  }
};
