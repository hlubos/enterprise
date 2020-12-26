import errStorage from './common/errStorage'
import tool from './common/tool'

import * as fetchWechat from 'fetch-wechat'
import * as tf from '@tensorflow/tfjs-core'
import * as webgl from '@tensorflow/tfjs-backend-webgl'
const plugin = requirePlugin('tfjsPlugin')

App({
  globalData: {
    userInfo: {
      user_id: 259179118,
      xyy: 'uvi4vgk10gt2ml5b6h',
    },
    wxScene: 0, 	 //扫码参数信息字符串
    shareFromId: 0,  //别人的分享id，从谁的分享链接进来
    shareFrom: '',   //用户来源,比如从app，从公众号，从分享
    localStorageIO: plugin.localStorageIO,
    fileStorageIO: plugin.fileStorageIO,
    angleSuccess: !1,
    bgMusic: !0,
    timeGap: 0
  },

  onLaunch: function () {
    // await this.initUserInfo()
    this.reportErr()
    this.initPlugin()

    // 记录状态栏高度
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight
        let custom = wx.getMenuButtonBoundingClientRect()
        let systemInfo = wx.getSystemInfoSync()
        this.globalData.Custom = custom
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight
        this.globalData.systemInfo = systemInfo
      }
    })

    this.globalData.bgMusic = !1 !== wx.getStorageSync("bgMusic");
  },

  // 初始化插件
  initPlugin () {
    plugin.configPlugin({
      // polyfill fetch function
      fetchFunc: fetchWechat.fetchFunc(),
      // inject tfjs runtime
      tf,
      // inject webgl backend
      webgl,
      // provide webgl canvas
      canvas: wx.createOffscreenCanvas(),
      backendName: 'wechat-webgl-' + Math.random()
    });
  },

  async initUserInfo () {
    let user_id = await tool.getYdStorage('user_id') || 0
    let xyy = await tool.getYdStorage('xyy') || 0
    this.globalData.userInfo = {
      user_id,
      xyy
    }
  },

  // 上报已缓存的错误
  reportErr () {
    errStorage.postItem()
  }
})