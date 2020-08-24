import Utils from './aria-utils';

/**
 * @constructor
 * @desc Dialog object providing modal focus management.
 *
 * Assumptions: The element serving as the dialog container is present in the
 * DOM and hidden. The dialog container has role='dialog'.
 *
 * @param dialogId
 *          The ID of the element serving as the dialog container.
 * @param focusAfterClosed
 *          Either the DOM node or the ID of the DOM node to focus when the
 *          dialog closes.
 * @param focusFirst
 *          Optional parameter containing either the DOM node or the ID of the
 *          DOM node to focus when the dialog opens. If not specified, the
 *          first focusable element in the dialog will receive focus.
 */
var aria = aria || {};
var tabEvent;

// 弹框方法
aria.Dialog = function(dialog, focusAfterClosed, focusFirst) {
  // dom节点
  this.dialogNode = dialog;
  // 没有dom节点 || 节点的属性role不为dialog
  if (this.dialogNode === null || this.dialogNode.getAttribute('role') !== 'dialog') {
    // 直接抛错， Dialog需要一个带有ARIA role 弹框的 dom元素
    throw new Error('Dialog() requires a DOM element with ARIA role of dialog.');
  }

  // 元素的id选择器
  if (typeof focusAfterClosed === 'string') {
    // 获取元素的dom对象
    this.focusAfterClosed = document.getElementById(focusAfterClosed);
    // 本身就是对象
  } else if (typeof focusAfterClosed === 'object') {
    // 直接赋值
    this.focusAfterClosed = focusAfterClosed;
  } else {
    // 其他类型，直接赋值null
    this.focusAfterClosed = null;
  }

  // 处理为dom对象或者是null
  if (typeof focusFirst === 'string') {
    this.focusFirst = document.getElementById(focusFirst);
  } else if (typeof focusFirst === 'object') {
    this.focusFirst = focusFirst;
  } else {
    this.focusFirst = null;
  }

  // 当前存在，直接调用聚焦方法
  if (this.focusFirst) {
    this.focusFirst.focus();
  } else {
    // 
    Utils.focusFirstDescendant(this.dialogNode);
  }

  // 获取活跃元素，（聚焦的元素
  this.lastFocus = document.activeElement;
  tabEvent = (e) => {
    this.trapFocus(e);
  };
  this.addListeners();
};

// 绑定/解绑事件方法
aria.Dialog.prototype.addListeners = function() {
  document.addEventListener('focus', tabEvent, true);
};

aria.Dialog.prototype.removeListeners = function() {
  document.removeEventListener('focus', tabEvent, true);
};

// 关闭弹框
aria.Dialog.prototype.closeDialog = function() {
  // 删除监听函数
  this.removeListeners();
  // 关闭后聚焦
  if (this.focusAfterClosed) {
    setTimeout(() => {
      // 异步调用聚焦方法
      this.focusAfterClosed.focus();
    });
  }
};

aria.Dialog.prototype.trapFocus = function(event) {
  if (Utils.IgnoreUtilFocusChanges) {
    return;
  }
  // 弹框节点包含事件的目标对象
  if (this.dialogNode.contains(event.target)) {
    // 上一个聚焦对象
    this.lastFocus = event.target;
  } else {
    // 
    Utils.focusFirstDescendant(this.dialogNode);
    // 聚焦对象 === 文档活跃对象
    if (this.lastFocus === document.activeElement) {
      // 聚焦上一个父级
      Utils.focusLastDescendant(this.dialogNode);
    }
    this.lastFocus = document.activeElement;
  }
};

export default aria.Dialog;
