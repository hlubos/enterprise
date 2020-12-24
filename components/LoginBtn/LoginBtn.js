// components/LoginBtn/LoginBtn.js
import tool from '../../common/tool'
import api from '../../server/login'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    loading: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 微信授权登录
    async getUserInfo (e) {
      if(this.loading) return
      this.loading = true
      let userInfo = e.detail.userInfo;
      if (!e.detail.iv) {
          wx.showModal({
              title: '提示',
              showCancel: false,
              content: '授权失败'
          });
          delete this.isExecuting;
          return
      } 
      if (userInfo) {
        app.globalData.userInfo = userInfo
      }
      let wxlogin = tool.promisify('login')
      try {
        let res = await wxlogin()
        if (!res.code) {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
          return
        }
        let params = {
          "code": res.code,
          "nickname": userInfo.nickName,
          "avatarurl": userInfo.avatarUrl,
        }
        this.goWxLogin(params)
      } catch (err) {
      } 
    },

    // 后台登录
    goWxLogin (params) {
      return api.wxLogin(params).then(res => {
        this.loading = false
        if (res.code !== 0) return
        if (res.user_id > 0) { // 老用户
          this.storageWXlogin(res)
        } else { // 新用户
          this.registerNew(res.openid, e.detail.encryptedData, e.detail.iv);
        }
      })
    },

    // 新用户注册
			registerNew (openid, encrypted, iv) {
				let globalData = getApp().globalData;
				let param = {
					"openid": openid,
					"encrypted": encrypted,
					"iv": iv,
					"sub_channel": globalData.shareFrom,
					"wx_scene": globalData.wxScene,
					"share_id": globalData.shareFromId
				}
				api.register(param).then(res=>{
          res.openid = res.open_id;//【特别注意】这里返回的是open_id不是openid
					this.storageWXlogin(res); 
				})
			},

    storageWXlogin(res){ 
      let loginObj = {
        session_key: res.session_key,
        user_id: res.user_id,
        xyy: res.xyy,
        openid: res.openid
      }
      wx.setStorageSync('user_id', loginObj.user_id)
      wx.setStorageSync('session_key', loginObj.session_key)
      wx.setStorageSync('openid', loginObj.openid)
      wx.setStorageSync('xyy', loginObj.xyy)
      this.triggerEvent('success', res)
    },
  }
})
