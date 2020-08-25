import InfiniteScroll from './src/main.js';

/* istanbul ignore next */
InfiniteScroll.install = function(Vue) {
  // 指令注册
  Vue.directive(InfiniteScroll.name, InfiniteScroll);
};

export default InfiniteScroll;
