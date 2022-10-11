// pages/inviteQRcodePage/inviteQRcodePage.js
import i18nInstance from 'miniprogram-i18n-plus'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    both: false,
    // https://sport-album.51yund.com/1308787625.png
    joinBackgroundImg: 'https://sport-album.51yund.com/1308787626.png',
    qrImgUrl1: 'https://sport-album.51yund.com/1309264111.png',
    qrImgUrl2: 'https://sport-album.51yund.com/1309264348.png',
    downloadUrl1: 'https://sport-album.51yund.com/1309264110.png',
    downloadUrl2: 'https://sport-album.51yund.com/1309264347.png',
  },
  saveImg(e) {
    let imgSrc = e.currentTarget.dataset.qrurl
    let number = new Date().valueOf()
    // 保存网络图片
    wx.downloadFile({
      filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
      url: imgSrc,
      success: (res) => {
        console.log(res)
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
            success: function (res) {
              wx.showToast({
                title: '保存成功',
              })
            },
            fail: function (err) {
              console.log(err)
            },
          })
        }
      },
      fail: (err) => {
        console.log(err)
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    i18nInstance.effect(this)
    console.log('options', options)
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
