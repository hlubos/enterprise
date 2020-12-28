// pages/tabBar/work/second/second.js
Page({

  data: {
    webUrl: '', // webview地址
  },

  onLoad: function (options) {
    this.initWebview(options)
  },

  initWebview (options) {
    let user_id = wx.getStorageSync('user_id')
    let xyy = wx.getStorageSync('xyy')
    let query = []
    for (let key in options) {
      if (key !== 'path') {
        let str = `${key}=${options[key]}`
        query.push(str)
      }
    }
    let url = `https://test-lip.51yund.com/vapps/new_work/${options.path}?user_id=${user_id}&xyy=${xyy}&is_login=true&${query.join('&')}`
    this.setData({
      webUrl: url
    })
  }

})