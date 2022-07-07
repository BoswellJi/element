import Node from './node';
import { getNodeKey } from './util';

/**
 * 树容器
 */
export default class TreeStore {

  /**
   * {
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
    }
   * @param {*} options 
   */
  constructor(options) {
    // 当前节点
    this.currentNode = null;
    // 当前节点的key
    this.currentNodeKey = null;

    // 将配置参数，添加到TreeStore实例上
    // 参数赋值
    for (let option in options) {
      if (options.hasOwnProperty(option)) {
        this[option] = options[option];
      }
    }

    // 节点映射
    this.nodesMap = {};

    // 树的根节点
    this.root = new Node({
      data: this.data,
      store: this
    });

    // 懒加载方式 && 存在加载方法
    if (this.lazy && this.load) {
      // 获取加载方法
      const loadFn = this.load;
      // 对树进行加载， data: 子节点
      loadFn(this.root, (data) => {
        // 给根节点创建子节点
        this.root.doCreateChildren(data);
        this._initDefaultCheckedNodes();
      });
    } else {
      // 初始化默认选中节点
      this._initDefaultCheckedNodes();
    }
  }

  /**
   * 筛选
   * @param {*} value 
   */
  filter(value) {
    // 筛选节点方法，对树节点筛选时，返回true表示节点可以显示，返回false，则表示这个节点会被隐藏
    const filterNodeMethod = this.filterNodeMethod;
    // 懒加载
    const lazy = this.lazy;

    const traverse = function (node) {
      // 当前是根节点，返回子节点
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      // 遍历子节点
      childNodes.forEach((child) => {
        // 传递给筛选方法的参数，返回值决定，是否显示
        child.visible = filterNodeMethod.call(child, value, child.data, child);
        // 遍历子节点的子节点
        traverse(child);
      });

      // 不展示节点 && 子节点的长度
      if (!node.visible && childNodes.length) {
        // 全部隐藏
        let allHidden = true; 
        // 判断子节点是否全部隐藏
        allHidden = !childNodes.some(child => child.visible);

        if (node.root) {
          // 从根节点隐藏
          node.root.visible = allHidden === false;
        } else {
          // 当前节点隐藏
          node.visible = allHidden === false;
        }
      }
      // 空值直接返回
      if (!value) return;

      // 节点显示 && 没有叶子 && 同步加载 调用节点展开方法
      if (node.visible && !node.isLeaf && !lazy) node.expand();
    };

    traverse(this);
  }

  /**
   * 给树重新设置数据
   * @param {*} newVal 
   */
  setData(newVal) {
    // 判断数据是否发生变化
    const instanceChanged = newVal !== this.root.data;
    // 发生变化的
    if (instanceChanged) {
      // 重新设置
      this.root.setData(newVal);
      // 重新初始化
      this._initDefaultCheckedNodes();
    } else {
      // 没有发生变化的，更新子节点
      this.root.updateChildren();
    }
  }

  getNode(data) {
    // 本身就是Node节点
    if (data instanceof Node) return data;
    // 非对象？返回本身 ：返回节点的key值
    const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
    // 
    return this.nodesMap[key] || null;
  }

  insertBefore(data, refData) {
    const refNode = this.getNode(refData);
    refNode.parent.insertBefore({ data }, refNode);
  }

  insertAfter(data, refData) {
    const refNode = this.getNode(refData);
    refNode.parent.insertAfter({ data }, refNode);
  }

  remove(data) {
    const node = this.getNode(data);

    if (node && node.parent) {
      if (node === this.currentNode) {
        this.currentNode = null;
      }
      node.parent.removeChild(node);
    }
  }

  append(data, parentData) {
    const parentNode = parentData ? this.getNode(parentData) : this.root;

    if (parentNode) {
      parentNode.insertChild({ data });
    }
  }

  /**
   * 初始化默认选中的节点
   */
  _initDefaultCheckedNodes() {
    // 获取默认选中的keys，用户配置的选中节点
    const defaultCheckedKeys = this.defaultCheckedKeys || [];
    // 树节点注册的节点映射表，所有树节点
    const nodesMap = this.nodesMap;

    // 对key数组进行遍历
    defaultCheckedKeys.forEach((checkedKey) => {
      // 获取nodesMap
      const node = nodesMap[checkedKey];
      // 节点存在
      if (node) {
        // 设置为选中，根据nodesMap用户设置的节点来设置是否被选中
        node.setChecked(true, !this.checkStrictly);
      }
    });
  }

  /**
   * 初始化默认的选中节点（单个节点
   * @param {*} node 
   */
  _initDefaultCheckedNode(node) {
    // 判断是否重复，根据已有key来
    const defaultCheckedKeys = this.defaultCheckedKeys || [];
    // 设置节点的setChecked方法
    if (defaultCheckedKeys.indexOf(node.key) !== -1) {
      node.setChecked(true, !this.checkStrictly);
    }
  }

  /**
   * 设置默认选中的key
   * @param {*} newVal 
   */
  setDefaultCheckedKey(newVal) {
    // 跟当前默认选中的key不同
    if (newVal !== this.defaultCheckedKeys) {
      // 将默认key设置为新key
      this.defaultCheckedKeys = newVal;
      // 重新初始化节点
      this._initDefaultCheckedNodes();
    }
  }

  /**
   * 注册节点
   * @param {*} node 
   */
  registerNode(node) {
    // 获取当前的key
    const key = this.key;
    // 没有key || 没有node || 没有node.data 直接返回
    if (!key || !node || !node.data) return;

    // 获取节点的key
    const nodeKey = node.key;
    // 存在节点key 将节点设置为nodesMap对象上
    if (nodeKey !== undefined) this.nodesMap[node.key] = node;
  }

  /**
   * 取消注册
   * @param {*} node 节点
   */
  deregisterNode(node) {
    // 获取当前树容器的key
    const key = this.key;
    // node不存在， key不存在 || 节点的 node.data不存在
    if (!key || !node || !node.data) return;

    // 节点的子节点遍历
    node.childNodes.forEach(child => {
      // 进行递归删除
      this.deregisterNode(child);
    });

    // 删除注册表中的 对应 key的，node
    delete this.nodesMap[node.key];
  }

  /**
   * 获取被选中的nodes
   * @param {} leafOnly 
   * @param {*} includeHalfChecked 
   */
  getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
    const checkedNodes = [];
    const traverse = function (node) {
      // 获取根节点的子节点，从根节点开始，重新递归
      const childNodes = node.root ? node.root.childNodes : node.childNodes;
      // 遍历子节点
      childNodes.forEach((child) => {
        // 被选中 || 包含被选中的一半 && 模糊的子节点 && （不是只有叶子节点 || 子节点是叶子）
        if ((child.checked || (includeHalfChecked && child.indeterminate)) && (!leafOnly || (leafOnly && child.isLeaf))) {
          // 将节点数据添加到选中节点中
          checkedNodes.push(child.data);
        }
        // 子节点递归
        traverse(child);
      });
    };

    traverse(this);

    return checkedNodes;
  }

  getCheckedKeys(leafOnly = false) {
    return this.getCheckedNodes(leafOnly).map((data) => (data || {})[this.key]);
  }

  getHalfCheckedNodes() {
    const nodes = [];
    const traverse = function (node) {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      childNodes.forEach((child) => {
        if (child.indeterminate) {
          nodes.push(child.data);
        }

        traverse(child);
      });
    };

    traverse(this);

    return nodes;
  }

  getHalfCheckedKeys() {
    return this.getHalfCheckedNodes().map((data) => (data || {})[this.key]);
  }

  _getAllNodes() {
    const allNodes = [];
    const nodesMap = this.nodesMap;
    for (let nodeKey in nodesMap) {
      if (nodesMap.hasOwnProperty(nodeKey)) {
        allNodes.push(nodesMap[nodeKey]);
      }
    }

    return allNodes;
  }

  updateChildren(key, data) {
    const node = this.nodesMap[key];
    if (!node) return;
    const childNodes = node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i--) {
      const child = childNodes[i];
      this.remove(child.data);
    }
    for (let i = 0, j = data.length; i < j; i++) {
      const child = data[i];
      this.append(child, node.data);
    }
  }

  _setCheckedKeys(key, leafOnly = false, checkedKeys) {
    const allNodes = this._getAllNodes().sort((a, b) => b.level - a.level);
    const cache = Object.create(null);
    const keys = Object.keys(checkedKeys);
    allNodes.forEach(node => node.setChecked(false, false));
    for (let i = 0, j = allNodes.length; i < j; i++) {
      const node = allNodes[i];
      const nodeKey = node.data[key].toString();
      let checked = keys.indexOf(nodeKey) > -1;
      if (!checked) {
        if (node.checked && !cache[nodeKey]) {
          node.setChecked(false, false);
        }
        continue;
      }

      let parent = node.parent;
      while (parent && parent.level > 0) {
        cache[parent.data[key]] = true;
        parent = parent.parent;
      }

      if (node.isLeaf || this.checkStrictly) {
        node.setChecked(true, false);
        continue;
      }
      node.setChecked(true, true);

      if (leafOnly) {
        node.setChecked(false, false);
        const traverse = function (node) {
          const childNodes = node.childNodes;
          childNodes.forEach((child) => {
            if (!child.isLeaf) {
              child.setChecked(false, false);
            }
            traverse(child);
          });
        };
        traverse(node);
      }
    }
  }

  setCheckedNodes(array, leafOnly = false) {
    const key = this.key;
    const checkedKeys = {};
    array.forEach((item) => {
      checkedKeys[(item || {})[key]] = true;
    });

    this._setCheckedKeys(key, leafOnly, checkedKeys);
  }

  setCheckedKeys(keys, leafOnly = false) {
    this.defaultCheckedKeys = keys;
    const key = this.key;
    const checkedKeys = {};
    keys.forEach((key) => {
      checkedKeys[key] = true;
    });

    this._setCheckedKeys(key, leafOnly, checkedKeys);
  }

  setDefaultExpandedKeys(keys) {
    keys = keys || [];
    this.defaultExpandedKeys = keys;

    keys.forEach((key) => {
      const node = this.getNode(key);
      if (node) node.expand(null, this.autoExpandParent);
    });
  }

  setChecked(data, checked, deep) {
    const node = this.getNode(data);

    if (node) {
      node.setChecked(!!checked, deep);
    }
  }

  getCurrentNode() {
    return this.currentNode;
  }

  setCurrentNode(currentNode) {
    // 先将上一个存起来
    const prevCurrentNode = this.currentNode;
    if (prevCurrentNode) {
      prevCurrentNode.isCurrent = false;
    }
    // 再将新的设置给当前属性
    this.currentNode = currentNode;
    // 添加当前属性
    this.currentNode.isCurrent = true;
  }

  setUserCurrentNode(node) {
    const key = node[this.key];
    const currNode = this.nodesMap[key];
    this.setCurrentNode(currNode);
  }

  /**
   * 根据key设置当前节点
   * @param {*} key 
   */
  setCurrentNodeKey(key) {
    // 没有key
    if (key === null || key === undefined) {
      // 将当前节点清掉
      this.currentNode && (this.currentNode.isCurrent = false);
      this.currentNode = null;
      return;
    }
    // 获取当前节点
    const node = this.getNode(key);
    if (node) {
      this.setCurrentNode(node);
    }
  }
};
