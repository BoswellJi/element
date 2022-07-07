import { hasOwn } from 'element-ui/src/utils/util';

// % | { (0-9a-zA-Z) 多个 } '%{abc123_}'
const RE_NARGS = /(%|)\{([0-9a-zA-Z_]+)\}/g;
/**
 *  String format template
 *  - Inspired:
 *    https://github.com/Matt-Esch/string-template/index.js
 */
export default function(Vue) {

  /**
   * template
   *
   * @param {String} string
   * @param {Array} ...args
   * @return {String}
   */

  function template(string, ...args) {
    // args的长度为1，说明是数组 && 第一个元素是对象
    // 这种情况，说明，传递的参数是 （'string',{name:'jmz'}）
    if (args.length === 1 && typeof args[0] === 'object') {
      // 将第一个元素给args
      args = args[0];
    }

    // 没有参数对象 || 不存在hasOwnProperty属性
    if (!args || !args.hasOwnProperty) {
      // 设置为空对象
      args = {};
    }

    /**
     * 替换字符串中模式字符串 '%{abc123_}' 
     * 1. 匹配到的子串 $&（整体匹配到的子串
     * 2. 对应的组合中匹配到的子串
     * 3. 匹配到的子串，在原字符串中的索引
     * 4. 被匹配到的的元字符串
     * 
     * prefix, i 是组合匹配到的字串
     */
    return string.replace(RE_NARGS, (match, prefix, i, index) => {
      let result;
      // 获取子串的前一个字串是否为{ && 子串的最后一个字符的后一个字符，是否为}
      // 说明是插值表达式
      if (string[index - 1] === '{' &&
        string[index + match.length] === '}') {
          // 是就返回 i，插值变量
        return i;
      } else {
        // args是对象数据，是否存在匹配到的子串
        // 数据对象中，存在子串这个属性，返回这个属性的值
        result = hasOwn(args, i) ? args[i] : null;
        // 没有就为空
        if (result === null || result === undefined) {
          return '';
        }
        // 存在返回
        return result;
      }
    });
  }

  return template;
}
