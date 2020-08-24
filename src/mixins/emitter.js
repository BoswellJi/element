function broadcast(componentName, eventName, params) {
  // 组件的子组件，当前组件的子组件，进行遍历
  this.$children.forEach(child => {
    // 获取组件的名称
    var name = child.$options.componentName;
    // 子组件名称和当前组件名称一致
    if (name === componentName) {
      // 调用组件的发射事件方法
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      // 不相等，在调用子组件的子组件进行判断
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    /**
     * 发送,派遣
     * @param {*} componentName 组件名
     * @param {*} eventName 事件名
     * @param {*} params 参数
     */
    dispatch(componentName, eventName, params) {
      // 获取父组件 || 获取根组件
      var parent = this.$parent || this.$root;
      // 获取父组件的选项中的组件名
      var name = parent.$options.componentName;

      // 有父组件 && (父组件没有组件名 || 父组件和组件名不相等)
      while (parent && (!name || name !== componentName)) {
        // 获取父组件的组件
        parent = parent.$parent;
        // 父组件
        if (parent) {
          // 获取父组件名
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        // 调用父组件的
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    /**
     * 广播
     * @param {*} componentName 组件名
     * @param {*} eventName 事件名
     * @param {*} params 参数
     */
    broadcast(componentName, eventName, params) {
      // 广播 this是当前组件实例， 组件名， 事件名， 参数
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
