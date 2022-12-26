// pages/inviteQRcodePage/inviteQRcodePage.js
import i18nInstance from 'miniprogram-i18n-plus'
import api from '../../server/geely'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    both: false,
    // https://sport-album.51yund.com/1308787625.png
    joinBackgroundImg: 'https://sport-album.51yund.com/1308787626.png',
    qrImgUrl1: 'https://ydcommon.51yund.com/wxapp/upimg/geely-e-show.png',
    qrImgUrl2: 'https://ydcommon.51yund.com/wxapp/upimg/geely-i-show.png',
    downloadUrl1:
      'https://ydcommon.51yund.com/wxapp/upimg/geely-e-download.png',
    downloadUrl2:
      'https://ydcommon.51yund.com/wxapp/upimg/geely-i-download.png',
  },
  saveImg(e) {
    let imgSrc = e.currentTarget.dataset.qrurl
    let number = new Date().valueOf()
    wx.showLoading({
      title: '图片下载中',
      mask: true,
    })
    // 保存网络图片
    wx.downloadFile({
      filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
      url: imgSrc,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
            success: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: '保存成功',
              })
            },
            fail: function (err) {
              wx.hideLoading()
              wx.showToast({
                title: '保存失败',
                icon: 'error',
              })
            },
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'error',
        })
      },
    })
  },
  // 获取吉利项目图片
  getGeelyImg() {
    let that = this
    api
      .getShareInfos({
        group_run_id: 20221018001,
      })
      .then((res) => {
        if (res.code === 0) {
          let data = JSON.parse(res.infos.extra)
          let {
            qr_img_url_e,
            qr_img_url_in,
            download_url_e,
            download_url_e_en,
            download_url_in,
            download_url_in_en,
          } = data
          let lang = this.data.$language['lang']
          let qrImgUrl1 = qr_img_url_e
          let qrImgUrl2 = qr_img_url_in
          let downloadUrl1 = lang === 'zh' ? download_url_e : download_url_e_en
          let downloadUrl2 =
            lang === 'zh' ? download_url_in : download_url_in_en
          that.setData({
            qrImgUrl1,
            qrImgUrl2,
            downloadUrl1,
            downloadUrl2,
          })
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    this.getGeelyImg()
    // console.log('options', options)
    if (options.isBoth == 'true') {
      this.setData({
        both: true,
        joinBackgroundImg: 'https://sport-album.51yund.com/1308787625.png',
      })
    } else {
      this.setData({
        both: false,
        joinBackgroundImg: 'https://sport-album.51yund.com/1308787626.png',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
