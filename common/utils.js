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
  } 
}

export default utils