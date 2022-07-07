/**
 * 绑定离开后的事件到vue实例,确保离开后在任何浏览器中被调用
 * Bind after-leave event for vue instance. Make sure after-leave is called in any browsers.
 *
 * @param {Vue} instance Vue instance.
 * @param {Function} callback callback of after-leave event
 * @param {Number} speed the speed of transition, default value is 300ms
 * @param {Boolean} once weather bind after-leave once. default value is false.
 */
export default function(instance, callback, speed = 300, once = false) {
  // 组件实例和回调函数都存在
  if (!instance || !callback) throw new Error('instance & callback is required');
  let called = false;
  // 组件离开后的回调函数
  const afterLeaveCallback = function() {
    // 确保调用没有完成的情况下,不会多次触发
    if (called) return;
    called = true;
    if (callback) {
      callback.apply(null, arguments);
    }
  };
  if (once) {
    // 一次性绑定
    instance.$once('after-leave', afterLeaveCallback);
  } else {
    // 给组件绑定事件
    instance.$on('after-leave', afterLeaveCallback);
  }
  // 延迟调用组件的离开回调
  setTimeout(() => {
    afterLeaveCallback();
  }, speed + 100);
};
