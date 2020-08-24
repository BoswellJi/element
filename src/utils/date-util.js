import fecha from 'element-ui/src/utils/date';
import { t } from 'element-ui/src/locale';

const weeks = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * 创建新数组
 * @param {*} start 开始数字
 * @param {*} end 结束数字
 */
const newArray = function(start, end) {
  let result = [];
  // 从开始数据遍历到结束
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

// 获取国际化的配置
export const getI18nSettings = () => {
  return {
    // 获取对象的国际化文本
    dayNamesShort: weeks.map(week => t(`el.datepicker.weeks.${ week }`)),
    dayNames: weeks.map(week => t(`el.datepicker.weeks.${ week }`)),
    monthNamesShort: months.map(month => t(`el.datepicker.months.${ month }`)),
    monthNames: months.map((month, index) => t(`el.datepicker.month${ index + 1 }`)),
    amPm: ['am', 'pm']
  };
};

/**
 * 换为日期对象
 * @param {*} date 日期
 */
export const toDate = function(date) {
  // 是否是日期,date的类型为日期格式的，实例化日期，否则为null
  return isDate(date) ? new Date(date) : null;
};

/**
 * 是否为日期
 * @param {*} date 日期
 */
export const isDate = function(date) {
  // date为空,直接返回false
  if (date === null || date === undefined) return false;
  // 日期是无效日期的，直接返回false
  if (isNaN(new Date(date).getTime())) return false;
  // 日期类型为array的，直接返回false
  if (Array.isArray(date)) return false; // deal with `new Date([ new Date() ]) -> new Date()`
  return true;
};

/**
 * 是否为Date实例
 * @param {*} val 
 */
export const isDateObject = function(val) {
  return val instanceof Date;
};

/**
 * 格式化日期
 * @param {*} date 
 * @param {*} format 
 */
export const formatDate = function(date, format) {
  // 将日期转换为Date类型
  date = toDate(date);
  // 为null,返回 ''
  if (!date) return '';
  // 将Date对象类型转换为指定格式的字符串
  return fecha.format(date, format || 'yyyy-MM-dd', getI18nSettings());
};

/**
 * 解析日期
 * @param {*} string 
 * @param {*} format 
 */
export const parseDate = function(string, format) {
  // 解析日期字符串
  return fecha.parse(string, format || 'yyyy-MM-dd', getI18nSettings());
};

/**
 * 获取月份的天数
 * @param {*} year 年
 * @param {*} month 月
 */
export const getDayCountOfMonth = function(year, month) {
  //因为js中获取的月份要跟实际月份少一个月
  // 小月
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }

  // 2月份
  if (month === 1) {
    // 闰年29，平年28  普通闰年，世纪闰年
    // 能被4整除 && 不能被100整除 || 能被400整除 是闰年 29天
    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
      return 29;
    } else {
      return 28;
    }
  }
  // 大月
  return 31;
};

/**
 * 获取一年多少天
 * @param {*} year  年份
 */
export const getDayCountOfYear = function(year) {
  // 闰年
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  return isLeapYear ? 366 : 365;
};

/**
 * 获取当前月的第一天
 * @param {*} date 日期对象
 */
export const getFirstDayOfMonth = function(date) {
  // 临时日期对象
  const temp = new Date(date.getTime());
  // 设置日为1，获取天数
  temp.setDate(1);
  // 获取这天的星期
  return temp.getDay();
};

// see: https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
// {prev, next} Date should work for Daylight Saving Time
// Adding 24 * 60 * 60 * 1000 does not work in the above scenario
// 前一个日期
export const prevDate = function(date, amount = 1) {
  // 日期相减
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - amount);
};

// 下一个日期
export const nextDate = function(date, amount = 1) {
  // 日期相加
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
};

/**
 * 获取这个月的开始第一天的星期
 * @param {*} year 
 * @param {*} month 
 */
export const getStartDateOfMonth = function(year, month) {
  // 月份的第一天
  const result = new Date(year, month, 1);
  // 获取日期的星期天
  const day = result.getDay();
  // 0，为星期天
  if (day === 0) {
    return prevDate(result, 7);
  } else {
    // 其他正常1，2，3，4，5，6
    return prevDate(result, day);
  }
};
/**
 * 获取星期数量
 * @param {*} src 
 */
export const getWeekNumber = function(src) {
  // 不为日期
  if (!isDate(src)) return null;
  // 创建零时日期变量
  const date = new Date(src.getTime());
  // 设置小时
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  // 
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week 1.
  // Rounding should be fine for Daylight Saving Time. Its shift should never be more than 12 hours.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

/**
 * 获取小时范围
 * @param {*} ranges 
 */
export const getRangeHours = function(ranges) {
  const hours = [];
  let disabledHours = [];
  // 遍历
  (ranges || []).forEach(range => {
    // 日期数组，获取每个日期的小时
    const value = range.map(date => date.getHours());
    // 不可用小时，
    disabledHours = disabledHours.concat(newArray(value[0], value[1]));
  });

  if (disabledHours.length) {
    for (let i = 0; i < 24; i++) {
      hours[i] = disabledHours.indexOf(i) === -1;
    }
  } else {
    for (let i = 0; i < 24; i++) {
      hours[i] = false;
    }
  }

  return hours;
};

/**
 * 获取上个月的最后一天
 * @param {*} date 日期对象
 * @param {*} amount 
 */
export const getPrevMonthLastDays = (date, amount) => {
  if (amount <= 0) return [];
  const temp = new Date(date.getTime());
  temp.setDate(0);
  const lastDay = temp.getDate();
  return range(amount).map((_, index) => lastDay - (amount - index - 1));
};

/**
 * 获取月份的天数
 * @param {*} date 
 */
export const getMonthDays = (date) => {
  // 下一个月的第0日，是上一个月的最后一日
  const temp = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  // 获取月份当前的日期
  const days = temp.getDate();
  // 获取
  return range(days).map((_, index) => index + 1);
};

/**
 * 设置范围数据
 * @param {*} arr 
 * @param {*} start 
 * @param {*} end 
 * @param {*} value 
 */
function setRangeData(arr, start, end, value) {
  // 开始结束，给数组赋值所有的value
  for (let i = start; i < end; i++) {
    arr[i] = value;
  }
}

/**
 * 获取分钟范围
 * @param {*} ranges 
 * @param {*} hour 
 */
export const getRangeMinutes = function(ranges, hour) {
  // 60个元素的数组
  const minutes = new Array(60);

  // 数组的长度
  if (ranges.length > 0) {
    // 遍历日期返回
    ranges.forEach(range => {
      const start = range[0];
      const end = range[1];
      // 获取开始日期的小时
      const startHour = start.getHours();
      // 开始日期的分钟
      const startMinute = start.getMinutes();
      // 结束日期的小时
      const endHour = end.getHours();
      // 结束日期的分钟
      const endMinute = end.getMinutes();
      // 开始的小时不是结束小时
      if (startHour === hour && endHour !== hour) {
        // 开始小时的分钟都为true
        setRangeData(minutes, startMinute, 60, true);

        // 开始小时也是结束小时
      } else if (startHour === hour && endHour === hour) {
        // 给开始，到结束都设置为true
        setRangeData(minutes, startMinute, endMinute + 1, true);

        // 不是开始小时，是结束小时
      } else if (startHour !== hour && endHour === hour) {
        // 
        setRangeData(minutes, 0, endMinute + 1, true);

        // 中间时间
      } else if (startHour < hour && endHour > hour) {
        setRangeData(minutes, 0, 60, true);
      }
    });
  } else {
    setRangeData(minutes, 0, 60, true);
  }
  return minutes;
};

/**
 * 返回一个，n数字组成的，从0到n-1的数值数组
 * @param {*} n 
 */
export const range = function(n) {
  // see https://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  return Array.apply(null, {length: n}).map((_, n) => n);
};

/**
 * 修改日期
 * @param {*} date 日期对象
 * @param {*} y 年
 * @param {*} m 月
 * @param {*} d 日
 */
export const modifyDate = function(date, y, m, d) {
  // 实例化日期对象，根据给定的日期信息
  return new Date(y, m, d, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
};

/**
 * 修改时间
 * @param {*} date 
 * @param {*} h 时
 * @param {*} m 分
 * @param {*} s 秒
 */
export const modifyTime = function(date, h, m, s) {
  // 修改日期的时间
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, s, date.getMilliseconds());
};

/**
 * 修改字符串时间
 * @param {*} date 
 * @param {*} time 
 */
export const modifyWithTimeString = (date, time) => {
  // 参数判断，为空，返回
  if (date == null || !time) {
    return date;
  }
  // 根据格式解析时间
  time = parseDate(time, 'HH:mm:ss');
  // 修改时间
  return modifyTime(date, time.getHours(), time.getMinutes(), time.getSeconds());
};

/**
 * 清理时间
 * @param {*} date 
 */
export const clearTime = function(date) {
  // 设置月份从0开始的，获取月份也是从0开始
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * 清理毫秒数
 * @param {*} date 
 */
export const clearMilliseconds = function(date) {
  // 清理为0
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);
};

/**
 * 限制时间范围
 * @param {*} date 
 * @param {*} ranges 
 * @param {*} format 
 */
export const limitTimeRange = function(date, ranges, format = 'HH:mm:ss') {
  // TODO: refactory a more elegant solution
  if (ranges.length === 0) return date;
  const normalizeDate = date => fecha.parse(fecha.format(date, format), format);
  const ndate = normalizeDate(date);
  const nranges = ranges.map(range => range.map(normalizeDate));
  if (nranges.some(nrange => ndate >= nrange[0] && ndate <= nrange[1])) return date;

  let minDate = nranges[0][0];
  let maxDate = nranges[0][0];

  nranges.forEach(nrange => {
    minDate = new Date(Math.min(nrange[0], minDate));
    maxDate = new Date(Math.max(nrange[1], minDate));
  });

  const ret = ndate < minDate ? minDate : maxDate;
  // preserve Year/Month/Date
  return modifyDate(
    ret,
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

export const timeWithinRange = function(date, selectableRange, format) {
  const limitedDate = limitTimeRange(date, selectableRange, format);
  return limitedDate.getTime() === date.getTime();
};

export const changeYearMonthAndClampDate = function(date, year, month) {
  // clamp date to the number of days in `year`, `month`
  // eg: (2010-1-31, 2010, 2) => 2010-2-28
  // 当前日期， 月份当前日期
  const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month));
  // 修改日期
  return modifyDate(date, year, month, monthDate);
};

/**
 * 上个月
 * @param {\} date 
 */
export const prevMonth = function(date) {
  // 日期年份
  const year = date.getFullYear();
  // 日期月份
  const month = date.getMonth();
  // 一月
  return month === 0
    // 设置为去年12月份
    ? changeYearMonthAndClampDate(date, year - 1, 11)
    // 这是为今年上月份
    : changeYearMonthAndClampDate(date, year, month - 1);
};

/**
 * 下一个月
 * @param {*} date 
 */
export const nextMonth = function(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  // 今年12月份
  return month === 11
  // 下个月就是明年一月份
    ? changeYearMonthAndClampDate(date, year + 1, 0)
    // 其他正常
    : changeYearMonthAndClampDate(date, year, month + 1);
};

/**
 * 上一年
 * @param {*} date 
 * @param {*} amount 
 */
export const prevYear = function(date, amount = 1) {
  const year = date.getFullYear();
  const month = date.getMonth();
  // 设置上一年
  return changeYearMonthAndClampDate(date, year - amount, month);
};

/**
 * 设置下一年
 * @param {*} date 
 * @param {*} amount 
 */
export const nextYear = function(date, amount = 1) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return changeYearMonthAndClampDate(date, year + amount, month);
};

export const extractDateFormat = function(format) {
  return format
  // *mm | *ZZ
    .replace(/\W?m{1,2}|\W?ZZ/g, '')
    // *hh | *sss
    .replace(/\W?h{1,2}|\W?s{1,3}|\W?a/gi, '')
    .trim();
};

export const extractTimeFormat = function(format) {
  return format
  // *DD | *Do | *dddd | *MMMM | *yy
    .replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?y{2,4}/g, '')
    .trim();
};

export const validateRangeInOneMonth = function(start, end) {
  return (start.getMonth() === end.getMonth()) && (start.getFullYear() === end.getFullYear());
};
