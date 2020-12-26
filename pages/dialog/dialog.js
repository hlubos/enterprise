// pages/dialog/dialog.js
import uploadFile from '../../common/uploadFile'
import api from '../../server/dialog'
import tool from '../../common/tool'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    level: 0, //员工权限等级，0 超级管理员 1 管路员 100 普通成员
    imgUrl: 'https://ssl-pubpic.51yund.com/993320426.jpg', //公众号二维码
    dialogType: 'isRemind', //弹窗类型
    uploadUrl: '', //上传的图片路径
    name: "", //分享人的名字、id、企业id
    invitor_user_id: "",
    enterprise_id: "",
    chal_type: '', //赛事类型
    activity_id: "", //赛事id
    remind_text: "关注公众号",
    officialAccountsFollows: 0, //关注公众号的人数
    miniAppId: '', //其他小程序的id
    miniPathUrl: '' //其他小程序的路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    //接收从webview跳转到小程序后传递过来的参数，
    switch (option.dialogType) {
      case 'isRemind':
        this.setData({
          level: option.level,
          dialogType: 'isRemind',
          enterprise_id: option.enterprise_id,
          officialAccountsFollows: option.officialAccountsFollows
        })
        let temp = wx.getStorageSync('isAlreadyRemind')
        if (!temp) return
        if (JSON.parse(temp).some(el => el.enterprise_id == this.data.enterprise_id)) {
          this.setData({
            remind_text: '今天通知已下发完毕'
          })
        }
        break;
      case 'isUpload':
        this.setData({
          dialogType: 'isUpload'
        })
        break;
      case 'isShare':
        this.setData({
          dialogType: 'isShare',
          name: option.name,
          invitor_user_id: option.invitor_user_id,
          enterprise_id: option.enterprise_id
        })
        break;
      case 'isStep':
        this.setData({
          dialogType: 'isStep',
          enterprise_id: option.enterprise_id,
          activity_id: option.activity_id
        })
        break
      case 'isDirectMini':
        this.setData({
          dialogType: 'isDirectMini',
          miniAppId: option.appid,
          miniPathUrl: decodeURIComponent(option.mini_url)
        })
        break
      default:
        this.setData({
          dialogType: option.dialogType
        })
        break;
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "关爱员工健康，提高团队活力，快来加入企业悦动！",
      imageUrl: 'https://ssl-pubpic.51yund.com/997613364.jpg',
      path: '/pages/login/login?to=invite&enterprise_id=' + this.data.enterprise_id + '&invitor_user_id=' + this.data.invitor_user_id
    }
  },
  //提醒员工
  async remindStaffSavePic() {
    //获取相册授权
    let _this = this
    let getSetting = tool.promisify('getSetting')
    let authorize = tool.promisify('authorize')
    let res = await getSetting()
    if (!res.authSetting['scope.writePhotosAlbum']) {
      try {
        await authorize({scope: 'scope.writePhotosAlbum'})
        _this.savePic()
      } catch (err) {
        wx.showToast({
          title: '相册授权失败',
          icon: 'none'
        })
      }
    } else { //用户已经授权过了
      _this.savePic()
    }
  },
  //提醒员工的接口
  async remindStaff() {
    if (this.data.level > 2) return;
    let parms = {
      user_id: wx.getStorageSync("user_id"),
      enterprise_id: this.data.enterprise_id
    }
    let res = await api.pushWxRemind(parms)
    if (res.code != 0) return;
    wx.showToast({
      title: '提醒成功',
      icon: 'none'
    })
    this.setData({
      remind_text: '今日通知已下发'
    })
    //已经提醒过的所有企业
    let remindedEnterprises = wx.getStorageSync('isAlreadyRemind')
    let data = {
      alreadyRemind: true,
      enterprise_id: this.data.enterprise_id
    }
    if (!remindedEnterprises) {
      remindedEnterprises = []
      remindedEnterprises.push(data)
      wx.setStorageSync('isAlreadyRemind', JSON.stringify(remindedEnterprises));
    } else {
      remindedEnterprises = JSON.parse(remindedEnterprises)
      remindedEnterprises = remindedEnterprises.filter(el => el.enterprise_id != data.enterprise_id)
      remindedEnterprises.push(data)
      wx.setStorageSync('isAlreadyRemind', JSON.stringify(remindedEnterprises));
    }
  },
  async savePic() {
    let _this = this
    let downloadFile = tool.promisify('downloadFile')
    let saveImageToPhotosAlbum = tool.promisify('saveImageToPhotosAlbum')
    try {
      let res = await downloadFile({url: _this.data.imgUrl})
      if (res.statusCode == 200) {
        try {
          await saveImageToPhotosAlbum({filePath: res.tempFilePath})
          wx.showToast({
            title: '二维码保存成功，快去关注吧！',
            icon: 'none'
          })
        } catch (err) {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      }
    } catch (err) {
      wx.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  },
  //点击弹窗取消的按钮，返回到小程序index页面
  cancel() {
    wx.navigateBack()
  },
  chooseImage() {
    let _this = this
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      success: function (res) {
        _this.setData({
          uploadUrl: res.tempFilePaths[0]
        })
      }
    });
  },
  //上传图片
  upload() {
    let _this = this
    uploadFile.upload({
      source: 'wx_ydenterprise',
      file: _this.data.uploadUrl,
      fail() {
        wx.showToast({
          title: '使用图片失败，请重试',
          icon: 'none'
        })
      },
      success(obj) {
        wx.showToast({
          title: '上传成功',
          icon: 'none'
        })
        wx.navigateTo({
          url: "/pages/index/index?to=createCompany" + '&imgUrl=' + obj.orig_url
        })
      },

    });
  },
  //同步步数
  unifyStep() {
    let _this = this
    wx.getWeRunData({
      success(res) {
        wx.showLoading({
          title: "同步数据中"
        })
        // 拿 encryptedData 到开发者后台解密开放数据
        _this.analyticalSteps(res)
      },
      fail() {}
    })
  },
  //后台解析步数
  async analyticalSteps(res) {
    let parms = {
      open_id: wx.getStorageSync('openid'),
      wxapp_source: "wx_ydenterprise",
      encryptedData: res.encryptedData,
      iv: res.iv
    }
    let data = await api.getUserDayStep(parms)
    if (data.code == 0) {
      wx.showToast({
        title: '同步步数成功',
        icon: 'none'
      })
      let timer = setTimeout(() => {
        wx.navigateBack()
        timer = null
      }, 1000)
    } else if (data.code == 2) { //openid过期，需要重新登录
      wx.showToast({
        title: '登录过期，请重新登录',
        icon: 'none'
      })
      wx.removeStorageSync('user_id')
      wx.removeStorageSync('xyy')
      wx.removeStorageSync('session_key')
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
    wx.hideLoading()
  },
  goOtherProgram() {

    wx.navigateToMiniProgram({
      appId: this.data.miniAppId,
      path: this.data.miniPathUrl,
      success(res) {}
    })
  }
})