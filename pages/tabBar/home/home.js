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
  onLoad: function (options) {},

  //   gotoRun(){
  //     wx.navigateTo({
  //         url: '/run_packege/pages/index/index'
  //       })
  //   },
})
