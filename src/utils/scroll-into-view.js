import Vue from 'vue';

export default function scrollIntoView(container, selected) {
  if (Vue.prototype.$isServer) return;

  if (!selected) {
    container.scrollTop = 0;
    return;
  }

  const offsetParents = [];
  // 元素的父元素
  let pointer = selected.offsetParent;
  // 存在父元素 && 容器元素不是父元素 && 容器元素包含这个父元素
  while (pointer && container !== pointer && container.contains(pointer)) {
    // 将父元素添加到父元素集合
    offsetParents.push(pointer);
    // 获取父元素的父元素
    pointer = pointer.offsetParent;
  }
  // 选中元素的顶部距离 + 每个父元素的顶部距离相加
  const top = selected.offsetTop + offsetParents.reduce((prev, curr) => (prev + curr.offsetTop), 0);
  // 元素的底部距离顶部的高度
  const bottom = top + selected.offsetHeight;
  // 容器的距离
  const viewRectTop = container.scrollTop;
  // 容器的底部距离
  const viewRectBottom = viewRectTop + container.clientHeight;
  // 将元素设置为在视口位置
  if (top < viewRectTop) {
    // 
    container.scrollTop = top;
  } else if (bottom > viewRectBottom) {
    container.scrollTop = bottom - container.clientHeight;
  }
}
