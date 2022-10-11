var t = require('../../../models/posenet/classifier.js'),
  a = require('../utils') /*, new i.PageModel()*/

import utils from '../../../common/utils'
import api from '../../../server/home'
import i18nInstance from 'miniprogram-i18n-plus'

Page({
  classifier: null,
  ctx: null,
  keypointStack: [],
  audios: [
    'appear',
    'tooClose',
    'start',
    'timeOut',
    'comeOn',
    '5',
    '4',
    '3',
    '2',
    '1',
    'keepMoving',
    'endsoon',
    'adjustAngle',
  ],
  audioSrcs: {},
  data: {
    predicting: !1,
    videoWidth: null,
    videoHeight: null,
    countDown: '',
    gameStart: !1,
    gameEnd: !1,
    curPose: '',
    num: 0,
    limitTime: 60,
    time: 60,
    bot_mid: !1,
    left_mid: !1,
    right_mid: !1,
    doStand: !0,
    actionAry: [!1],
    left_point_pos: 0,
    right_point_pos: 0,
    pixelRatio: 1,
    reStartCountDown: 10,
    shoulder_elbow_mid_line: null,
    halfArmLength: 0,
    show_tip: !0,
    countDownSrcAry: ['1', '2', '3'],
    show_in_box: !1,
    doUp: !0,
    stopGame: !1,
    showDevicePage: !1,
    canAdd: !0,
    startTs: 0, // 开始运动的时间戳
    timeProgress: 0,
    costTimeStr: '00:00',
  },
  onLoad: function (t) {
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['俯卧撑'],
    })
    var i = this
    t.angleRange = '70-85'
    this.setData({
      angleRange: t.angleRange,
      code: 'FuWoCheng',
      videoId: t.video_id || '33',
      videoName: t.video_name || '俯卧撑',
    })
    try {
      this.setData({
        'userInfo.skinCode': getApp().globalData.userInfo.skinCode,
      })
    } catch (t) {
      e.getUserInfo({}, function (t) {
        i.setData({
          'userInfo.skinCode': getApp().globalData.userInfo.skinCode,
        })
      })
    }
  },
  onReady: function () {
    wx.setKeepScreenOn({
      keepScreenOn: !0,
    })
    var t = this
    setTimeout(function () {
      ;(t.ctx = wx.createCanvasContext('canvas')),
        (t.audioCtx = wx.createInnerAudioContext()),
        (t.appearCtx = wx.createInnerAudioContext()),
        t.downloadAudios(),
        (t.backgroundVideo = t.selectComponent('#backgroundVideo')),
        t.initClassifier(),
        wx
          .createCameraContext(t)
          .onCameraFrame(function (i) {
            t.executeClassify(i)
          })
          .start()
    }, 1e3)
  },
  clearTimer: function () {
    this.timer && clearInterval(this.timer),
      this.timerDown && clearInterval(this.timerDown),
      this.reStartTimer && clearInterval(this.reStartTimer),
      this.startTimer && clearInterval(this.startTimer),
      this.endTimer && clearInterval(this.endTimer),
      this.endTimer1 && clearInterval(this.endTimer1),
      this.notMovingTimer && clearInterval(this.notMovingTimer),
      this.setData({
        showDevicePage: !1,
      })
  },
  onUnload: function () {
    this.data.gameStart && !this.data.gameEnd && this.uploadScore(),
      wx.setKeepScreenOn({
        keepScreenOn: !1,
      }),
      this.clearTimer(),
      this.classifier && this.classifier.isReady() && this.classifier.dispose(),
      this.backgroundVideo && this.backgroundVideo.stop()
  },
  reStart: function () {
    this.clearTimer(),
      (this.timerDown = null),
      (this.timer = null),
      this.reStartTimer && clearInterval(this.reStartTimer),
      this.setData({
        predicting: !1,
        countDown: '',
        gameStart: !1,
        gameEnd: !1,
        num: 0,
        complete: 0,
        time: this.data.limitTime,
        doUp: !0,
        doOpen: !1,
        bot_mid: !1,
        left_mid: !1,
        right_mid: !1,
        reStartCountDown: 10,
        shoulder_elbow_mid_line: null,
        halfArmLength: 0,
        show_tip: !0,
        show_in_box: !1,
        actionAry: [!1],
        stopGame: !1,
        showDevicePage: !1,
        startTs: 0, // 开始运动的时间戳
        timeProgress: 0,
        costTimeStr: '00:00',
      })
  },
  setTimeDown: function () {
    var t = this
    t.timerDown = setInterval(function () {
      let costTime = t.data.limitTime - t.data.time + 1
      t.data.time > 0
        ? (21 === t.data.time && t.playMusic('comeOn'),
          t.setData({
            time: t.data.time - 1,
            costTimeStr: utils.formatDuration(costTime, 'mm:ss'),
            timeProgress: t.data.limitTime
              ? costTime * (100 / t.data.limitTime)
              : 0,
          }),
          0 == t.data.time
            ? t.playMusic('timeOut', !0)
            : t.data.time <= 5 && t.playMusic(t.data.time, !0))
        : clearInterval(t.timerDown)
    }, 1e3)
  },
  angleSuccess: function (t) {
    clearInterval(this.timerDown)
    this.setData({
      stopGame: !1,
    }),
      this.data.gameEnd ||
        (this.backgroundVideo && this.backgroundVideo.play()),
      this.playMusic('keepMoving'),
      this.setTimeDown()
  },
  stopGame: function () {
    this.setData({
      stopGame: !0,
      showDevicePage: !1,
    }),
      this.timerDown && clearInterval(this.timerDown),
      this.backgroundVideo && this.backgroundVideo.stop(),
      this.notMovingTimer && clearInterval(this.notMovingTimer),
      this.endTimer && clearInterval(this.endTimer),
      this.playMusic('adjustAngle')
  },
  onShow: function () {
    this.data.stopGame &&
      (this.angleSuccess(),
      this.setData({
        showDevicePage: !0,
      }))
  },
  goBack: function () {
    wx.navigateBack()
  },
  satisfyConf: function (t, i, a) {
    if (Array.isArray(t) && i && Array.isArray(a)) {
      var e = !0
      return (
        a.forEach(function (a, o) {
          ;(!t[a] || t[a].score < i) && (e = !1)
        }),
        e
      )
    }
    return !1
  },
  satisfyFrame: function (t, i) {
    var a = this,
      e = !0,
      o = 40 * this.data.pixelRatio
    return (
      Array.isArray(i) &&
        Array.isArray(t) &&
        i.forEach(function (i) {
          ;(!t[i] ||
            t[i].position.x < a.data.left_point_pos - 2 * o ||
            t[i].position.x > a.data.right_point_pos + 2 * o ||
            t[i].position.y >
              0.9 * a.data.videoHeight + 40 * a.data.pixelRatio + o ||
            t[i].position.y < 0.1 * a.data.videoHeight - o) &&
            (e = !1)
        }),
      e
    )
  },
  playMusic: function (t) {
    'appear' === t
      ? (this.audioSrcs[t + ''] != this.appearCtx.src &&
          (this.appearCtx.src = this.audioSrcs[t + '']),
        this.appearCtx.play())
      : ((this.audioCtx.src = this.audioSrcs[t + '']), this.audioCtx.play())
  },
  downloadAudios: function () {
    let t = this
    t.audios.forEach(function (e) {
      let i = e
      let ft = '.mp3'
      if (['start'].indexOf(i) > -1) {
        ft = '.aac'
      }
      let url = 'https://ydcommon.51yund.com/AI/YD/audio/' + i + ft
      wx.downloadFile({
        url: url,
        success: function (i) {
          200 === i.statusCode && (t.audioSrcs[e] = i.tempFilePath)
        },
      })
    })
  },
  triggerGameStart: function () {
    var t = this,
      i = this
    this.setData({
      show_tip: !1,
    })
    var a = 3,
      e = function () {
        a > 0
          ? (t.playMusic(a), a--)
          : (t.playMusic('start'),
            clearInterval(i.startTimer),
            i.backgroundVideo && i.backgroundVideo.play())
      }
    e(),
      clearInterval(i.startTimer),
      (i.startTimer = setInterval(e, 1e3)),
      (i.timer = setInterval(function () {
        i.data.countDown > 0
          ? i.setData({
              countDown: i.data.countDown - 1,
              countDownSrc:
                i.data.countDownSrcAry[i.data.countDown - 1 == 2 ? 1 : 0],
            })
          : (clearInterval(i.timer),
            i.setData({
              countDown: '',
              gameStart: !0,
              showDevicePage: !0,
            }),
            i.setTimeDown())
      }, 1e3))
    t.setData({
      startTs: parseInt(Date.parse(new Date()) / 1000),
    })
  },
  matchPoint: function (t, i, a) {
    var e = this,
      o = !0
    return (
      t.forEach(function (t) {
        ;(Math.abs(t.position.x - i) > 30 * e.data.pixelRatio ||
          Math.abs(t.position.y - a) > 30 * e.data.pixelRatio) &&
          (o = !1)
      }),
      o
    )
  },
  saveFrameToArray: function (t) {
    this.keypointStack.length > 400
      ? this.keypointStack.splice(0, Math.floor(this.keypointStack.length / 2))
      : this.keypointStack.push(t)
  },
  isMoving: function (t) {
    var i = this
    if (0 === this.data.num) return !0
    var a = 0,
      e = this.keypointStack.slice(-5)
    return (
      5 === e.length &&
      (e.forEach(function (o, n) {
        if (0 !== n) {
          var r = !1
          t.forEach(function (t) {
            var a = Math.abs(o[t].position.x - e[n - 1][t].position.x),
              s = Math.abs(o[t].position.y - e[n - 1][t].position.y)
            ;(a > s ? a : s) > 7 * i.data.widthMulti && (r = !0)
          }),
            r && a++
        }
      }),
      a >= 2)
    )
  },
  isInBox: function (t) {
    var i = this,
      a = this.keypointStack.slice(-5)
    if (5 === a.length) {
      var e = 0
      return (
        a.forEach(function (a) {
          i.satisfyFrame(a, t) && e++
        }),
        e >= 3
      )
    }
    return !1
  },
  triggerGameReStart: function () {
    var t = this
    t.reStartTimer = setInterval(function () {
      t.data.reStartCountDown > 1
        ? t.setData({
            reStartCountDown: t.data.reStartCountDown - 1,
          })
        : clearInterval(t.reStartTimer)
      // }) : (clearInterval(t.reStartTimer), t.reStart());
    }, 1e3)
  },
  uploadScore: function () {
    console.log(`=====uploadScore====`)
    var t = this
    clearInterval(t.timerDown),
      this.backgroundVideo && this.backgroundVideo.stop(),
      this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight),
      this.ctx.draw(),
      (t.timerDown = null),
      this.clearTimer()
    if (t.data.num <= 1) {
      t.setData({
        rate: 0,
        integral: 0,
      })
      return
    }
    let costTime = this.data.limitTime - this.data.time
    this.setData({
      showDevicePage: !1,
      costTimeStr: utils.formatDuration(costTime, 'mm:ss'),
    })
    let param = {
      video_id: this.data.videoId,
      video_name: this.data.videoName,
      start_ts: this.data.startTs,
      cost_time: costTime,
      action_times: this.data.num - 1,
    }
    api.reportUserAISportData(param).then((i) => {
      // do
    })
  },
  isOutScreen: function () {
    var t = this,
      i = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
      a = this
    if (this.data.gameEnd) return console.log('结束啦'), void this.clearTimer()
    var e = [5, 6, 7, 8],
      o = a.isMoving(e)
    a.data.time != a.data.recordTime &&
      (a.setData({
        recordTime: a.data.time,
      }),
      (!o || i) && a.data.time > 10
        ? a.notMovingTimer ||
          (a.notMovingTimer = setInterval(function () {
            a.setData(
              {
                notMovingTimer: a.data.notMovingTimer
                  ? a.data.notMovingTimer + 1
                  : 1,
              },
              function () {
                if (3 === a.data.notMovingTimer) t.playMusic('keepMoving')
                else if (6 === a.data.notMovingTimer) t.playMusic('keepMoving')
                else if (9 === a.data.notMovingTimer && a.data.time > 10) {
                  var i = 5,
                    e = function () {
                      i > 0
                        ? (i <= 3
                            ? t.playMusic(i)
                            : 5 === i && t.playMusic('endsoon'),
                          i--)
                        : (t.playMusic('timeOut'),
                          clearInterval(a.endTimer),
                          a.setData({
                            gameEnd: !0,
                          }),
                          a.uploadScore(),
                          a.triggerGameReStart())
                    }
                  e(),
                    clearInterval(a.endTimer),
                    (a.endTimer = setInterval(e, 1e3))
                }
              },
            )
          }, 1e3))
        : (clearInterval(a.notMovingTimer),
          (a.notMovingTimer = null),
          clearInterval(a.endTimer),
          (a.endTimer = null),
          a.setData({
            notMovingTimer: 0,
          })))
  },
  executeClassify: function (t) {
    var i = this,
      e = this
    this.classifier &&
      this.classifier.isReady() &&
      !this.data.predicting &&
      this.setData(
        {
          predicting: !0,
        },
        function () {
          i.classifier
            .detectSinglePose(t, 'multiple')
            .then(function (t) {
              if (e.data.time <= 0)
                return (
                  e.uploadScore(),
                  void e.setData(
                    {
                      gameEnd: !0,
                      shoulder_elbow_mid_line: null,
                    },
                    function () {
                      e.reStartTimer = setInterval(function () {
                        e.data.reStartCountDown > 1
                          ? e.setData({
                              reStartCountDown: e.data.reStartCountDown - 1,
                            })
                          : clearInterval(e.reStartTimer)
                        // }) : (clearInterval(e.reStartTimer), e.reStart());
                      }, 1e3)
                    },
                  )
                )
              // e.classifier.drawSinglePose(e.ctx, t)
              if (!e.data.gameEnd) {
                var o = t[0].keypoints
                e.saveFrameToArray(o)
                var n = [5, 6],
                  r = e.satisfyConf(o, 0.2, n),
                  s = (o[15].position.y + o[16].position.y) / 2,
                  d = (o[9].position.y + o[10].position.y) / 2,
                  c = o[0].position.y
                if (r)
                  if (e.data.gameStart || e.timer) {
                    if (!e.data.countDown) {
                      e.isOutScreen()
                      var l =
                          Math.abs(
                            o[7].position.y +
                              o[8].position.y -
                              o[5].position.y -
                              o[6].position.y,
                          ) / 2,
                        h = (o[5].position.y + o[6].position.y) / 2
                      if (
                        (e.data.show_tip &&
                          e.setData({
                            show_tip: !1,
                          }),
                        e.data.doUp &&
                          !1 === e.data.actionAry[e.data.actionAry.length - 1])
                      )
                        0 === e.data.num &&
                          e.setData({
                            halfArmLength: l,
                            shoulder_elbow_mid_line:
                              Math.abs(
                                o[7].position.y +
                                  o[8].position.y +
                                  o[5].position.y +
                                  o[6].position.y,
                              ) / 4,
                          }),
                          (0 === e.data.num ||
                            h < e.data.shoulder_elbow_mid_line - 30) &&
                            e.data.canAdd &&
                            (e.data.num && e.playMusic('appear'),
                            e.setData({
                              num: e.data.num + 1,
                              doUp: !1,
                              actionAry: e.data.actionAry.concat(!0),
                              canAdd: !1,
                            }),
                            setTimeout(function () {
                              e.setData({
                                canAdd: !0,
                              })
                            }, 300))
                      else if (
                        !0 === e.data.actionAry[e.data.actionAry.length - 1] &&
                        !e.data.doUp
                      ) {
                        var u = (0, a.getJointAngle)(
                            o[7].position,
                            o[5].position,
                            o[9].position,
                          ),
                          p = (0, a.getJointAngle)(
                            o[8].position,
                            o[6].position,
                            o[10].position,
                          ),
                          m = u < 130 || p < 130
                        h > e.data.shoulder_elbow_mid_line + 20 &&
                          m &&
                          e.setData({
                            doUp: !0,
                            actionAry: e.data.actionAry.concat(!1),
                          })
                      }
                    }
                  } else {
                    var g =
                        !e.data.gameStart &&
                        s > 0.9 * e.data.videoHeight + 20 * e.data.pixelRatio,
                      f =
                        c > 0.25 * e.data.videoHeight + 20 * e.data.pixelRatio,
                      v =
                        (o[9].position.y +
                          o[10].position.y -
                          o[6].position.y -
                          o[5].position.y) /
                        2,
                      w =
                        (o[15].position.y +
                          o[16].position.y -
                          o[11].position.y -
                          o[12].position.y) /
                        2
                    e.isInBox(n) &&
                      !g &&
                      f &&
                      v > w &&
                      d < 0.95 * e.data.videoHeight &&
                      e.setData(
                        {
                          countDown: 3,
                          countDownSrc: e.data.countDownSrcAry[2],
                        },
                        function () {
                          i.triggerGameStart()
                        },
                      )
                  }
                else
                  e.data.gameStart &&
                    !e.isInBox(n) &&
                    e.setData({
                      show_tip: !0,
                    }),
                    e.data.gameStart && e.isOutScreen(!0)
                e.setData({
                  predicting: !1,
                })
              }
            })
            .catch(function (t) {
              console.error(t),
                e.setData({
                  predicting: !1,
                }),
                e.data.gameStart && e.isOutScreen(!0)
            })
        },
      )
  },
  initClassifier: function () {
    var i = this
    this.showLoadingToast()
    var a = wx.getSystemInfoSync()
    ;(this.classifier = new t.Classifier('front', {
      width: a.windowWidth,
      height: a.windowHeight,
    })),
      this.setData({
        videoHeight: a.windowHeight,
        videoWidth: a.windowWidth,
        left_point_pos: (a.windowWidth - 0.35 * a.windowHeight) / 2,
        right_point_pos:
          a.windowWidth - (a.windowWidth - 0.35 * a.windowHeight) / 2,
        pixelRatio: a.pixelRatio / 2,
        widthMulti: a.windowWidth >= 768 ? a.windowWidth / 375 : 1,
      }),
      this.classifier
        .load()
        .then(function () {
          i.hideLoadingToast()
        })
        .catch(function (t) {
          console.log(t),
            wx.showToast({
              title: '网络连接异常',
              icon: 'none',
            })
        })
  },
  showLoadingToast: function () {
    wx.showLoading({
      title: '加载中...',
    })
  },
  hideLoadingToast: function () {
    wx.hideLoading()
  },
})
