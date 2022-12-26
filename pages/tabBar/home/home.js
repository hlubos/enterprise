// pages/tabBar/home/home.js
import api from '../../../server/home'
import i18nInstance from 'miniprogram-i18n-plus'
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
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    if (options.kindId) {
      let kindId = JSON.parse(options.kindId)
      switch (kindId) {
        case 0:
          this.gotoRun()
          break
        default:
          this.gotoAIsport(kindId)
          break
      }
    } else if (options.tabIndex) {
      // tabIndex  0 跑步  1 AI运动  2 更多运动
      let tabIndex = JSON.parse(options.tabIndex)
      this.onCheckActiveItem({
        detail: tabIndex,
      })
    }
  },

  gotoRun() {
    this.setData({
      activeIndex: 0,
    })
    let runPage = this.selectComponent('#run-homepage')
    runPage.startRun()
  },

  gotoAIsport(kindId) {
    this.setData({
      activeIndex: 1,
    })
    // console.log('#AI_page',this.selectComponent('#AI_page').data.kindList)
    let infoList = this.selectComponent('#AI_page').data.kindList
    let info = infoList.find((item) => {
      return item.kind_id === kindId
    })
    let user_id = wx.getStorageSync('user_id')
    if (info.video_id <= 0) {
      return wx.showToast({
        title: '敬请期待',
        icon: 'none',
      })
    }
    if (user_id) {
      wx.navigateTo({
        url: `${info.path}?video_id=${info.video_id}&video_name=${info.name}`,
        success: (res) => {},
        fail: (res) => {},
      })
    }
  },
})
