export function isDef(val) {
  return val !== undefined && val !== null;
}
/**
 * 韩语字符范畴
 * @param {*} text 
 */
export function isKorean(text) {
  // uAC00 - uD7AF 的字符 或者 u3130 - u318F 的字符
  const reg = /([(\uAC00-\uD7AF)|(\u3130-\u318F)])+/gi;
  return reg.test(text);
}
