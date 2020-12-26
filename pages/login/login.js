// pages/tabBar/work/work.js
import api from '../../server/login'
import tool from '../../common/tool'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    webUrl: '', // webview地址
    encrypted: "", //注册新用户的两个参数
    iv: "",
    showAuthBtn: false,
    openid: '',
    enterprise_id: '',
    invitor_user_id: "",
    loginCount: 0, //请求登录次数
    user_id: 0,
    xyy: 'zachhe',
    noLogin: true
  },

  onLoad: function (option) {
    this.initUserInfo()

    //webview页面合并完账号后跳转回小程序
    if ('loginAagin' in option) {
      let {
        enterprise_id,
        invitor_user_id
      } = option
      if (enterprise_id && invitor_user_id) {
        this.enterprise_id = enterprise_id
        this.invitor_user_id = invitor_user_id
      }
      wx.showToast({
        title: '账号合并成功，请重新登录~',
        icon: 'none'
      })
      return;
    }
    //从邀请页面过来
    if (option.to == 'invite') {
      let {
        enterprise_id,
        invitor_user_id
      } = option;
      this.enterprise_id = enterprise_id
      this.invitor_user_id = invitor_user_id
      if (this.data.noLogin) {
        wx.showToast({
          title: '还未登录，请登录~',
          icon: 'none'
        })
        return
      }
      this.goInvite();
      return;
    }
    if(this.data.noLogin) return
    this.getSteps()
  },

  //加载时如果已经登录，拿取本地user_id
  initUserInfo () {
    let loginInfo = {
      user_id: wx.getStorageSync('user_id'),
      xyy: wx.getStorageSync('xyy'),
    }
    app.globalData.userInfo.user_id = loginInfo.user_id
    app.globalData.userInfo.xyy = loginInfo.xyy
    if (loginInfo.user_id && loginInfo.xyy) {
      this.setData({
        user_id: loginInfo.user_id,
        xyy: loginInfo.xyy,
        noLogin: false
      })
    }
  },

  async goInvite() {
    let user_id = await tool.getYdStorage('user_id') || 0
    let xyy = await tool.getYdStorage('xyy') || 'zache'
    tool.getSessionKey(user_id, xyy, (userId, xyy) => {
      wx.navigateTo({
        url: "/pages/index/index?to=invite&enterprise_id=" + this.enterprise_id + '&invitor_user_id=' + this.invitor_user_id + "&user_id=" + userId + "&xyy=" + xyy
      })
    }, () => {
      wx.showToast({
        title: '登录过期，请重新登录',
        icon: 'none'
      })
    });
  },
  async jumpTo() {
    let user_id = await tool.getYdStorage('user_id') || 0
    let xyy = await tool.getYdStorage('xyy') || 'zache'
    if (this.enterprise_id && this.invitor_user_id) { //要跳回邀请加入页的情况
      wx.navigateTo({
        url: "/pages/index/index?to=login&enterprise_id=" + this.enterprise_id + '&invitor_user_id=' + this.invitor_user_id + '&user_id=' + user_id + '&xyy=' + xyy
      })
    } else {
      wx.navigateTo({
        url: "/pages/index/index?user_id=" + user_id + '&xyy=' + xyy + '&to=login'
      })
    }
  },
  login() {
    let _this = this
    wx.showLoading({
      title: "正在登录中"
    })
    wx.login({
      provider: "weixin",
      success(res) {
        if (!res.code) {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
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
      wxapp_source: "wx_ydenterprise",
    }
    let userInfo = await api.wxLogin(parms)
    wx.hideLoading()
    if (userInfo.code != 0) return;
    if (userInfo.user_id) { //老用户
      this.storageWXlogin(userInfo)
      this.getSteps()
    } else { //新用户,打开授权登录按钮，获取encrypted进行注册
      wx.showToast({
        title: '请授权登录',
        icon: 'none'
      })
      this.setData({
        showAuthBtn: true
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
      wxapp_source: "wx_ydenterprise",
      encrypted: resgistInfo.encryptedData,
      iv: resgistInfo.iv
    }
    let newUserInfo = await api.register(parms)
    if (newUserInfo.code != 0) return;
    this.showAuthBtn = false
    newUserInfo.openid = newUserInfo.open_id; //【特别注意】这里返回的是open_id不是openid
    this.storageWXlogin(newUserInfo);
    this.getSteps()
  },
  //保存登录信息
  storageWXlogin(userInfo) {
    let loginObj = {
      session_key: userInfo.session_key,
      user_id: userInfo.user_id,
      xyy: userInfo.xyy,
      openid: userInfo.openid
    }
    wx.setStorageSync('user_id', loginObj.user_id)
    wx.setStorageSync('session_key', loginObj.session_key)
    wx.setStorageSync('openid', loginObj.openid)
    wx.setStorageSync('xyy', loginObj.xyy)
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
          icon: 'none'
        })
        _this.jumpTo()
      }
    })
  },
  //后台解析步数，同步数据
  async analyticalSteps(res) {
    this.loginCount++;
    let parms = {
      open_id: await tool.getYdStorage('openid'),
      wxapp_source: "wx_ydenterprise",
      encryptedData: res.encryptedData,
      iv: res.iv
    }
    let data = await api.getUserDayStep(parms)
    if (data.code == 0) {
      wx.showToast({
        title: '数据同步成功',
        icon: 'none'
      })
      this.jumpTo();
    } else if (data.code == 2 && this.loginCount < 3) {
      //openid过期，需要重新登录
      wx.showToast({
        title: '登录过期，请重新登录',
        icon: 'none'
      })
      wx.removeStorageSync('user_id')
      wx.removeStorageSync('xyy')
      wx.removeStorageSync('session_key')
      this.login()
    }
  }
})