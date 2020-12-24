const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    webUrl: '', // webview地址
  },

  onLoad: function (options) {
    console.log(app.globalData)
  },

  onReady: function () {
    this.initWebview()
  },

  initWebview () {
    let { user_id, xyy } = app.globalData.userInfo
    console.log(user_id, xyy)
    this.setData({
      webUrl: `https://work.51yund.com/vapps/new_work/dynamic?user_id=${user_id}&xyy=${xyy}&is_login=true`
    })
  }
  
})