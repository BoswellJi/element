import Tree from './src/tree.vue';

/* istanbul ignore next */
/**
 * 给Tree类，设置install方法，来注册组件
 * @param {*} Vue 
 */
Tree.install = function(Vue) {
  Vue.component(Tree.name, Tree);
};

export default Tree;
