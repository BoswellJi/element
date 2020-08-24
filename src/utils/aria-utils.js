var aria = aria || {};

aria.Utils = aria.Utils || {};

/**
 * @desc Set focus on descendant nodes until the first focusable element is
 *       found.
 * @param element
 *          DOM node for which to find the first focusable descendant.
 * @returns
 *  true if a focusable element is found and focus is set.
 */
aria.Utils.focusFirstDescendant = function(element) {
  // 获取元素的子元素
  for (var i = 0; i < element.childNodes.length; i++) {
    // 获取子元素
    var child = element.childNodes[i];
    // 当前子元素进行聚焦 || 子元素下的子元素
    if (aria.Utils.attemptFocus(child) || aria.Utils.focusFirstDescendant(child)) {
      return true;
    }
  }
  return false;
};

/**
 * @desc Find the last descendant node that is focusable.
 * @param element
 *          DOM node for which to find the last focusable descendant.
 * @returns
 *  true if a focusable element is found and focus is set.
 */

aria.Utils.focusLastDescendant = function(element) {
  // 遍历子节点
  for (var i = element.childNodes.length - 1; i >= 0; i--) {
    var child = element.childNodes[i];
    // 当前子元素进行聚焦 || 子元素下的子元素
    if (aria.Utils.attemptFocus(child) || aria.Utils.focusLastDescendant(child)) {
      return true;
    }
  }
  return false;
};

/**
 * @desc Set Attempt to set focus on the current node.
 * @param element
 *          The node to attempt to focus on.
 * @returns
 *  true if element is focused.
 * 
 * 尝试聚焦
 */
aria.Utils.attemptFocus = function(element) {
  // 判断元素是否可以聚焦
  if (!aria.Utils.isFocusable(element)) {
    return false;
  }
  // 设置 直到聚焦改变才忽略
  aria.Utils.IgnoreUtilFocusChanges = true;
  try {
    // 设置聚焦
    element.focus();
  } catch (e) {
  }
  // 这时候已经聚焦了
  aria.Utils.IgnoreUtilFocusChanges = false;
  // 当前活跃元素 === 当前聚焦元素
  return (document.activeElement === element);
};

/**
 * dom元素是否可以被聚焦
 * @param {*} element 
 */
aria.Utils.isFocusable = function(element) {
  // 元素的tabIndex属性>0 || tabIndex===0 && tabIndex html特性不为 null
  if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
    // 就是聚焦元素
    return true;
  }

  // 元素直接不可用， 直接不行
  if (element.disabled) {
    return false;
  }

  // 元素节点名
  switch (element.nodeName) {
    case 'A':
      // 存在href属性 && rel属性!=='ignore'
      return !!element.href && element.rel !== 'ignore';
    case 'INPUT':
      // input类型不为hidden和file类型
      return element.type !== 'hidden' && element.type !== 'file';
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }
};

/**
 * 触发一个事件
 * mouseenter, mouseleave, mouseover, keyup, change, click 等
 * @param  {Element} elm
 * @param  {String} name
 * @param  {*} opts
 */
aria.Utils.triggerEvent = function(elm, name, ...opts) {
  let eventName;
  // 正则: 以mouse | click开头的的字符串
  if (/^mouse|click/.test(name)) {
    eventName = 'MouseEvents';
    // 正则： 以key开头的字符串
  } else if (/^key/.test(name)) {
    eventName = 'KeyboardEvent';
  } else {
    eventName = 'HTMLEvents';
  }
  const evt = document.createEvent(eventName);

  evt.initEvent(name, ...opts);
  elm.dispatchEvent
    ? elm.dispatchEvent(evt)
    : elm.fireEvent('on' + name, evt);

  return elm;
};

aria.Utils.keys = {
  tab: 9,
  enter: 13,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  esc: 27
};

export default aria.Utils;
