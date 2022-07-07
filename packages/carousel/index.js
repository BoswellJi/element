import Carousel from './src/main';

/* istanbul ignore next */
// 单独安装组件
Carousel.install = function(Vue) {
  Vue.component(Carousel.name, Carousel);
};

export default Carousel;
