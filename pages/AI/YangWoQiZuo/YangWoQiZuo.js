var t = require("../../../models/posenet/classifier.js"), a = require("../utils");
Page({
  classifier: null,
  ctx: null,
  keypointStack: [],
  audios: [ "appear", "tooClose", "start", "timeOut", "comeOn", "5", "4", "3", "2", "1", "keepMoving", "endsoon", "adjustAngle" ],
  audioSrcs: {},
  data: {
      predicting: !1,
      videoWidth: null,
      videoHeight: null,
      countDown: "",
      gameStart: !1,
      gameEnd: !1,
      curPose: "",
      num: 0,
      time: 60,
      doClose: !0,
      bot_mid: !1,
      left_mid: !1,
      right_mid: !1,
      left_point_pos: 0,
      right_point_pos: 0,
      pixelRatio: 1,
      reStartCountDown: 10,
      justRing: !1,
      jumpY: null,
      show_tip: !0,
      actionAry: [ !1 ],
      countDownSrcAry: [ "1", "2", "3" ],
      show_in_box: !1,
      stopGame: !1,
      showDevicePage: !1
  },
  onLoad: function(t) {
      var e = this;
      this.setData({
          angleRange: t.angleRange,
          code: t.code
      });
      try {
          this.setData({
              "userInfo.skinCode": getApp().globalData.userInfo.skinCode
          });
      } catch (t) {
          i.getUserInfo({}, function(t) {
              e.setData({
                  "userInfo.skinCode": getApp().globalData.userInfo.skinCode
              });
          });
      }
  },
  onReady: function() {
      wx.setKeepScreenOn({
          keepScreenOn: !0
      });
      var t = this;
      setTimeout(function() {
          t.ctx = wx.createCanvasContext("canvas"), t.audioCtx = wx.createInnerAudioContext(), 
          t.appearCtx = wx.createInnerAudioContext(), t.downloadAudios(), t.backgroundVideo = t.selectComponent("#backgroundVideo"), 
          t.initClassifier(), wx.createCameraContext(t).onCameraFrame(function(e) {
              t.executeClassify(e);
          }).start();
      }, 1e3);
  },
  playMusic: function(t) {
      "appear" === t ? (this.audioSrcs[t + ""] != this.appearCtx.src && (this.appearCtx.src = this.audioSrcs[t + ""]), 
      this.appearCtx.play()) : (this.audioCtx.src = this.audioSrcs[t + ""], this.audioCtx.play());
  },
  downloadAudios: function() {
      var t = this;
      t.audios.forEach(function(e) {
          var i = "appear" === e ? "Sport_Ball_appear" : e;
          wx.downloadFile({
              url: "https://go-ran-pic.lovedabai.com/sound/" + i + ".mp3",
              success: function(i) {
                  200 === i.statusCode && (t.audioSrcs[e] = i.tempFilePath);
              }
          });
      });
  },
  clearTimer: function() {
      this.timer && clearInterval(this.timer), this.timerDown && clearInterval(this.timerDown), 
      this.reStartTimer && clearInterval(this.reStartTimer), this.startTimer && clearInterval(this.startTimer), 
      this.endTimer && clearInterval(this.endTimer), this.endTimer1 && clearInterval(this.endTimer1), 
      this.notMovingTimer && clearInterval(this.notMovingTimer), this.setData({
          showDevicePage: !1
      });
  },
  onUnload: function() {
      this.data.gameStart && !this.data.gameEnd && this.uploadScore(), wx.setKeepScreenOn({
          keepScreenOn: !1
      }), this.clearTimer(), this.classifier && this.classifier.isReady() && this.classifier.dispose(), 
      this.backgroundVideo && this.backgroundVideo.stop();
  },
  reStart: function() {
      this.clearTimer(), this.timerDown = null, this.timer = null, this.reStartTimer && clearInterval(this.reStartTimer), 
      this.isTimeEnding = !1, this.setData({
          predicting: !1,
          countDown: "",
          gameStart: !1,
          gameEnd: !1,
          num: 0,
          time: 60,
          bot_mid: !1,
          left_mid: !1,
          right_mid: !1,
          reStartCountDown: 10,
          doClose: !0,
          justRing: !1,
          actionAry: [ !1 ],
          show_tip: !0,
          show_in_box: !1,
          stopGame: !1,
          showDevicePage: !1
      });
  },
  goBack: function() {
      wx.navigateBack();
  },
  satisfyConf: function(t, e, i) {
      if (Array.isArray(t) && e && Array.isArray(i)) {
          var a = !0;
          return i.forEach(function(i, n) {
              (!t[i] || t[i].score < e) && (a = !1);
          }), a;
      }
      return !1;
  },
  satisfyFrame: function(t, e) {
      var i = this, a = !0;
      return Array.isArray(e) && Array.isArray(t) && e.forEach(function(e) {
          (!t[e] || t[e].position.x < i.data.left_point_pos - 40 || t[e].position.x > i.data.right_point_pos + 40 || t[e].position.y > .9 * i.data.videoHeight + 40 + 20 || t[e].position.y < .1 * i.data.videoHeight - 20) && (a = !1);
      }), a;
  },
  triggerGameStart: function() {
      var t = this, e = this, i = 3, a = function() {
          i > 0 ? (t.playMusic(i), i--) : (t.playMusic("start"), clearInterval(e.startTimer), 
          e.backgroundVideo && e.backgroundVideo.play());
      };
      a(), clearInterval(e.startTimer), e.startTimer = setInterval(a, 1e3), e.timer = setInterval(function() {
          e.data.countDown > 0 ? e.setData({
              countDown: e.data.countDown - 1,
              countDownSrc: e.data.countDownSrcAry[e.data.countDown - 1 == 2 ? 1 : 0]
          }) : (clearInterval(e.timer), e.setData({
              countDown: "",
              gameStart: !0,
              showDevicePage: !0
          }), e.setTimeDown());
      }, 1e3);
  },
  setTimeDown: function() {
      var t = this;
      t.timerDown = setInterval(function() {
          t.data.time > 0 ? (21 === t.data.time && t.playMusic("comeOn"), t.setData({
              time: t.data.time - 1
          }), 0 == t.data.time ? t.playMusic("timeOut", !0) : t.data.time <= 5 && t.playMusic(t.data.time, !0)) : clearInterval(t.timerDown);
      }, 1e3);
  },
  angleSuccess: function(t) {
      clearInterval(this.timerDown);
      this.setData({
          stopGame: !1
      }), this.data.gameEnd || this.backgroundVideo && this.backgroundVideo.play(), this.playMusic("keepMoving"), 
      this.setTimeDown();
  },
  stopGame: function() {
      this.setData({
          stopGame: !0,
          showDevicePage: !1
      }), this.timerDown && clearInterval(this.timerDown), this.backgroundVideo && this.backgroundVideo.stop(), 
      this.notMovingTimer && clearInterval(this.notMovingTimer), this.endTimer && clearInterval(this.endTimer), 
      this.playMusic("adjustAngle");
  },
  onShow: function() {
      this.data.stopGame && (this.angleSuccess(), this.setData({
          showDevicePage: !0
      }));
  },
  matchPoint: function(t, e, i) {
      var a = !0;
      return t.forEach(function(t) {
          (Math.abs(t.position.x - e) > 60 || Math.abs(t.position.y - i) > 60) && (a = !1);
      }), a;
  },
  saveFrameToArray: function(t) {
      this.keypointStack.length > 400 ? this.keypointStack.splice(0, Math.floor(this.keypointStack.length / 2)) : this.keypointStack.push(t);
  },
  isMoving: function(t) {
      var e = this, i = 0, a = this.keypointStack.slice(-5);
      return 5 === a.length && (a.forEach(function(n, o) {
          if (0 !== o) {
              var r = !1;
              t.forEach(function(t) {
                  var i = Math.abs(n[t].position.x - a[o - 1][t].position.x), s = Math.abs(n[t].position.y - a[o - 1][t].position.y);
                  (i > s ? i : s) > 8 * e.data.widthMulti && (r = !0);
              }), r && i++;
          }
      }), i >= 3);
  },
  isInBox: function(t) {
      var e = this, i = this.keypointStack.slice(-5);
      if (5 === i.length) {
          var a = 0;
          return i.forEach(function(i) {
              e.satisfyFrame(i, t) && a++;
          }), a >= 3;
      }
      return !1;
  },
  isTooClose: function(t) {
      var e = this;
      t > .95 * this.data.videoHeight && (e.data.justRing || e.data.gameEnd || (e.playMusic("tooClose"), 
      e.setData({
          show_in_box: !0
      }, function() {
          return setTimeout(function() {
              e.setData({
                  show_in_box: !1
              });
          }, 1e3);
      }), e.setData({
          justRing: !0
      }, function() {
          var t = setTimeout(function() {
              e.setData({
                  justRing: !1
              }), clearTimeout(t);
          }, 5e3);
      })));
  },
  getHighestScorePoint: function(t) {
      var e = t[0];
      return t.forEach(function(t) {
          t.score > e && (e = t);
      }), e.position.y;
  },
  maxConfinencePoint: function(t) {
      var e = t[0];
      return t.forEach(function(t) {
          t.score > e.score && (e = t);
      }), e;
  },
  triggerGameReStart: function() {
      var t = this;
      t.reStartTimer = setInterval(function() {
          t.data.reStartCountDown > 1 ? t.setData({
              reStartCountDown: t.data.reStartCountDown - 1
          }) : (clearInterval(t.reStartTimer), t.reStart());
      }, 1e3);
  },
  uploadScore: function() {
      var t = this;
      clearInterval(t.timerDown), this.backgroundVideo && this.backgroundVideo.stop(), 
      this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight), this.ctx.draw(), t.timerDown = null, 
      t.clearTimer(), t.data.num <= 1 ? t.setData({
          rate: 0,
          integral: 0
      }) : (this.setData({
          showDevicePage: !1
      }), i.gameFinish({
          code: "YangWoQiZuo",
          score: this.data.num > 0 ? this.data.num - 1 : 0,
          time: 60 - this.data.time
      }, function(e) {
          e.result && t.setData({
              rate: (100 * e.result.exceedRate).toFixed(2),
              integral: e.result.integral
          });
      }));
  },
  isOutScreen: function() {
      var t = this, e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], i = this;
      if (this.data.gameEnd) return console.log("结束啦"), void this.clearTimer();
      var a = [ 5, 6, 9, 10, 11, 12 ], n = i.isMoving(a);
      i.data.time != i.data.recordTime && (i.setData({
          recordTime: i.data.time
      }), !n || e ? i.notMovingTimer || (i.notMovingTimer = setInterval(function() {
          i.setData({
              notMovingTimer: i.data.notMovingTimer ? i.data.notMovingTimer + 1 : 1
          }, function() {
              if (3 === i.data.notMovingTimer) t.playMusic("keepMoving"); else if (6 === i.data.notMovingTimer) t.playMusic("keepMoving"); else if (9 === i.data.notMovingTimer && i.data.time > 10) {
                  var e = 5, a = function() {
                      e > 0 ? (e <= 3 ? t.playMusic(e) : 5 === e && t.playMusic("endsoon"), e--) : (t.playMusic("timeOut"), 
                      clearInterval(i.endTimer), i.setData({
                          gameEnd: !0
                      }), i.uploadScore(), i.triggerGameReStart());
                  };
                  a(), clearInterval(i.endTimer), i.endTimer = setInterval(a, 1e3);
              }
          });
      }, 1e3)) : (clearInterval(i.notMovingTimer), i.notMovingTimer = null, clearInterval(i.endTimer), 
      i.endTimer = null, i.setData({
          notMovingTimer: 0
      })));
  },
  executeClassify: function(t) {
      var e = this, i = this;
      this.classifier && this.classifier.isReady() && !this.data.predicting && this.setData({
          predicting: !0
      }, function() {
          e.classifier.detectSinglePose(t).then(function(t) {
              if (i.data.time <= 0 && !i.isTimeEnding) return i.isTimeEnding = !0, i.uploadScore(), 
              void i.setData({
                  gameEnd: !0
              }, function() {
                  i.reStartTimer = setInterval(function() {
                      i.data.reStartCountDown > 1 ? i.setData({
                          reStartCountDown: i.data.reStartCountDown - 1
                      }) : (clearInterval(i.reStartTimer), i.reStart());
                  }, 1e3);
              });
              if (!i.data.gameEnd) {
                  var a = t.keypoints;
                  i.saveFrameToArray(a);
                  var n, o, r;
                  n = i.data.knee_line || a[14].position.y, a[12].position.y, o = a[10].position.y, 
                  "right", (r = i.maxConfinencePoint([ a[2], a[4], a[0] ])).score < .2 && (r = i.maxConfinencePoint([ r, a[10] ]));
                  a[0].position.y;
                  var s = o < n && r.score > .2, c = s && a[14].score > .2;
                  if (i.data.doClose || i.satisfyConf(a, .2, [ 14 ])) if (i.data.gameStart || i.timer || !c) {
                      if (!i.data.countDown && i.data.gameStart) if (i.isOutScreen(), i.data.doClose && !1 === i.data.actionAry[i.data.actionAry.length - 1]) (a[0].position.y > i.data.knee_line || a[0].score < .2 && a[10].score < .2) && i.setData({
                          doClose: !1,
                          actionAry: i.data.actionAry.concat(!0)
                      }); else if (!0 === i.data.actionAry[i.data.actionAry.length - 1] && !i.data.counting) {
                          0 === i.data.num && i.setData({
                              knee_line: n
                          });
                          var d = a[14];
                          Math.abs(r.position.x - d.position.x), i.data.videoWidth;
                          (0 === i.data.num || s) && (i.data.num && i.playMusic("appear"), i.setData({
                              doClose: !0,
                              num: i.data.num + 1,
                              actionAry: i.data.actionAry.concat(!1),
                              counting: !0
                          }, function() {
                              setTimeout(function() {
                                  return i.setData({
                                      counting: !1
                                  });
                              }, 500);
                          }));
                      }
                  } else i.timer = !0, i.data.show_tip && i.setData({
                      show_tip: !1
                  }), i.setData({
                      countDown: 3,
                      countDownSrc: i.data.countDownSrcAry[2]
                  }, function() {
                      e.triggerGameStart();
                  }); else i.data.gameStart && !i.isInBox([ 0, 11, 12, 13, 14 ]) && i.setData({
                      show_tip: !0
                  }), i.data.gameStart && i.isOutScreen(!0);
                  i.setData({
                      predicting: !1
                  });
              }
          }).catch(function(t) {
              i.setData({
                  predicting: !1
              }), i.data.gameStart && i.isOutScreen(!0), console.log(t, t.stack);
          });
      });
  },
  initClassifier: function() {
      var e = this;
      this.showLoadingToast();
      var i = wx.getSystemInfoSync();
      this.classifier = new t.Classifier("front", {
          width: i.windowWidth,
          height: i.windowHeight
      });
      var a = i.windowWidth / 2 - .1 * i.windowHeight, n = i.windowWidth - a;
      this.setData({
          videoHeight: i.windowHeight,
          videoWidth: i.windowWidth,
          left_point_pos: a,
          right_point_pos: n,
          pixelRatio: i.pixelRatio / 2,
          jumpY: .9 * i.windowHeight - 40,
          widthMulti: i.windowWidth >= 768 ? i.windowWidth / 375 : 1
      }), this.classifier.load().then(function() {
          e.hideLoadingToast();
      }).catch(function(t) {
          wx.showToast({
              title: "网络连接异常",
              icon: "none"
          });
      });
  },
  showLoadingToast: function() {
      wx.showLoading({
          title: "加载中..."
      });
  },
  hideLoadingToast: function() {
      wx.hideLoading();
  },
  onShareAppMessage: function() {
      return {
          title: "企业悦动"
      };
  }
});