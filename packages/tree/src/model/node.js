import objectAssign from 'element-ui/src/utils/merge';
import { markNodeData, NODE_KEY } from './util';
import { arrayFindIndex } from 'element-ui/src/utils/util';

/**
 * 获取子节点的状态
 * @param {*} node 
 */
export const getChildState = node => {
  // 全选
  let all = true;
  // 非全选
  let none = true;
  // 所有都不可用
  let allWithoutDisable = true;

  // 遍历子节点
  for (let i = 0, j = node.length; i < j; i++) {
    const n = node[i];
    // 没被选中 || 是中间节点的
    if (n.checked !== true || n.indeterminate) {
      // 非全选
      all = false;
      // 可用状态
      if (!n.disabled) {
        // 非全不可用
        allWithoutDisable = false;
      }
    }
    // 选中 || 是中间节点
    if (n.checked !== false || n.indeterminate) {
      // 非全不选
      none = false;
    }
  }
  // 全选 ， 全不选 ， 全都可用 ， 一半（没有全选，没有全不选
  return { all, none, allWithoutDisable, half: !all && !none };
};

const reInitChecked = function(node) {
  if (node.childNodes.length === 0) return;

  const {all, none, half} = getChildState(node.childNodes);
  if (all) {
    node.checked = true;
    node.indeterminate = false;
  } else if (half) {
    node.checked = false;
    node.indeterminate = true;
  } else if (none) {
    node.checked = false;
    node.indeterminate = false;
  }

  const parent = node.parent;
  if (!parent || parent.level === 0) return;

  if (!node.store.checkStrictly) {
    reInitChecked(parent);
  }
};

const getPropertyFromData = function(node, prop) {
  const props = node.store.props;
  const data = node.data || {};
  const config = props[prop];

  if (typeof config === 'function') {
    return config(data, node);
  } else if (typeof config === 'string') {
    return data[config];
  } else if (typeof config === 'undefined') {
    const dataProp = data[prop];
    return dataProp === undefined ? '' : dataProp;
  }
};

let nodeIdSeed = 0;

/**
 * 树节点
 */
export default class Node {
  constructor(options) {
    // id, node的个数
    this.id = nodeIdSeed++;
    // 文本
    this.text = null;
    // 是否被选中
    this.checked = false;
    // 不确定得
    this.indeterminate = false;
    // 数据
    this.data = null;
    // 展开
    this.expanded = false;
    // 父节点
    this.parent = null;
    // 是否可见
    this.visible = true;
    // 是否是当前的
    this.isCurrent = false;

    // 将配置添加到树节点的属性上
    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }

    // internal
    // 层级
    this.level = 0;
    // 被加载
    this.loaded = false;
    // 子节点
    this.childNodes = [];
    // 正在加载
    this.loading = false;

    // 存在父节点
    if (this.parent) {
      // 它的节点等级就为父节点等级+1
      this.level = this.parent.level + 1;
    }
    // 存储
    const store = this.store;
    if (!store) {
      throw new Error('[Node]store is required!');
    }
    // 实例化树节点后，将节点注册到store中
    store.registerNode(this);

    // 获取store的props属性
    const props = store.props;
    // 存在 && 是叶子节点
    if (props && typeof props.isLeaf !== 'undefined') {
      // 节点为叶子节点
      const isLeaf = getPropertyFromData(this, 'isLeaf');
      if (typeof isLeaf === 'boolean') {
        // 用户创建的叶子节点
        this.isLeafByUser = isLeaf;
      }
    }

    // 不懒加载 && 有数
    if (store.lazy !== true && this.data) {
      // 设置数据
      this.setData(this.data);
      // 全部展开
      if (store.defaultExpandAll) {
        // 展开属性就为展开
        this.expanded = true;
      }
      // 层级>0 && lazy懒得 && 全部展开
    } else if (this.level > 0 && store.lazy && store.defaultExpandAll) {
      // 调用展开方法
      this.expand();
    }
    if (!Array.isArray(this.data)) {
      markNodeData(this, this.data);
    }
    if (!this.data) return;
    const defaultExpandedKeys = store.defaultExpandedKeys;
    const key = store.key;
    if (key && defaultExpandedKeys && defaultExpandedKeys.indexOf(this.key) !== -1) {
      this.expand(null, store.autoExpandParent);
    }

    if (key && store.currentNodeKey !== undefined && this.key === store.currentNodeKey) {
      store.currentNode = this;
      store.currentNode.isCurrent = true;
    }

    if (store.lazy) {
      store._initDefaultCheckedNode(this);
    }

    this.updateLeafState();
  }

  /**
   * 设置数据
   * @param {*} data 
   */
  setData(data) {
    // 非数组
    if (!Array.isArray(data)) {
      // 标记节点数据
      markNodeData(this, data);
    }
    // 数据
    this.data = data;
    // 子节点
    this.childNodes = [];

    let children;
    if (this.level === 0 && this.data instanceof Array) {
      children = this.data;
    } else {
      children = getPropertyFromData(this, 'children') || [];
    }

    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] });
    }
  }

  get label() {
    return getPropertyFromData(this, 'label');
  }

  get key() {
    const nodeKey = this.store.key;
    if (this.data) return this.data[nodeKey];
    return null;
  }

  get disabled() {
    return getPropertyFromData(this, 'disabled');
  }

  get nextSibling() {
    const parent = this.parent;
    if (parent) {
      const index = parent.childNodes.indexOf(this);
      if (index > -1) {
        return parent.childNodes[index + 1];
      }
    }
    return null;
  }

  get previousSibling() {
    const parent = this.parent;
    if (parent) {
      const index = parent.childNodes.indexOf(this);
      if (index > -1) {
        return index > 0 ? parent.childNodes[index - 1] : null;
      }
    }
    return null;
  }

  contains(target, deep = true) {
    const walk = function(parent) {
      const children = parent.childNodes || [];
      let result = false;
      for (let i = 0, j = children.length; i < j; i++) {
        const child = children[i];
        if (child === target || (deep && walk(child))) {
          result = true;
          break;
        }
      }
      return result;
    };

    return walk(this);
  }

  remove() {
    const parent = this.parent;
    if (parent) {
      parent.removeChild(this);
    }
  }

  /**
   * 插入节点
   * @param {*} child 
   * @param {*} index 
   * @param {*} batch 补丁
   */
  insertChild(child, index, batch) {
    // 子节点是必须的
    if (!child) throw new Error('insertChild error: child is required.');
    // 子节点非Node实例
    if (!(child instanceof Node)) {
      // 非补丁
      if (!batch) {
        const children = this.getChildren(true) || [];
        if (children.indexOf(child.data) === -1) {
          if (typeof index === 'undefined' || index < 0) {
            children.push(child.data);
          } else {
            children.splice(index, 0, child.data);
          }
        }
      }
      // 
      objectAssign(child, {
        parent: this,
        store: this.store
      });
      child = new Node(child);
    }

    // 当前节点的下一级
    child.level = this.level + 1;
    // 插入的索引位置，没有，直接添加
    if (typeof index === 'undefined' || index < 0) {
      this.childNodes.push(child);
    } else {
      // 有插入得到对应索引位置
      this.childNodes.splice(index, 0, child);
    }
    // 更新叶子状态
    this.updateLeafState();
  }

  insertBefore(child, ref) {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
    }
    this.insertChild(child, index);
  }

  insertAfter(child, ref) {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
      if (index !== -1) index += 1;
    }
    this.insertChild(child, index);
  }

  removeChild(child) {
    const children = this.getChildren() || [];
    const dataIndex = children.indexOf(child.data);
    if (dataIndex > -1) {
      children.splice(dataIndex, 1);
    }

    const index = this.childNodes.indexOf(child);

    if (index > -1) {
      this.store && this.store.deregisterNode(child);
      child.parent = null;
      this.childNodes.splice(index, 1);
    }

    this.updateLeafState();
  }

  /**
   * 通过Data:节点的data删除子节点节点
   * @param {*} data 
   */
  removeChildByData(data) {
    let targetNode = null;

    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i].data === data) {
        targetNode = this.childNodes[i];
        break;
      }
    }

    if (targetNode) {
      this.removeChild(targetNode);
    }
  }

  expand(callback, expandParent) {
    const done = () => {
      if (expandParent) {
        let parent = this.parent;
        while (parent.level > 0) {
          parent.expanded = true;
          parent = parent.parent;
        }
      }
      this.expanded = true;
      if (callback) callback();
    };

    if (this.shouldLoadData()) {
      this.loadData((data) => {
        if (data instanceof Array) {
          if (this.checked) {
            this.setChecked(true, true);
          } else if (!this.store.checkStrictly) {
            reInitChecked(this);
          }
          done();
        }
      });
    } else {
      done();
    }
  }

  /**
   * 创建子节点
   * @param {*} array 节点数组
   * @param {*} defaultProps 
   */
  doCreateChildren(array, defaultProps = {}) {
    // 遍历子节点
    array.forEach((item) => {
      // 将子节点插入
      this.insertChild(objectAssign({ data: item }, defaultProps), undefined, true);
    });
  }

  // 收缩
  collapse() {
    this.expanded = false;
  }

  /**
   * 应该加载数据
   */
  shouldLoadData() {

    return this.store.lazy === true && this.store.load && !this.loaded;
  }

  updateLeafState() {
    // 叶子节点是否懒加载 && 没有被加载 && 非哟ing胡叶子
    if (this.store.lazy === true && this.loaded !== true && typeof this.isLeafByUser !== 'undefined') {
      this.isLeaf = this.isLeafByUser;
      return;
    }
    // 
    const childNodes = this.childNodes;
    if (!this.store.lazy || (this.store.lazy === true && this.loaded === true)) {
      this.isLeaf = !childNodes || childNodes.length === 0;
      return;
    }
    this.isLeaf = false;
  }

  /**
   * 设置选中
   * @param {*} value true/false
   * @param {*} deep 是否深度
   * @param {*} recursion 递归
   * @param {*} passValue 
   */
  setChecked(value, deep, recursion, passValue) {
    // 判断是否是子节点的父节点
    this.indeterminate = value === 'half';
    // 判断节点是否选中
    this.checked = value === true;

    // 
    if (this.store.checkStrictly) return;

    // 不懒加载子节点数据 && 查看后辈节点
    if (!(this.shouldLoadData() && !this.store.checkDescendants)) {
      // 获取子节点的状态
      let { all, allWithoutDisable } = getChildState(this.childNodes);

      // 非叶子 && 不是全选 && 没有不可用
      if (!this.isLeaf && (!all && allWithoutDisable)) {
        // 当前未被选中
        this.checked = false;
        value = false;
      }

      // 处理后辈
      const handleDescendants = () => {
        // 深入检查
        if (deep) {
          // 获取节点的子节点 
          const childNodes = this.childNodes;
          // 
          for (let i = 0, j = childNodes.length; i < j; i++) {
            const child = childNodes[i];
            // 传值
            passValue = passValue || value !== false;
            // 不可用，返回是否被选中， 可用返回传值
            const isCheck = child.disabled ? child.checked : passValue;
            // 再将子节点进行设置check，递归
            child.setChecked(isCheck, deep, true, passValue);
          }
          // 获取子节点状态
          const { half, all } = getChildState(childNodes);
          if (!all) {
            this.checked = all;
            this.indeterminate = half;
          }
        }
      };

      // 子节点需要异步加载数据之后，才能处理选中
      if (this.shouldLoadData()) {
        // Only work on lazy load data.
        this.loadData(() => {
          handleDescendants();
          reInitChecked(this);
        }, {
          checked: value !== false
        });
        return;
      } else {
        handleDescendants();
      }
    }
    // 直接获取父节点
    const parent = this.parent;
    // 没有 || 为根节点
    if (!parent || parent.level === 0) return;

    // 不递归
    if (!recursion) {
      reInitChecked(parent);
    }
  }

  /**
   * 获取子节点
   * @param {*} forceInit 
   */
  getChildren(forceInit = false) { // this is data
    // 根节点，直接返回
    if (this.level === 0) return this.data;
    // 获取节点的数据
    const data = this.data;
    if (!data) return null;

    // 对应的节点结构中的字段 { id:1, children:[] } { children:'children',id:'id'  }
    const props = this.store.props;
    let children = 'children';
    if (props) {
      children = props.children || 'children';
    }
    // 获取data中的子节点的数据
    if (data[children] === undefined) {
      data[children] = null;
    }
    // 强制初始化
    if (forceInit && !data[children]) {
      data[children] = [];
    }
    // 返回节点的子节点
    return data[children];
  }

  updateChildren() {
    const newData = this.getChildren() || [];
    const oldData = this.childNodes.map((node) => node.data);

    const newDataMap = {};
    const newNodes = [];

    newData.forEach((item, index) => {
      const key = item[NODE_KEY];
      const isNodeExists = !!key && arrayFindIndex(oldData, data => data[NODE_KEY] === key) >= 0;
      if (isNodeExists) {
        newDataMap[key] = { index, data: item };
      } else {
        newNodes.push({ index, data: item });
      }
    });

    if (!this.store.lazy) {
      oldData.forEach((item) => {
        if (!newDataMap[item[NODE_KEY]]) this.removeChildByData(item);
      });
    }

    newNodes.forEach(({ index, data }) => {
      this.insertChild({ data }, index);
    });

    this.updateLeafState();
  }

  loadData(callback, defaultProps = {}) {
    // 懒加载 && 存在load函数 && 没有被加载 && (没有正在加载 || 存在默认属性)
    if (this.store.lazy === true && this.store.load && !this.loaded && (!this.loading || Object.keys(defaultProps).length)) {
      this.loading = true;
      // 成功加载后，添加子节点
      const resolve = (children) => {
        this.loaded = true;
        this.loading = false;
        this.childNodes = [];

        this.doCreateChildren(children, defaultProps);

        this.updateLeafState();
        if (callback) {
          callback.call(this, children);
        }
      };
      // this: 这个节点 ，resolve
      this.store.load(this, resolve);
    } else {
      if (callback) {
        callback.call(this);
      }
    }
  }
}
