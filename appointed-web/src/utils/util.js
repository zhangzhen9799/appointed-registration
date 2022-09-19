export const timeFormat = function (fmt) {
  let o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };

  //  获取年份
  // ①
  if (/(y+)/i.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    // ②
    if (new RegExp('(' + k + ')', 'i').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  return fmt;
};

// 校验身份证号
export const sfzValidator = (val) => {
  if (!val) {
    return true;
  }
  const reg = /\d{17}[0-9Xx]{1}$/;
  return reg.test(val) && (val + '').length === 18;
};

// 校验登录状态
export const getLoginStatus = () => {
  const token = localStorage.getItem('token');
  const xAppId = localStorage.getItem('appId');
  const xClientId = localStorage.getItem('clientId');
  const xReqSerialNo = localStorage.getItem('reqSerialNo');
  return token && xAppId && xClientId && xReqSerialNo;
};

export const formatNum = (num) => {
  const nm = num || 0;
  if (nm >= 0 && nm <= 10000) {
    return nm + '';
  } else if (nm > 10000) {
    return (nm / 10000).toFixed(2) + 'w+';
  }
};
