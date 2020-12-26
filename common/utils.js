const utils = {
  formatTime: date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(utils.formatNumber).join('/') + ' ' + [hour, minute, second].map(utils.formatNumber).join(':')
  },

  formatNumber: n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  // 去除首尾空格
  trimStr (str) {
    return str.replace(/^\s*|\s*$/g, '')
  },

  // 补零
  addZero (str) {
    return String(str).length === 1 ? '0' + str : str
  },
  //秒转时长   1314 => 00:21:54
  formatDuration: (value, fmt) => {
    value = + value;
    if (value <= 0) return 0;
    let o = {
      'd+': ~~(value / 86400),
      'h+': ~~((value % 86400) / 3600),
      'm+': ~~(((value % 86400) % 3600) / 60),
      's+': ((value % 86400) % 3600) % 60
    };
    for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        let str = o[k] + '';
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : utils.padLeftZero(str));
      }
    }
    return fmt
  },
  padLeftZero: str => {
    str = str + "";
    return ('00' + str).substr(str.length);
  }

}

export default utils