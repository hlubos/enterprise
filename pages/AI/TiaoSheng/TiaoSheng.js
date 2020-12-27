// pages/AI/TiaoSheng/TiaoSheng.js
const app = getApp()
import { Classifier } from '../../../models/posenet/classifier.js'
import utils from '../../../common/utils'
import api from '../../../server/home'
const CANVAS_ID = 'canvas'
var o = 0, r = -1, s = 0, c = 0, d = 0, l = 0, h = 0, u = 0, n = 0;
const i = require("../utils")

Page({
  /**
   * 页面的初始数据
   */
  classifier: null,
  keypointStack: [],
  audios: ["appear", "tooClose", "start", "timeOut", "comeOn", "5", "4", "3", "2", "1", "keepMoving", "endsoon", "adjustAngle"],
  audioSrcs: {},
  ctx: null,
  data: {
    cameraBlockHeight: app.globalData.systemInfo.screenHeight - app.globalData.CustomBar,
    tipsText: '请站在识别框内',
    predicting: false,
    videoWidth: null,
    videoHeight: null,
    num: 0,
    left_point_pos: 0,
    right_point_pos: 0,
    pixelRatio: 1,
    countDown: "", // 开始前倒数3s
    countDownSrc: "", //  倒数文案
    countDownSrcAry: ["1", "2", "3"], // 倒数文案数组
    show_tip: false, // 身体引导
    limitTime: 60, // 限制时长
    timeProgress: 0, // 进度条
    costTimer: null,  // 耗时计时器
    costTime: 0, // 耗时
    costTimeStr: '00:00',
    recordTime: 0, // 记录时长
    lastTime: 60, // 剩余时长
    reStartCountDown: 10, // 结束后倒计时重新开始
    sportStart: false,  // 开始运动
    sportEnd: false, // 运动完成
    angleSuc: false, // 角度判断是否成功
    showScoreView: false, // 顶部成绩黑条
    startTs: 0, // 开始运动的时间戳
    showDevicePage: false,  // 展示角度判断
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(`options==`, options)
    if (options.limit_time > 0) {
      let limitTime = parseInt(options.limit_time)
      this.setData({
        lastTime: limitTime,
        limitTime: limitTime
      })
    }

    let videoId = options.video_id || 45
    let videoName = options.video_name || "跳绳"
    var windowWidth = wx.getSystemInfoSync().windowWidth >= 768
    this.setData({
      videoId: videoId,
      videoName: videoName,
      angleRange: windowWidth ? "70-80" : "65-75",
      showDevicePage: false
    })
    this.clearTimerAll()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    setTimeout(() => {
      this.ctx = wx.createCanvasContext(CANVAS_ID)
      this.initClassifier()

      const context = wx.createCameraContext(this)

      this.audioCtx = wx.createInnerAudioContext()
      this.appearCtx = wx.createInnerAudioContext()
      this.downloadAudios()
      this.backgroundVideo = this.selectComponent("#backgroundVideo")

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
    // this.angleSuccess()
    this.setData({
      showDevicePage: !0
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
    if (this.classifier && this.classifier.isReady()) {
      this.classifier.dispose()
    }
    this.clearTimerAll()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  showLoadingToast () {
    wx.showLoading({
      title: '拼命加载中...',
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
      this.setData({
        showScoreView: true,
        show_tip: true,
        tipsText: this.data.tipsText
      })
      this.hideLoadingToast()
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '网络连接异常，请返回重试',
        icon: 'none'
      })
    })

  },

  executeClassify (frame) {
    const that = this
    if (this.classifier && this.classifier.isReady() && !this.data.predicting) {
      this.setData({
        predicting: true
      }, () => {
        this.classifier.detectSinglePose(frame)
          .then((pose) => {
            this.setData({
              predicting: false,
            })
            // console.log(pose)
            if (!pose || (Array.isArray(pose) && pose.length == 0)) return

            if (that.data.limitTime > 0 && that.data.lastTime <= 0 && !that.data.sportEnd) {
              that.uploadScore("倒计时结束")
              that.setData({
                sportEnd: true
              })
              if (!that.reStartTimer) {
                that.reStartTimer = setInterval(function () {
                  console.log(`a.data.reStartCountDown===`, that.data.reStartCountDown);
                  if (that.data.reStartCountDown > 1) {
                    that.setData({
                      reStartCountDown: that.data.reStartCountDown - 1
                    })
                  } else {
                    // clearInterval(that.reStartTimer)
                    that.clearIntervalItem('reStartTimer')
                    // that.reStart()
                  }
                }, 1000);
              }
              return
            }

            if (!this.data.sportEnd) {
              this.calculateScore(pose)
            }
          })
          .catch((err) => {
            console.log(err, err.stack);
          });
      })
    }
  },

  // 计算分数
  calculateScore: function (pose) {
    // this.classifier.drawSinglePose(this.ctx, pose)
    var a = this, item = pose
    if (Array.isArray(pose)) {
      item = pose[0]
    }
    // a.setData({
    //   num: a.data.num + 1
    // })
    var m = item.keypoints
    this.saveFrameToArray(m);
    var g = [5, 11, 15, 6, 12, 16];
    if (a.satisfyConf(m, .2, g) && a.isInBox(g)) {
      if (a.data.sportStart || a.countDownTimer) {
        if (!a.data.countDown) {
          a.isOutScreen();
          var p = m[11].position.y, f = m[12].position.y, v = m[5].position.y, w = m[6].position.y, D = m[15].position.y, S = m[16].position.y, y = (p + f) / 2, T = (v + w) / 2, M = (D + S) / 2, x = (p + f) / 2, k = T - n;
          0 == n && (s = T);
          var I = M - o, C = -1, _ = Math.abs(I) / Math.abs(k);
          k < 0 ? (c += -1 * k, I < 0 && _ > .1 && (d += -1 * I), l = 0, h = 0) : k > 0 && k < s ? (l += k,
            I > 0 && _ > .1 && (h += I), c = 0, d = 0) : (c = 0, d = 0, l = 0, h = 0);
          var A = Math.abs(x - T) / 10;
          c > A && d > 0 ? (C = 0, u = 0) : l > A && h > 0 && u < 3 ? C = 1 : (C = -1, u++),
            0 == r && 1 == C && (a.setData({
              num: a.data.num + 1
            }), console.error(`a.data.num===`, a.data.num, a.data.costTime), a.data.num && a.playMusic("appear")), C > -1 && (r = C), y, n = T, o = M;
        }
      } else {
        if (i.judgeIsStand(m)) {
          a.setData({
            countDown: 3,
            countDownSrc: a.data.countDownSrcAry[2]
          })
          a.triggerGameStart();
        }

      }
    } else {
      if (a.data.sportStart && !a.isInBox(g)) {
        a.setData({
          show_tip: true
        })
      }
      if (a.data.sportStart && !a.data.sportEnd) {
        a.isOutScreen(true)
      }
    }

    a.setData({
      predicting: !1
    });
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
  startSport: function () {
    const that = this;
    if (that.costTimer) return
    that.setData({
      startTs: parseInt(Date.parse(new Date()) / 1000)
    })
    that.costTimer = setInterval(function () {
      let timeProgress = that.data.limitTime ? that.data.costTime * (100 / that.data.limitTime) : 0
      that.setData({
        costTime: that.data.costTime + 1,
        costTimeStr: utils.formatDuration(that.data.costTime + 1, 'mm:ss'),
        timeProgress: timeProgress
      })
    }, 1000);
  },
  clearIntervalItem: function (timer) {
    if (!this[timer]) return
    clearInterval(this[timer])
    this[timer] = null
  },
  clearTimerAll: function () {
    let timers = ['costTimer', 'timerDown', 'reStartTimer',
      'startTimer', 'endTimer', 'notMovingTimer', 'countDownTimer']
    for (const item of timers) {
      this.clearIntervalItem(item)
    }
    // this.countDownTimer && clearInterval(this.countDownTimer) // 开始前的倒计时3秒
    // this.costTimer && clearInterval(this.costTimer) // 运动计时
    // this.timerDown && clearInterval(this.timerDown) // 运动过程中的倒计时
    // this.reStartTimer && clearInterval(this.reStartTimer) // 重新开始倒计时
    // this.startTimer && clearInterval(this.startTimer) // 开始前的倒计时 3s
    // this.endTimer && clearInterval(this.endTimer) // 结束倒计时
    // this.notMovingTimer && clearInterval(this.notMovingTimer) // 未运动倒计时
    console.log(`cleartTimer countDownTimer == `, this.countDownTimer)
    this.setData({
      showDevicePage: false
    });
  },
  isInBox: function (t) {
    const that = this
    const potions = this.keypointStack.slice(-5);
    if (5 === potions.length) {
      var a = 0;
      return potions.forEach(function (i) {
        that.satisfyFrame(i, t) && a++;
      }), a >= 3;
    }
    return false;
  },
  isMoving: function (t) {
    var e = this;
    if (0 === this.data.num) return !0;
    var i = 0, a = this.keypointStack.slice(-5);
    return 5 === a.length && (a.forEach(function (n, o) {
      if (0 !== o) {
        var r = !1;
        t.forEach(function (t) {
          var i = Math.abs(n[t].position.x - a[o - 1][t].position.x), s = Math.abs(n[t].position.y - a[o - 1][t].position.y);
          (i > s ? i : s) > 7 * e.data.widthMulti && (r = !0);
        }), r && i++;
      }
    }), i >= 3);
  },
  isOutScreen: function () {
    var t = this, i = this
    var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0]
    if (this.data.sportEnd) {
      this.clearTimerAll();
    } else {
      var a = [5, 6], n = i.isMoving(a);
      console.log(`isMoving==`, n)
      if (i.data.costTime != i.data.recordTime) {
        i.setData({
          recordTime: i.data.costTime
        })
      }
      if (!n || e) {
        i.notMovingTimer || (i.notMovingTimer = setInterval(function () {
          i.setData({
            notMovingTime: i.data.notMovingTime ? i.data.notMovingTime + 1 : 1
          }, function () {
            if (3 === i.data.notMovingTime) {
              t.playMusic("keepMoving")
            } else if (6 === i.data.notMovingTime) {
              t.playMusic("keepMoving");
            } else if (9 === i.data.notMovingTime && i.data.lastTime > 10) {
              // 倒计时5s
              var e = 5
              var a = function () {
                if (e > 0) {
                  if (e <= 3) {
                    t.playMusic(e)
                  } else {
                    5 === e && t.playMusic("endsoon")
                  }
                  e--
                } else {
                  t.playMusic("timeOut")
                  // clearInterval(i.endTimer)
                  i.clearIntervalItem('endTimer')
                  i.setData({
                    sportEnd: true
                  })
                  i.uploadScore("未运动结束")
                  i.triggerGameReStart()
                }
              };
              a()
              i.clearIntervalItem('endTimer')
              i.endTimer = setInterval(a, 1e3);
            }
          });
        }, 1e3))
      } else {
        i.clearIntervalItem('notMovingTimer')
        i.clearIntervalItem('endTimer')
        i.setData({
          notMovingTime: 0
        })
      }
    }

  },
  setTimeDown: function () {
    var t = this;
    console.log(`====setTimeDown====`)
    t.timerDown = setInterval(function () {
      if (t.data.lastTime > 0) {
        if (21 === t.data.lastTime) {
          t.playMusic("comeOn")
        }
        t.setData({
          lastTime: t.data.lastTime - 1
        })
        if (0 == t.data.lastTime) {
          t.playMusic("timeOut", !0)
        } else {
          if (t.data.lastTime <= 5) {
            t.playMusic(t.data.lastTime, !0)
          }
        }
      } else {
        t.clearIntervalItem('timerDown')
      }
    }, 1000);
  },
  playMusic: function (t) {
    if ("appear" === t) {
      this.appearCtx.src = this.audioSrcs[t + ""]
      this.appearCtx.play();
      return
    }
    this.audioCtx.src = this.audioSrcs[t + ""]
    this.audioCtx.play();
  },
  downloadAudios: function () {
    var t = this;
    t.audios.forEach(function (e) {
      var i = "appear" === e ? "Sport_Ball_appear" : e;
      let url = "https://go-ran-pic.lovedabai.com/sound/" + i + ".mp3"
      url = "appear" != e ? url : 'https://ydcommon.51yund.com/AI/audio/appear.mp3'
      wx.downloadFile({
        url: url,
        success: function (i) {
          200 === i.statusCode && (t.audioSrcs[e] = i.tempFilePath);
        }
      });
    });
  },
  uploadScore: function (t) {
    console.error(`====uploadScore====`, t)
    if (this.doUpload || this.data.num <= 0) {
      return
    }
    this.doUpload = true;
    var e = this;
    this.backgroundVideo && this.backgroundVideo.stop()
    e.clearIntervalItem('timerDown')
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight)
    this.ctx.draw()
    e.timerDown = null
    e.clearTimerAll()

    if (e.data.num > 1) {
      this.setData({
        showDevicePage: !1
      })
    }
    let param = {
      video_id: this.data.videoId,
      video_name: this.data.videoName,
      start_ts: this.data.startTs,
      cost_time: this.data.costTime,
      action_times: this.data.num,
    }
    api.reportUserAISportData(param).then(res => {
      e.doUpload = false
    })
  },
  triggerGameReStart: function () {
    console.error(`====triggerGameReStart====`)
  },
  // 触发开始运动
  triggerGameStart: function () {
    console.error(`=====triggerGameStart====`)
    var t = this, e = this;
    this.setData({
      show_tip: false,
      tipsText: '识别成功，开始！'
    });
    var i = 3
    var a = function () {
      i > 0 ? (t.playMusic(i), i--) : (t.playMusic("start"), e.clearIntervalItem('prepareTimer'),
        e.backgroundVideo && e.backgroundVideo.play());
    };
    a()
    e.clearIntervalItem('prepareTimer')
    e.prepareTimer = setInterval(a, 1000)
    e.clearIntervalItem('countDownTimer')
    e.countDownTimer = setInterval(function () {
      if (e.data.countDown > 0) {
        e.setData({
          countDown: e.data.countDown - 1,
          countDownSrc: e.data.countDownSrcAry[e.data.countDown - 1 == 2 ? 1 : 0]
        })
      } else {
        e.clearIntervalItem('countDownTimer')
        e.setData({
          countDown: "",
          sportStart: true,
          showDevicePage: true
        })
        e.startSport();
        if (e.data.limitTime > 0) {
          e.setTimeDown();
        }
      }
    }, 1000);
  },
  goBack: function () {
    wx.navigateBack();
  },
  reStart: function () {
    this.clearTimerAll()
    this.timerDown = null
    this.timer = null
    this.setData({
      predicting: !1,
      countDown: "",
      sportStart: !1,
      sportEnd: !1,
      num: 0,
      time: 60,
      doStand: !0,
      bot_mid: !1,
      left_mid: !1,
      right_mid: !1,
      reStartCountDown: 10,
      actionAry: [!1],
      hip_knee_mid_line: 0,
      halfLegLength: 0,
      show_tip: !0,
      stopGame: !1,
      showDevicePage: !1,
      costTime: 0,
      lastTime: this.data.limitTime,
      tipsText: '请站在识别框内',
      timeProgress: 0,
      costTime: 0,
      costTimeStr: '00:00',
    });
  },
  angleSuccess: function (t) {
    this.clearIntervalItem('timerDown')
    this.backgroundVideo && this.backgroundVideo.play()
    this.playMusic("keepMoving")
    this.setTimeDown();
  },
})