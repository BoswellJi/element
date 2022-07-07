import directive from './src/directive';
import service from './src/index';

export default {
  install(Vue) {
    // 指令插件，这主要是一个全局指令
    Vue.use(directive);
    // 将加载组件添加到Vue原型上
    Vue.prototype.$loading = service;
  },
  directive,
  service
};
