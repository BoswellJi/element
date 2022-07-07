import { kebabCase } from 'element-ui/src/utils/util';
/**
 * Show migrating guide in browser console.
 *
 * Usage:
 * import Migrating from 'element-ui/src/mixins/migrating';
 *
 * mixins: [Migrating]
 *
 * add getMigratingConfig method for your component.
 *  getMigratingConfig() {
 *    return {
 *      props: {
 *        'allow-no-selection': 'allow-no-selection is removed.',
 *        'selection-mode': 'selection-mode is removed.'
 *      },
 *      events: {
 *        selectionchange: 'selectionchange is renamed to selection-change.'
 *      }
 *    };
 *  },
 */
export default {
  mounted() {
    // 生产环境返回
    if (process.env.NODE_ENV === 'production') return;
    // 没有$vnode返回
    if (!this.$vnode) return;
    // 
    const { props = {}, events = {} } = this.getMigratingConfig();
    // 获取虚拟节点的data和组件配置
    const { data, componentOptions } = this.$vnode;
    // 获取属性
    const definedProps = data.attrs || {};
    // 获取组件的监听器
    const definedEvents = componentOptions.listeners || {};

    // 定义属性
    for (let propName in definedProps) {
      // 将属性名转换为小驼峰
      propName = kebabCase(propName); // compatible with camel case
      // 获取输入属性的值
      if (props[propName]) {
        // 
        console.warn(`[Element Migrating][${this.$options.name}][Attribute]: ${props[propName]}`);
      }
    }

    /**
     * 获取vnode的监听器对象，进行遍历
     */
    for (let eventName in definedEvents) {
      // 将监听器名称转换为小驼峰的字符串
      eventName = kebabCase(eventName); // compatible with camel case
      // 获取这个事件
      if (events[eventName]) {
        // element 迁移 xxx 组件名 event 事件名
        console.warn(`[Element Migrating][${this.$options.name}][Event]: ${events[eventName]}`);
      }
    }
  },
  methods: {
    // 获取迁移配置
    getMigratingConfig() {
      return {
        props: {},
        events: {}
      };
    }
  }
};
