import defaultLang from 'element-ui/src/locale/lang/zh-CN';
import Vue from 'vue';
import deepmerge from 'deepmerge';
import Format from './format';

// 通过闭包，返回格式化函数
const format = Format(Vue);
// 默认语言
let lang = defaultLang;
let merged = false;
/* 国际化处理 */
let i18nHandler = function() {
  // 获取对象的原型对象的$t属性
  const vuei18n = Object.getPrototypeOf(this || Vue).$t;
  // vueil8n变量是否是函数 && Vue.locale对象是否存在
  if (typeof vuei18n === 'function' && !!Vue.locale) {
    // 是否合并过
    if (!merged) {
      // 已经被合并
      merged = true;
      // 合并对象
      Vue.locale(
        Vue.config.lang,
        // 获取国际化信息，合并到lang对象
        deepmerge(lang, Vue.locale(Vue.config.lang) || {}, { clone: true })
      );
    }
    return vuei18n.apply(this, arguments);
  }
};

/**
 * 根据国际化语言，找到对应的字段
 * @param {*} path 
 * @param {*} options 
 */
export const t = function(path, options) {
  // 获取对应的国际化语言
  let value = i18nHandler.apply(this, arguments);
  // 没有这种语言
  if (value !== null && value !== undefined) return value;
  // 分割从国际化中获取的部分
  const array = path.split('.');
  // 获取国际化的语言
  let current = lang;
  // 根据字串规则的字段进行查找，遍历国际化信息中的指定的部分
  // 遍历直到最外层
  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i];
    value = current[property];
    // 最后一个字段的时候，获取到字符串，将其进行模板处理，返回其值
    if (i === j - 1) return format(value, options);
    if (!value) return '';
    current = value;
  }
  return '';
};

// 设置使用的语言（默认中文简体
// 指定国际化语言
export const use = function(l) {
  lang = l || lang;
};

/**
 * 自定义国际化函数
 * @param {*} fn 
 */
export const i18n = function(fn) {
  i18nHandler = fn || i18nHandler;
};

export default { use, t, i18n };
