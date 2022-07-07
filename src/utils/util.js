import Vue from 'vue';
import { isString, isObject } from 'element-ui/src/utils/types';

// 缓存方法，查看对象是否存在实例属性
const hasOwnProperty = Object.prototype.hasOwnProperty;

export function noop() { };

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
};

// to 继承 from 
function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
};

// 将数组中的object进行拷贝到res
export function toObject(arr) {
  var res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
};

/**
 * 通过path获取value
 * @param {*} object {name:{age:abc:{}}}
 * @param {*} prop 'name.age.abc'
 */
export const getValueByPath = function (object, prop) {
  prop = prop || '';
  const paths = prop.split('.');
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;

    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

/**
 * 通过path获取prop
 * @param {*} obj {name:{age:abc:{}}}
 * @param {*} path [name][age][acc]
 * @param {*} strict 
 */
export function getPropByPath(obj, path, strict) {
  let tempObj = obj;
  // [ 一个或多个 字母，数字，下划线 ] [name] =》 .name
  path = path.replace(/\[(\w+)\]/g, '.$1');
  // 开头是 .name.age.abc' , 替换为 name.age.abc
  path = path.replace(/^\./, '');

  // 获取属性key的数组  name.age.abc
  let keyArr = path.split('.');
  let i = 0;
  //  3 i<2  ['name','age', 'abc']
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    // 对象上有属性
    if (key in tempObj) {
      // 获取属性的值,获取倒数二个属性值
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    // 获取最后一个属性的值
    o: tempObj,
    // 获取最后一个属性key
    k: keyArr[i],
    // 获取最后一个属性值
    v: tempObj ? tempObj[keyArr[i]] : null
  };
};

// 生成id,随机数*10000 [0,1)
export const generateId = function () {
  return Math.floor(Math.random() * 10000);
};

// 比较数组(比较结构)
export const valueEquals = (a, b) => {
  // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
  // 类型都相等（值类型  引用相同（引用类型
  if (a === b) return true;
  // 非数组
  if (!(a instanceof Array)) return false;
  // 非数组
  if (!(b instanceof Array)) return false;
  // 长度不等
  if (a.length !== b.length) return false;
  // 比较每个元素
  for (let i = 0; i !== a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// 避免正则字符串 ： 指定的字符 | \ {} () [] ^ $ + * ? .       整个被匹配的字符出 $&
export const escapeRegexpString = (value = '') => String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

// TODO: use native Array.find, Array.findIndex when IE support is dropped ie支持被取消
export const arrayFindIndex = function (arr, pred) {
  for (let i = 0; i !== arr.length; ++i) {
    if (pred(arr[i])) {
      return i;
    }
  }
  return -1;
};

/**
 * 数组的find方法 polyfill
 * @param {*} arr 数组
 * @param {*} pred 
 */
export const arrayFind = function (arr, pred) {
  const idx = arrayFindIndex(arr, pred);
  return idx !== -1 ? arr[idx] : undefined;
};

// coerce truthy value to array
// 强转真值为数组
export const coerceTruthyValueToArray = function (val) {
  if (Array.isArray(val)) {
    return val;
  } else if (val) {
    return [val];
  } else {
    return [];
  }
};

//判断ie浏览器
export const isIE = function () {
  return !Vue.prototype.$isServer && !isNaN(Number(document.documentMode));
};

// edge浏览器
export const isEdge = function () {
  return !Vue.prototype.$isServer && navigator.userAgent.indexOf('Edge') > -1;
};

// 火狐浏览器
export const isFirefox = function () {
  return !Vue.prototype.$isServer && !!window.navigator.userAgent.match(/firefox/i);
};

//'transform', 'transition', 'animation'属性添加前缀
export const autoprefixer = function (style) {
  if (typeof style !== 'object') return style;
  const rules = ['transform', 'transition', 'animation'];
  const prefixes = ['ms-', 'webkit-'];
  rules.forEach(rule => {
    const value = style[rule];
    if (rule && value) {
      prefixes.forEach(prefix => {
        style[prefix + rule] = value;
      });
    }
  });
  return style;
};

/**
 * 大写字母变为-连接符
 * @param {*} str bacName -> bac-name
 */
export const kebabCase = function (str) {
  // 非-字符 + A-Z (两个字符的匹配)
  const hyphenateRE = /([^-])([A-Z])/g;
  return str
    // 'acbName' => acb-Name
    .replace(hyphenateRE, '$1-$2')
    // .replace(hyphenateRE, '$1-$2')
    .toLowerCase();
};

/**
 * 转大写
 * @param {*} str 
 */
export const capitalize = function (str) {
  // 不是字符串
  if (!isString(str)) return str;
  // 第一个字符转大写
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 宽松的比较
 * @param {*} a 
 * @param {*} b 
 */
export const looseEqual = function (a, b) {
  // 是否是纯对象
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  // 都是对象
  if (isObjectA && isObjectB) {
    // 序列化后比较,是否相等(递归比较)
    return JSON.stringify(a) === JSON.stringify(b);
    // 都不是对象
  } else if (!isObjectA && !isObjectB) {
    // 转成字符串比较
    return String(a) === String(b);
  } else {
    // 一个是对象,一个不是 
    return false;
  }
};

/**
 * 数组相等
 * @param {*} arrayA 
 * @param {*} arrayB 
 */
export const arrayEquals = function (arrayA, arrayB) {
  arrayA = arrayA || [];
  arrayB = arrayB || [];

  // 长度不等,直接返回
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  // 一个元素一个元素的比较
  for (let i = 0; i < arrayA.length; i++) {
    if (!looseEqual(arrayA[i], arrayB[i])) {
      return false;
    }
  }

  return true;
};

/**
 * 是否相等
 * @param {*} value1 
 * @param {*} value2 
 */
export const isEqual = function (value1, value2) {
  // 都是数字
  if (Array.isArray(value1) && Array.isArray(value2)) {
    // 数组比较
    return arrayEquals(value1, value2);
  }
  // 比较
  return looseEqual(value1, value2);
};

/**
 * 是否变量是否为空
 * @param {*} val 
 */
export const isEmpty = function (val) {
  // null or undefined
  if (val == null) return true;
  // 布尔类型
  if (typeof val === 'boolean') return false;
  // 数值类型 0
  if (typeof val === 'number') return !val;
  // Error类型 是否存在错误信息
  if (val instanceof Error) return val.message === '';

  // 获取对象的toString()方法
  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length;

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size; // 判断尺寸
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length; // 判断尺寸
    }
  }

  return false;
};

/**
 * 帧节流
 * @param {*} fn 
 */
export function rafThrottle(fn) {
  let locked = false;
  return function (...args) {
    // 上一个没有执行完,下一个不能进
    if (locked) return;
    locked = true;
    window.requestAnimationFrame(_ => {
      fn.apply(this, args);
      locked = false;
    });
  };
}
//对象转数组
export function objToArray(obj) {
  if (Array.isArray(obj)) {
    return obj;
  }
  return isEmpty(obj) ? [] : [obj];
}
