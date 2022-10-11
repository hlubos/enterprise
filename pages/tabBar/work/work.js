// pages/tabBar/work/work.js
import api from '../../../server/login'
import tool from '../../../common/tool'

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    webUrl: '', // webview地址
    isComplete: false, // 是否初始化结束
    encrypted: '', //注册新用户的两个参数
    iv: '',
    showAuthBtn: false,
    openid: '',
    enterprise_id: '',
    invitor_user_id: '',
    loginCount: 0, //请求登录次数
    noLogin: true,
  },
  onShow: function () {
    if (!this.data.noLogin && this.data.isComplete) {
      this.getSteps()
    }
  },
  // tab页没有option
  onLoad: function () {
    this.initUserInfo()
  },

  onShareAppMessage: function (options) {
    return {
      title: '关爱员工健康，提高团队活力，快来加入企业悦动！',
      path: '/pages/tabBar/work/work',
      imageUrl: 'https://ssl-pubpic.51yund.com/1042417257.png',
    }
  },

  //加载时如果已经登录，拿取本地user_id
  initUserInfo() {
    let loginInfo = {
      user_id: wx.getStorageSync('user_id'),
      xyy: wx.getStorageSync('xyy'),
    }
    app.globalData.userInfo.user_id = loginInfo.user_id
    app.globalData.userInfo.xyy = loginInfo.xyy
    if (loginInfo.user_id && loginInfo.xyy) {
      this.initWebview()
      this.login()
    }
    this.setData({
      isComplete: true,
    })
  },

  initWebview() {
    let { user_id, xyy } = app.globalData.userInfo
    // Todo
    this.setData({
      noLogin: false,
      // webUrl: `https://work.51yund.com/vapps/new_work/index?user_id=${user_id}&xyy=${xyy}&is_login=true&from_tab=true`,
      webUrl: `https://test-hd.51yund.com/vapps/new_work/index?user_id=${user_id}&xyy=${xyy}&is_login=true&from_tab=true`,
    })
  },

  async goInvite() {
    tool.getSessionKey(
      wx.getStorageSync('user_id'),
      wx.getStorageSync('xyy'),
      (userId, xyy) => {
        wx.switchTab({
          url:
            '/pages/index/index?to=invite&enterprise_id=' +
            this.data.enterprise_id +
            '&invitor_user_id=' +
            this.data.invitor_user_id +
            '&user_id=' +
            userId +
            '&xyy=' +
            xyy,
        })
      },
      () => {
        wx.showToast({
          title: '登录过期，请重新登录',
          icon: 'none',
        })
      },
    )
  },
  jumpTo() {
    this.initWebview()
  },
  login() {
    let _this = this
    wx.showLoading({
      title: '正在登录中',
    })
    wx.login({
      provider: 'weixin',
      success(res) {
        if (!res.code) {
          wx.showToast({
            title: '登录失败',
            icon: 'none',
          })
          wx.hideLoading()
        }
        _this.ydLogin(res)
      },
    })
  },
  //悦动登录接口
  async ydLogin(res) {
    let parms = {
      code: res.code,
      wxapp_source: 'wx_ydenterprise',
    }
    let userInfo = await api.wxLogin(parms)
    wx.hideLoading()
    if (userInfo.code != 0) return
    if (userInfo.user_id) {
      //老用户
      this.storageWXlogin(userInfo)
      this.getSteps()
    } else {
      //新用户,打开授权登录按钮，获取encrypted进行注册
      wx.showToast({
        title: '请授权登录',
        icon: 'none',
      })
      this.setData({
        showAuthBtn: true,
      })
      this.openid = userInfo.openid
    }
  },
  //wx授权用户信息
  getUserInfo(e) {
    let resgistInfo = e.detail
    this.ydRegister(resgistInfo)
  },
  //悦动账号注册
  async ydRegister(resgistInfo) {
    let parms = {
      openid: this.openid,
      wxapp_source: 'wx_ydenterprise',
      encrypted: resgistInfo.encryptedData,
      iv: resgistInfo.iv,
    }
    let newUserInfo = await api.register(parms)
    if (newUserInfo.code != 0) return
    this.setData({
      showAuthBtn: false,
    })
    newUserInfo.openid = newUserInfo.open_id //【特别注意】这里返回的是open_id不是openid
    this.storageWXlogin(newUserInfo)
    this.getSteps()
  },
  //保存登录信息
  storageWXlogin(userInfo) {
    let loginObj = {
      session_key: userInfo.session_key,
      user_id: userInfo.user_id,
      xyy: userInfo.xyy,
      openid: userInfo.openid,
    }
    wx.setStorageSync('user_id', loginObj.user_id)
    wx.setStorageSync('session_key', loginObj.session_key)
    wx.setStorageSync('openid', loginObj.openid)
    wx.setStorageSync('xyy', loginObj.xyy)
    app.globalData.userInfo = {
      user_id: loginObj.user_id,
      xyy: loginObj.xyy,
      openid: loginObj.openid,
    }
  },
  //登录成功后获取微信步数
  getSteps() {
    let _this = this
    wx.getWeRunData({
      success(res) {
        // 拿 encryptedData 到开发者后台解密开放数据
        _this.analyticalSteps(res)
      },
      fail() {
        wx.showToast({
          title: '获取步数失败',
          icon: 'none',
        })
        _this.jumpTo()
      },
    })
  },
  //后台解析步数，同步数据
  async analyticalSteps(res) {
    this.loginCount++
    let parms = {
      open_id: await tool.getYdStorage('openid'),
      wxapp_source: 'wx_ydenterprise',
      encryptedData: res.encryptedData,
      iv: res.iv,
    }
    let data = await api.getUserDayStep(parms)
    if (data.code == 0) {
      // wx.showToast({
      //   title: '数据同步成功',
      //   icon: 'none'
      // })
      this.jumpTo()
    } else if (data.code == 2 && this.loginCount < 3) {
      //openid过期，需要重新登录
      wx.showToast({
        title: '登录过期，请重新登录',
        icon: 'none',
      })
      wx.removeStorageSync('user_id')
      wx.removeStorageSync('xyy')
      wx.removeStorageSync('session_key')
      this.login()
    }
  },
})
