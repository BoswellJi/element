<template>
  <div
    class="el-tree"
    :class="{
      'el-tree--highlight-current': highlightCurrent,
      'is-dragging': !!dragState.draggingNode,
      'is-drop-not-allow': !dragState.allowDrop,
      'is-drop-inner': dragState.dropType === 'inner'
    }"
    role="tree"
  >
    <!-- 树,遍历会有多棵树-->
    <el-tree-node
      v-for="child in root.childNodes"
      :node="child"
      :props="props"
      :render-after-expand="renderAfterExpand"
      :show-checkbox="showCheckbox"
      :key="getNodeKey(child)"
      :render-content="renderContent"
      @node-expand="handleNodeExpand"
    ></el-tree-node>
    <div class="el-tree__empty-block" v-if="isEmpty">
      <span class="el-tree__empty-text">{{ emptyText }}</span>
    </div>
    <div v-show="dragState.showDropIndicator" class="el-tree__drop-indicator" ref="dropIndicator"></div>
  </div>
</template>

<script>
import TreeStore from "./model/tree-store";
import { getNodeKey, findNearestComponent } from "./model/util";
import ElTreeNode from "./tree-node.vue";
import { t } from "element-ui/src/locale";
import emitter from "element-ui/src/mixins/emitter";
import { addClass, removeClass } from "element-ui/src/utils/dom";

export default {
  name: "ElTree",

  mixins: [emitter],

  components: {
    ElTreeNode,
  },

  data() {
    return {
      store: null,
      // 树的根节点
      root: null,
      currentNode: null,
      treeItems: null,
      checkboxItems: [],
      dragState: {
        showDropIndicator: false,
        draggingNode: null,
        dropNode: null,
        allowDrop: true,
      },
    };
  },

  props: {
    // 树中的数据
    data: {
      type: Array,
    },
    // 没有内容是的替代
    emptyText: {
      type: String,
      default() {
        return t("el.tree.emptyText");
      },
    },
    renderAfterExpand: {
      type: Boolean,
      default: true,
    },
    // 节点的唯一标识
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    expandOnClickNode: {
      type: Boolean,
      default: true,
    },
    // 是否在点击节点的时候，展开或者收缩
    checkOnClickNode: Boolean,
    // 
    checkDescendants: {
      type: Boolean,
      default: false,
    },
    // 自动展开父节点
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    // 默认选中的key
    defaultCheckedKeys: Array,
    // 默认展开的key
    defaultExpandedKeys: Array,
    // 当前选中节点
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    allowDrag: Function,
    allowDrop: Function,
    props: {
      default() {
        return {
          children: "children",
          label: "label",
          disabled: "disabled",
        };
      },
    },
    // 子树是否懒加载
    lazy: {
      type: Boolean,
      default: false,
    },
    highlightCurrent: Boolean,
    // 加载子树时的方法，当lazy为true时，生效
    load: Function,
    filterNodeMethod: Function,
    accordion: Boolean,
    indent: {
      type: Number,
      default: 18,
    },
    iconClass: String,
  },

  computed: {
    children: {
      set(value) {
        this.data = value;
      },
      get() {
        return this.data;
      },
    },

    treeItemArray() {
      return Array.prototype.slice.call(this.treeItems);
    },

    isEmpty() {
      const { childNodes } = this.root;
      return (
        !childNodes ||
        childNodes.length === 0 ||
        childNodes.every(({ visible }) => !visible)
      );
    },
  },

  watch: {
    defaultCheckedKeys(newVal) {
      this.store.setDefaultCheckedKey(newVal);
    },

    defaultExpandedKeys(newVal) {
      this.store.defaultExpandedKeys = newVal;
      this.store.setDefaultExpandedKeys(newVal);
    },

    data(newVal) {
      this.store.setData(newVal);
    },

    checkboxItems(val) {
      Array.prototype.forEach.call(val, (checkbox) => {
        checkbox.setAttribute("tabindex", -1);
      });
    },

    checkStrictly(newVal) {
      this.store.checkStrictly = newVal;
    },
  },

  methods: {
    filter(value) {
      if (!this.filterNodeMethod)
        throw new Error("[Tree] filterNodeMethod is required when filter");
      this.store.filter(value);
    },

    /**
     * 获取节点的data中的key
     */
    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data);
    },

    /**
     * 根据data获取节点在整个数中的路径数组
     */
    getNodePath(data) {
      //节点没有唯一标识
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in getNodePath");
        // 获取树节点
      const node = this.store.getNode(data);
      if (!node) return [];
      const path = [node.data];
      let parent = node.parent;
      while (parent && parent !== this.root) {
        path.push(parent.data);
        parent = parent.parent;
      }
      return path.reverse();
    },
    
    getCheckedNodes(leafOnly, includeHalfChecked) {
      return this.store.getCheckedNodes(leafOnly, includeHalfChecked);
    },

    getCheckedKeys(leafOnly) {
      return this.store.getCheckedKeys(leafOnly);
    },

    // 获取当前的节点，返回当前节点数据
    getCurrentNode() {
      const currentNode = this.store.getCurrentNode();
      return currentNode ? currentNode.data : null;
    },

    getCurrentKey() {
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in getCurrentKey");
      const currentNode = this.getCurrentNode();
      return currentNode ? currentNode[this.nodeKey] : null;
    },

    setCheckedNodes(nodes, leafOnly) {
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in setCheckedNodes");
      this.store.setCheckedNodes(nodes, leafOnly);
    },

    setCheckedKeys(keys, leafOnly) {
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in setCheckedKeys");
      this.store.setCheckedKeys(keys, leafOnly);
    },

    setChecked(data, checked, deep) {
      this.store.setChecked(data, checked, deep);
    },

    getHalfCheckedNodes() {
      return this.store.getHalfCheckedNodes();
    },

    getHalfCheckedKeys() {
      return this.store.getHalfCheckedKeys();
    },

    setCurrentNode(node) {
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in setCurrentNode");
      this.store.setUserCurrentNode(node);
    },

    setCurrentKey(key) {
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in setCurrentKey");
      this.store.setCurrentNodeKey(key);
    },

    getNode(data) {
      return this.store.getNode(data);
    },

    remove(data) {
      this.store.remove(data);
    },

    append(data, parentNode) {
      this.store.append(data, parentNode);
    },

    insertBefore(data, refNode) {
      this.store.insertBefore(data, refNode);
    },

    insertAfter(data, refNode) {
      this.store.insertAfter(data, refNode);
    },

    handleNodeExpand(nodeData, node, instance) {
      this.broadcast("ElTreeNode", "tree-node-expand", node);
      this.$emit("node-expand", nodeData, node, instance);
    },

    updateKeyChildren(key, data) {
      if (!this.nodeKey)
        throw new Error("[Tree] nodeKey is required in updateKeyChild");
      this.store.updateChildren(key, data);
    },

    /**
     * 个首个节点，设置tabIndex属性
     *
     * 1. 可以被获取焦点的树节点
     * 2. checkbox类型的节点
     * 3. 被选中的树节点
     */
    initTabIndex() {
      // 获取可以被聚焦的dom元素
      this.treeItems = this.$el.querySelectorAll(
        ".is-focusable[role=treeitem]"
      );
      // 获取checkbox类型的input
      this.checkboxItems = this.$el.querySelectorAll("input[type=checkbox]");
      // 获取被选中的树的节点
      const checkedItem = this.$el.querySelectorAll(
        ".is-checked[role=treeitem]"
      );
      // 是否存在被选中的元素
      if (checkedItem.length) {
        // 获取第一个元素这只tabIndex html特性为0
        checkedItem[0].setAttribute("tabindex", 0);
        return;
      }
      // 获取第一个树节点 && 给第一个树节点设置tabIndex为0
      this.treeItems[0] && this.treeItems[0].setAttribute("tabindex", 0);
    },

    /**
     * 树节点上的键盘按下事件的回调函数
     */
    handleKeydown(ev) {
      // 当前目标元素
      const currentItem = ev.target;
      // 目标元素的class不存在 el-tree-node，直接返回
      if (currentItem.className.indexOf("el-tree-node") === -1) return;
      // 获取键盘案件代码
      const keyCode = ev.keyCode;
      // 获取可以被获取焦点的树节点
      this.treeItems = this.$el.querySelectorAll(
        ".is-focusable[role=treeitem]"
      );
      // 在树节点中，找当前节点
      const currentIndex = this.treeItemArray.indexOf(currentItem);

      let nextIndex;
      // 筛选按键
      if ([38, 40].indexOf(keyCode) > -1) {
        // up、down
        // 阻止默认事件
        ev.preventDefault();
        
        if (keyCode === 38) {
          // up
          // 向下移动一个
          nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0;
        } else {
          // 向上移动一个
          nextIndex =
            currentIndex < this.treeItemArray.length - 1 ? currentIndex + 1 : 0;
        }
        // 树节点数组中获取焦点
        this.treeItemArray[nextIndex].focus(); // 选中
      }
      // 左右
      if ([37, 39].indexOf(keyCode) > -1) {
        // left、right 展开
        ev.preventDefault();
        // 选中树节点
        currentItem.click(); // 选中
      }
      // 获取树节点下的checbox
      const hasInput = currentItem.querySelector('[type="checkbox"]');
      //
      if ([13, 32].indexOf(keyCode) > -1 && hasInput) {
        // space enter选中checkbox
        ev.preventDefault();
        // 选中
        hasInput.click();
      }
    },
  },

  created() {
    // 树组件
    this.isTree = true;

    // 实例化 树的数据结构
    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      props: this.props,
      load: this.load,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod,
    });

    // 获取，获取根节点 { childNodes:[] }
    this.root = this.store.root;

    // 拖拽状态
    let dragState = this.dragState;

    // 拖拽开始
    this.$on("tree-node-drag-start", (event, treeNode) => {
      // 允许拖拽 &&
      if (
        typeof this.allowDrag === "function" &&
        !this.allowDrag(treeNode.node)
      ) {
        event.preventDefault();
        return false;
      }
      event.dataTransfer.effectAllowed = "move";

      // wrap in try catch to address IE's error when first param is 'text/plain'
      try {
        // setData is required for draggable to work in FireFox
        // the content has to be '' so dragging a node out of the tree won't open a new tab in FireFox
        event.dataTransfer.setData("text/plain", "");
      } catch (e) {}
      dragState.draggingNode = treeNode;
      this.$emit("node-drag-start", treeNode.node, event);
    });

    // 拖拽结束
    this.$on("tree-node-drag-over", (event, treeNode) => {
      const dropNode = findNearestComponent(event.target, "ElTreeNode");
      const oldDropNode = dragState.dropNode;
      if (oldDropNode && oldDropNode !== dropNode) {
        removeClass(oldDropNode.$el, "is-drop-inner");
      }
      const draggingNode = dragState.draggingNode;
      if (!draggingNode || !dropNode) return;

      let dropPrev = true;
      let dropInner = true;
      let dropNext = true;
      let userAllowDropInner = true;
      if (typeof this.allowDrop === "function") {
        dropPrev = this.allowDrop(draggingNode.node, dropNode.node, "prev");
        userAllowDropInner = dropInner = this.allowDrop(
          draggingNode.node,
          dropNode.node,
          "inner"
        );
        dropNext = this.allowDrop(draggingNode.node, dropNode.node, "next");
      }
      event.dataTransfer.dropEffect = dropInner ? "move" : "none";
      if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
        if (oldDropNode) {
          this.$emit(
            "node-drag-leave",
            draggingNode.node,
            oldDropNode.node,
            event
          );
        }
        this.$emit("node-drag-enter", draggingNode.node, dropNode.node, event);
      }

      if (dropPrev || dropInner || dropNext) {
        dragState.dropNode = dropNode;
      }

      if (dropNode.node.nextSibling === draggingNode.node) {
        dropNext = false;
      }
      if (dropNode.node.previousSibling === draggingNode.node) {
        dropPrev = false;
      }
      if (dropNode.node.contains(draggingNode.node, false)) {
        dropInner = false;
      }
      if (
        draggingNode.node === dropNode.node ||
        draggingNode.node.contains(dropNode.node)
      ) {
        dropPrev = false;
        dropInner = false;
        dropNext = false;
      }

      const targetPosition = dropNode.$el.getBoundingClientRect();
      const treePosition = this.$el.getBoundingClientRect();

      let dropType;
      const prevPercent = dropPrev
        ? dropInner
          ? 0.25
          : dropNext
          ? 0.45
          : 1
        : -1;
      const nextPercent = dropNext
        ? dropInner
          ? 0.75
          : dropPrev
          ? 0.55
          : 0
        : 1;

      let indicatorTop = -9999;
      const distance = event.clientY - targetPosition.top;
      if (distance < targetPosition.height * prevPercent) {
        dropType = "before";
      } else if (distance > targetPosition.height * nextPercent) {
        dropType = "after";
      } else if (dropInner) {
        dropType = "inner";
      } else {
        dropType = "none";
      }

      const iconPosition = dropNode.$el
        .querySelector(".el-tree-node__expand-icon")
        .getBoundingClientRect();
      const dropIndicator = this.$refs.dropIndicator;
      if (dropType === "before") {
        indicatorTop = iconPosition.top - treePosition.top;
      } else if (dropType === "after") {
        indicatorTop = iconPosition.bottom - treePosition.top;
      }
      dropIndicator.style.top = indicatorTop + "px";
      dropIndicator.style.left = iconPosition.right - treePosition.left + "px";

      if (dropType === "inner") {
        addClass(dropNode.$el, "is-drop-inner");
      } else {
        removeClass(dropNode.$el, "is-drop-inner");
      }

      dragState.showDropIndicator =
        dropType === "before" || dropType === "after";
      dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner;
      dragState.dropType = dropType;
      this.$emit("node-drag-over", draggingNode.node, dropNode.node, event);
    });

    // 拖拽结束
    this.$on("tree-node-drag-end", (event) => {
      const { draggingNode, dropType, dropNode } = dragState;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (draggingNode && dropNode) {
        const draggingNodeCopy = { data: draggingNode.node.data };
        if (dropType !== "none") {
          draggingNode.node.remove();
        }
        if (dropType === "before") {
          dropNode.node.parent.insertBefore(draggingNodeCopy, dropNode.node);
        } else if (dropType === "after") {
          dropNode.node.parent.insertAfter(draggingNodeCopy, dropNode.node);
        } else if (dropType === "inner") {
          dropNode.node.insertChild(draggingNodeCopy);
        }
        if (dropType !== "none") {
          this.store.registerNode(draggingNodeCopy);
        }

        removeClass(dropNode.$el, "is-drop-inner");

        this.$emit(
          "node-drag-end",
          draggingNode.node,
          dropNode.node,
          dropType,
          event
        );
        if (dropType !== "none") {
          this.$emit(
            "node-drop",
            draggingNode.node,
            dropNode.node,
            dropType,
            event
          );
        }
      }
      if (draggingNode && !dropNode) {
        this.$emit("node-drag-end", draggingNode.node, null, dropType, event);
      }

      dragState.showDropIndicator = false;
      dragState.draggingNode = null;
      dragState.dropNode = null;
      dragState.allowDrop = true;
    });
  },

  mounted() {
    // 初始化tab切换的索引
    this.initTabIndex();
    // 给树节点添加，键盘按下事件
    this.$el.addEventListener("keydown", this.handleKeydown);
  },

  updated() {
    // 获取树节点
    this.treeItems = this.$el.querySelectorAll("[role=treeitem]");
    // 获取checkbox类型的节点
    this.checkboxItems = this.$el.querySelectorAll("input[type=checkbox]");
  },
};
</script>
