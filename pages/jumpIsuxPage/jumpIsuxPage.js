// pages/jumpIsuxPage/jumpIsuxPage.js
Page({
  // 跳转公众号的中转页面
  /**
   * 页面的初始数据
   */
  data: {
    // 跳转的文章的url
    textUrl: '',
  },
  scc(e) {
    console.log('跳转成功', e)
  },
  err(e) {
    console.log('跳转失败', e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      textUrl: decodeURIComponent(options.textUrl),
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
