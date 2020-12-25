// pages/tabBar/work/work.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webUrl: '', // webview地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initWebview()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  initWebview () {
    let { user_id, xyy } = app.globalData.userInfo
    console.log(user_id, xyy)
    this.setData({
      webUrl: `https://work.51yund.com/vapps/new_work/appHome?user_id=${user_id}&xyy=${xyy}&is_login=true`
    })
  }
})