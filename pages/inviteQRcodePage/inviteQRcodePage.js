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
    qrImgUrl1: 'https://ssl-pubpic.51yund.com/1306533712.png',
    qrImgUrl2: 'https://ssl-pubpic.51yund.com/1306533712.png',
  },
  saveImg() {
    let imgSrc =
      'data:image/png;base64,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'
    let save = wx.getFileSystemManager()
    let number = Math.random()
    // 保存base64格式的图片
    save.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
      data: imgSrc.slice(22),
      encoding: 'base64',
      success: (res) => {
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
        console.log(res)
      },
      fail: (err) => {
        console.log(err)
      },
    })
  },
  saveImg1() {
    let imgSrc = 'https://sport-album.51yund.com/1309199666.png'
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
