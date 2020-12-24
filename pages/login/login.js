// pages/login/login.js
import api from '../../server/login'
import utils from '../../common/utils'
import tool from '../../common/tool'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', // 电话号码
    isCountDown: false, // 是否在倒计时
    downText: 60, // 倒计时
    tipContent: '', // toast内容
    isShowTip: false, // 是否显示toast
    code: '', // 验证码
  },

  onLoad: function (options) {

  },

  // 修改电话号码
  toPhoneBlur (e) {
    let value = e.detail.value
    if (value) {
      value = utils.trimStr(value)
      this.setData({
          phone: value || ''
      })
    }
  },

  // 修改验证码
  toCodeBlur (e) {
    let value = e.detail.value
    if (value) {
      value = utils.trimStr(value)
      this.setData({
          code: value || ''
      })
    }
  },

  // 开始倒计时
  startTimer () {
    this.timer = setInterval(() => {
      if (this.data.downText) {
        this.setData({
          downText: this.data.downText - 1
        })
      } else {
        this.setData({
          isCountDown: false
        })
        clearInterval(this.timer)
      }
    }, 1000)
  },

  // 获取验证码
  getCode () {
    if (this.data.isCountDown) return
    if (!/1\d{10}/.test(this.data.phone)) {
      this.setData({
        tipContent: '请输入正确的手机号码',
        isShowTip: true
      })
      return
    }
    this.setData({
      isCountDown: true
    })
    api.getPhoneCode({
      phone: this.data.phone
    }).then((res) => {
      if (res.code === 0) {
        this.startTimer()
      }
    })
  },

  checkPhoneCode () {
    return new Promise((resolve, reject) => {
      api.checkPhoneCode({
        phone: this.data.phone,
        verify_code: this.data.code
      }).then((res) => {
        if (res.code === 0) {
          resolve()
        } else {
          reject()
        }
      })
    })
  },

  wxloginCabk (e) {
    let data = e.detail
    loginSucCabk(data)
  },

  // 登录成功
  async loginSucCabk (res) {
    let { user_id, xyy } = res
    await tool.setYdStorage('user_id', user_id)
    await tool.setYdStorage('xyy', xyy)
    await tool.getSessionKey(user_id, xyy)
    this.setData({
      tipContent: '登录成功',
      isShowTip: true
    })
  },

  // 通过电话号码登录
  async goPhoneLogin () {
    await this.checkPhoneCode()
    api.authLogin({
      login_source: 1,
      phone: this.data.phone
    }).then(async (res) => {
      let {user_id} = res
      if (res.code === 0) {
        if (user_id !== 0) {
          this.loginSucCabk(res)
        }
      }
    })
  }
})