// pages/tabBar/home/home.js
import api from '../../../server/home'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    sportList: [
      {
        name: '跑步',
        index: 0,
      },
      {
        name: 'AI运动',
        index: 1,
      },
      {
        name: '更多运动',
        index: 2,
      },
    ],
  },
  onCheckActiveItem: function (e) {
    this.setData({
      activeIndex: e.detail,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.kindId == '0') {
      this.setData({
        activeIndex: 0,
      })
      let runPage = this.selectComponent('#run-homepage')
      runPage.startRun()
    }
  },

  //   gotoRun(){
  //     wx.navigateTo({
  //         url: '/run_packege/pages/index/index'
  //       })
  //   },
})
