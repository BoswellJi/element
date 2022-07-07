import Vue from 'vue';
import Element from 'main/index.js';
import App from './play/index.vue';
// 默认皮肤
import 'packages/theme-chalk/src/index.scss';

// 安装Vue插件Elment
Vue.use(Element);

new Vue({ // eslint-disable-line
  render: h => h(App)
}).$mount('#app');
