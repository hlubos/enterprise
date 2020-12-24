import errStorage from './common/errStorage'
import tool from './common/tool'

const fetchWechat = require('fetch-wechat');
const tf = require('@tensorflow/tfjs-core');
const webgl = require('@tensorflow/tfjs-backend-webgl');
const plugin = requirePlugin('tfjsPlugin');

App({
  globalData: {
    userInfo: {
      user_id: 259179118,
      xyy: 'uvi4vgk10gt2ml5b6h',
    },
    wxScene: 0, 	 //扫码参数信息字符串
    shareFromId: 0,  //别人的分享id，从谁的分享链接进来
    shareFrom: '',   //用户来源,比如从app，从公众号，从分享
  },

  onLaunch: async function () {
    // await this.initUserInfo()
    this.reportErr()
    this.initPlugin()
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
      canvas: wx.createOffscreenCanvas()
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