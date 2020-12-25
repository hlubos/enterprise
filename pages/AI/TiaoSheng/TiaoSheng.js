// pages/AI/TiaoSheng/TiaoSheng.js
const app = getApp()
import { Classifier } from '../../../models/posenet/classifier.js'
const CANVAS_ID = 'canvas'
var o = 0, r = -1, s = 0, c = 0, d = 0, l = 0, h = 0, u = 0, n = 0;
Page({

  /**
   * 页面的初始数据
   */
  classifier: null,
  keypointStack: [],
  ctx: null,
  data: {
    cameraBlockHeight: app.globalData.systemInfo.screenHeight - app.globalData.CustomBar,
    predicting: false,
    videoWidth: null,
    videoHeight: null,
    num: 0,
    left_point_pos: 0,
    right_point_pos: 0,
    pixelRatio: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(() => {
      this.ctx = wx.createCanvasContext(CANVAS_ID)
      this.initClassifier()

      const context = wx.createCameraContext(this)
      const listener = context.onCameraFrame((frame) => {
        this.executeClassify(frame)
      })
      listener.start()
    }, 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.classifier && this.classifier.isReady()) {
      this.classifier.dispose()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  showLoadingToast () {
    wx.showLoading({
      title: '拼命加载模型',
    })
  },

  hideLoadingToast () {
    wx.hideLoading()
  },

  initClassifier () {
    this.showLoadingToast()
    var i = app.globalData.systemInfo
    this.classifier = new Classifier('back', {
      width: app.globalData.systemInfo.screenWidth,
      height: this.data.cameraBlockHeight
    })

    var a = i.windowWidth / 2 - .2 * i.windowHeight, n = i.windowWidth - a;
    this.setData({
      videoHeight: i.windowHeight,
      videoWidth: i.windowWidth,
      left_point_pos: a,
      right_point_pos: n,
      pixelRatio: i.pixelRatio / 2,
      widthMulti: i.windowWidth >= 768 ? i.windowWidth / 375 : 1
    })

    this.classifier.load().then(() => {
      this.hideLoadingToast()
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '网络连接异常',
        icon: 'none'
      })
    })

  },

  executeClassify (frame) {
    if (this.classifier && this.classifier.isReady() && !this.data.predicting) {
      this.setData({
        predicting: true
      }, () => {
        this.classifier.detectSinglePose(frame)
          .then((pose) => {
            this.setData({
              predicting: false,
              // nosePosition: Math.round(nosePosition.x) + ', ' + Math.round(nosePosition.y)
            })
            console.log(pose)
            if (!pose || (Array.isArray(pose) && pose.length == 0)) return

            // const nosePosition = pose.keypoints[0].position

            // this.classifier.drawSinglePose(this.ctx, pose[0])
            this.classifier.drawSinglePose(this.ctx, pose)
            this.calculateScore(pose)

          })
          .catch((err) => {
            console.log(err, err.stack);
          });
      })
    }
  },

  // 计算分数
  calculateScore: function (pose) {
    var a = this, item = pose
    if (Array.isArray(pose)) {
      item = pose[0]
    }
    var m = item.keypoints
    this.saveFrameToArray(m);
    var g = [5, 11, 15, 6, 12, 16];
    if (!a.satisfyConf(m, .2, g)) {
      return
    }
    var p = m[11].position.y, f = m[12].position.y, v = m[5].position.y, w = m[6].position.y, D = m[15].position.y, S = m[16].position.y, y = (p + f) / 2, T = (v + w) / 2, M = (D + S) / 2, x = (p + f) / 2, k = T - n;
    0 == n && (s = T);
    var I = M - o, C = -1, _ = Math.abs(I) / Math.abs(k);
    k < 0 ? (c += -1 * k, I < 0 && _ > .1 && (d += -1 * I), l = 0, h = 0) : k > 0 && k < s ? (l += k,
      I > 0 && _ > .1 && (h += I), c = 0, d = 0) : (c = 0, d = 0, l = 0, h = 0);
    var A = Math.abs(x - T) / 10;
    c > A && d > 0 ? (C = 0, u = 0) : l > A && h > 0 && u < 3 ? C = 1 : (C = -1, u++),
      0 == r && 1 == C && (a.setData({
        num: a.data.num + 1
      }), console.error(`a.data.num===`, a.data.num)), C > -1 && (r = C), y, n = T, o = M;
  },
  satisfyFrame: function (t, e) {
    var i = this, a = !0, n = 20 * this.pixelRatio;
    return Array.isArray(e) && Array.isArray(t) && e.forEach(function (e) {
      (!t[e] || t[e].position.x < i.left_point_pos - n || t[e].position.x > i.right_point_pos + n || t[e].position.y > .9 * i.videoHeight + n || t[e].position.y < .15 * i.videoHeight - n) && (a = !1);
    }), a;
  },
  saveFrameToArray: function (t) {
    this.keypointStack.length > 400 ? this.keypointStack.splice(0, Math.floor(this.keypointStack.length / 2)) : this.keypointStack.push(t);
  },
  satisfyConf: function (t, e, i) {
    if (Array.isArray(t) && e && Array.isArray(i)) {
      var a = !0;
      return i.forEach(function (i, n) {
        (!t[i] || t[i].score < e) && (a = !1);
      }), a;
    }
    return !1;
  },
})