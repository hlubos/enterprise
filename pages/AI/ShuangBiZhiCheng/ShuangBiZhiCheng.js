var t = require("../../../models/posenet/classifier.js"), a = require("../utils")/*, new i.PageModel()*/;
Page({
  classifier: null,
  ctx: null,
  keypointStack: [],
  audios: [ "appear", "tooClose", "start", "timeOut", "comeOn", "5", "4", "3", "2", "1", "keepMoving", "endsoon" ],
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
      bot_mid: !1,
      left_mid: !1,
      right_mid: !1,
      doStand: !0,
      actionAry: [ !1 ],
      left_point_pos: 0,
      right_point_pos: 0,
      pixelRatio: 1,
      reStartCountDown: 10,
      shoulder_elbow_mid_line: null,
      halfArmLength: 0,
      show_tip: !0,
      countDownSrcAry: [ "1", "2", "3" ],
      show_in_box: !1,
      doUp: !0
  },
  onLoad: function(t) {
      o.configPlugin({
          fetchFunc: a.fetchFunc(),
          tf: n,
          canvas: wx.createOffscreenCanvas(),
          backendName: "wechat-webgl-" + Math.random()
      });
      var i = this;
      try {
          this.setData({
              "userInfo.skinCode": getApp().globalData.userInfo.skinCode
          });
      } catch (t) {
          r.getUserInfo({}, function(t) {
              i.setData({
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
          t.initClassifier(), t.context = wx.createCameraContext(t), t.context.onCameraFrame(function(i) {
              t.executeClassify(i);
          }).start();
      }, 1e3);
  },
  clearTimer: function() {
      this.timer && clearInterval(this.timer), this.leftTimer && clearInterval(this.leftTimer), 
      this.timerDown && clearInterval(this.timerDown), this.reStartTimer && clearInterval(this.reStartTimer), 
      this.startTimer && clearInterval(this.startTimer), this.endTimer && clearInterval(this.endTimer), 
      this.endTimer1 && clearInterval(this.endTimer1), this.notMovingTimer && clearInterval(this.notMovingTimer);
  },
  onUnload: function() {
      this.data.gameStart && !this.data.gameEnd && this.uploadScore(), wx.setKeepScreenOn({
          keepScreenOn: !1
      }), this.clearTimer(), this.classifier && this.classifier.isReady() && this.classifier.dispose(), 
      this.backgroundVideo && this.backgroundVideo.stop();
  },
  reStart: function() {
      this.clearTimer(), this.timerDown = null, this.timer = null, this.reStartTimer && clearInterval(this.reStartTimer), 
      this.setData({
          predicting: !1,
          countDown: "",
          gameStart: !1,
          gameEnd: !1,
          num: 0,
          complete: 0,
          time: 60,
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
          actionAry: [ !1 ]
      });
  },
  goBack: function() {
      wx.navigateBack();
  },
  satisfyConf: function(t, i, e) {
      if (Array.isArray(t) && i && Array.isArray(e)) {
          var a = !0;
          return e.forEach(function(e, n) {
              (!t[e] || t[e].score < i) && (a = !1);
          }), a;
      }
      return !1;
  },
  satisfyFrame: function(t, i) {
      var e = this, a = !0, n = 40 * this.data.pixelRatio;
      return Array.isArray(i) && Array.isArray(t) && i.forEach(function(i) {
          (!t[i] || t[i].position.x < e.data.left_point_pos - 2 * n || t[i].position.x > e.data.right_point_pos + 2 * n || t[i].position.y > .9 * e.data.videoHeight + 40 * e.data.pixelRatio + n || t[i].position.y < .1 * e.data.videoHeight - n) && (a = !1);
      }), a;
  },
  playMusic: function(t) {
      "appear" === t ? (this.audioSrcs[t + ""] != this.appearCtx.src && (this.appearCtx.src = this.audioSrcs[t + ""]), 
      this.appearCtx.play()) : (this.audioCtx.src = this.audioSrcs[t + ""], this.audioCtx.play());
  },
  downloadAudios: function() {
      var t = this;
      t.audios.forEach(function(i) {
          var e = "appear" === i ? "Sport_Ball_appear" : i;
          wx.downloadFile({
              url: "https://go-ran-pic.lovedabai.com/sound/" + e + ".mp3",
              success: function(e) {
                  200 === e.statusCode && (t.audioSrcs[i] = e.tempFilePath);
              }
          });
      });
  },
  triggerGameStart: function() {
      var t = this, i = this;
      this.setData({
          show_tip: !1
      });
      var e = 3, a = function() {
          e > 0 ? (t.playMusic(e), e--) : (t.playMusic("start"), clearInterval(i.startTimer), 
          i.backgroundVideo && i.backgroundVideo.play());
      };
      a(), clearInterval(i.startTimer), i.startTimer = setInterval(a, 1e3), i.timer = setInterval(function() {
          i.data.countDown > 0 ? i.setData({
              countDown: i.data.countDown - 1,
              countDownSrc: i.data.countDownSrcAry[i.data.countDown - 1 == 2 ? 1 : 0]
          }) : (clearInterval(i.timer), i.setData({
              countDown: "",
              gameStart: !0
          }), i.timerDown = setInterval(function() {
              if (i.data.time > 0) {
                  if (21 === i.data.time && i.playMusic("comeOn"), 6 === i.data.time) {
                      var e = 5, a = function() {
                          e > 0 ? (t.playMusic(e, !0), e--) : (t.playMusic("timeOut", !0), clearInterval(i.endTimer1));
                      };
                      a(), clearInterval(i.endTimer1), i.endTimer1 = setInterval(a, 1e3);
                  }
                  i.setData({
                      time: i.data.time - 1
                  });
              } else clearInterval(i.timerDown);
          }, 1e3));
      }, 1e3);
  },
  matchPoint: function(t, i, e) {
      var a = this, n = !0;
      return t.forEach(function(t) {
          (Math.abs(t.position.x - i) > 30 * a.data.pixelRatio || Math.abs(t.position.y - e) > 30 * a.data.pixelRatio) && (n = !1);
      }), n;
  },
  saveFrameToArray: function(t) {
      this.keypointStack.length > 400 ? this.keypointStack.splice(0, Math.floor(this.keypointStack.length / 2)) : this.keypointStack.push(t);
  },
  isMoving: function(t) {
      var i = this;
      if (0 === this.data.num) return !0;
      var e = 0, a = this.keypointStack.slice(-5);
      return 5 === a.length && (a.forEach(function(n, o) {
          if (0 !== o) {
              var r = !1;
              t.forEach(function(t) {
                  var e = Math.abs(n[t].position.x - a[o - 1][t].position.x), s = Math.abs(n[t].position.y - a[o - 1][t].position.y);
                  (e > s ? e : s) > 7 * i.data.widthMulti && (r = !0);
              }), r && e++;
          }
      }), e > 2);
  },
  isInBox: function(t) {
      var i = this, e = this.keypointStack.slice(-5);
      if (5 === e.length) {
          var a = 0;
          return e.forEach(function(e) {
              i.satisfyFrame(e, t) && a++;
          }), a >= 3;
      }
      return !1;
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
      this.clearTimer(), t.data.num <= 1 ? t.setData({
          rate: 0,
          integral: 0
      }) : r.gameFinish({
          code: "ShuangBiZhiCheng",
          score: this.data.num > 0 ? this.data.num - 1 : 0,
          time: 60 - this.data.time
      }, function(i) {
          i.result && t.setData({
              rate: (100 * i.result.exceedRate).toFixed(2),
              integral: i.result.integral
          });
      });
  },
  isOutScreen: function() {
      var t = this, i = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], e = this;
      if (this.data.gameEnd) return console.log("结束啦"), void this.clearTimer();
      var a = [ 5, 6, 7, 8 ], n = e.isMoving(a);
      e.data.time != e.data.recordTime && (e.setData({
          recordTime: e.data.time
      }), !n || i ? e.notMovingTimer || (e.notMovingTimer = setInterval(function() {
          e.setData({
              notMovingTimer: e.data.notMovingTimer ? e.data.notMovingTimer + 1 : 1
          }, function() {
              if (3 === e.data.notMovingTimer) t.playMusic("keepMoving"); else if (6 === e.data.notMovingTimer) t.playMusic("keepMoving"); else if (9 === e.data.notMovingTimer) {
                  var i = 5, a = function() {
                      i > 0 ? (i <= 3 ? t.playMusic(i) : 5 === i && t.playMusic("endsoon"), i--) : (t.playMusic("timeOut"), 
                      clearInterval(e.endTimer), e.setData({
                          gameEnd: !0
                      }, function() {
                          e.uploadScore(), e.triggerGameReStart();
                      }));
                  };
                  a(), clearInterval(e.endTimer), e.endTimer = setInterval(a, 1e3);
              }
          });
      }, 1e3)) : (clearInterval(e.notMovingTimer), e.notMovingTimer = null, clearInterval(e.endTimer), 
      e.endTimer = null, e.setData({
          notMovingTimer: 0
      })));
  },
  postImageData: function(t) {
      console.log(t), r.postBase64ImageData({
          base64_png: t
      }, function(t) {
          console.log("res", t);
      }, function(t) {}), this.loaded = !0;
  },
  takePhotoAndUpload: function() {
      var t = this;
      t.context.takePhoto({
          quality: "normal",
          success: function(i) {
              console.log("res", i), wx.getFileSystemManager().readFile({
                  filePath: i.tempImagePath,
                  encoding: "base64",
                  success: function(i) {
                      var e = "data:image/png;base64," + i.data;
                      t.postImageData(e);
                  },
                  complete: function(t) {
                      console.log("complete", t);
                  }
              });
          }
      });
  },
  convertBufferToCanvasImage: function(t) {
      var i = this, e = new Uint8Array(t.data), a = new Uint8ClampedArray(e);
      wx.canvasPutImageData({
          canvasId: "imageCanvas",
          x: 0,
          y: 0,
          width: t.width,
          height: t.height,
          data: a,
          success: function(e) {
              wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width: t.width,
                  height: t.height,
                  canvasId: "imageCanvas",
                  fileType: "png",
                  destWidth: t.width,
                  destHeight: t.height,
                  quality: .8,
                  success: function(t) {
                      wx.getFileSystemManager().readFile({
                          filePath: t.tempFilePath,
                          encoding: "base64",
                          success: function(t) {
                              var e = "data:image/png;base64," + t.data;
                              i.postImageData(e);
                          }
                      });
                  },
                  complete: function(t) {}
              }, i);
          },
          complete: function(t) {}
      });
  },
  executeClassify: function(t) {
      var i = this, a = this;
      this.classifier && this.classifier.isReady() && !this.data.predicting && this.setData({
          predicting: !0
      }, function() {
          i.classifier.detectSinglePose(t, "multiple").then(function(t) {
              if (a.data.time <= 0) return a.uploadScore(), void a.setData({
                  gameEnd: !0,
                  bot_line: null,
                  top_line: null
              }, function() {
                  a.reStartTimer = setInterval(function() {
                      a.data.reStartCountDown > 1 ? a.setData({
                          reStartCountDown: a.data.reStartCountDown - 1
                      }) : (clearInterval(a.reStartTimer), a.reStart());
                  }, 1e3);
              });
              if (!a.data.gameEnd) {
                  i.classifier.drawSinglePose(i.ctx, t);
                  var n = t[0].keypoints;
                  a.saveFrameToArray(n);
                  var o = [ 5, 6 ], r = a.satisfyConf(n, .2, o), s = (n[15].position.y + n[16].position.y) / 2, c = (n[9].position.y + n[10].position.y) / 2, l = n[0].position.y;
                  if (r) if (a.data.gameStart || a.timer) {
                      if (!a.data.countDown) {
                          var d = (n[5].position.y + n[6].position.y) / 2, u = (n[13].position.y, n[14].position.y, 
                          n[11].position.y, n[12].position.y, Math.abs(n[11].position.x - n[12].position.x)), h = Math.abs(n[5].position.x - n[6].position.x);
                          Math.abs(n[5].position.y - n[6].position.y);
                          a.data.show_tip && a.setData({
                              show_tip: !1
                          }), 0 === a.data.num && a.setData({
                              num: a.data.num + 1,
                              shoulder_elbow_mid_line: Math.abs(n[7].position.y + n[8].position.y + n[5].position.y + n[6].position.y) / 4,
                              head_line: n[0].position.y
                          }), a.notMovingTimer && clearInterval(a.notMovingTimer);
                          var p = (0, e.getJointAngle)(n[7].position, n[5].position, n[9].position), m = (0, 
                          e.getJointAngle)(n[8].position, n[6].position, n[10].position), g = ((0, e.getJointAngle)(n[14].position, n[12].position, n[16].position), 
                          (0, e.getJointAngle)(n[13].position, n[11].position, n[15].position), p > 160 && m > 160);
                          a.matchPoint([ n[7] ], n[13].position.x, n[13].position.y), a.matchPoint([ n[8] ], n[14].position.x, n[14].position.y), 
                          a.matchPoint([ n[9] ], n[15].position.x, n[15].position.y), a.matchPoint([ n[10] ], n[16].position.x, n[16].position.y);
                          if (d < a.data.shoulder_elbow_mid_line - 20 && g && d > a.data.head_line && u <= .7 * h) {
                              if (!a.leftTimer && !a.cantCounter) {
                                  var f = function() {
                                      a.cantCounter = !0, clearTimeout(a.disappearTimer), a.data.num && a.playMusic("appear"), 
                                      a.setData({
                                          num: a.data.num + 1
                                      }), a.disappearTimer = setTimeout(function() {
                                          a.cantCounter = !1;
                                      }, 1e3);
                                  };
                                  f(), clearInterval(a.leftTimer), a.leftTimer = setInterval(f, 1e3);
                              }
                          } else a.leftTimer && (clearInterval(a.leftTimer), a.leftTimer = null);
                      }
                  } else {
                      var v = !a.data.gameStart && s > .9 * a.data.videoHeight + 20 * a.data.pixelRatio, w = l > .25 * a.data.videoHeight + 20 * a.data.pixelRatio, y = (n[9].position.y + n[10].position.y - n[6].position.y - n[5].position.y) / 2, T = (n[15].position.y + n[16].position.y - n[11].position.y - n[12].position.y) / 2;
                      a.isInBox(o) && !v && w && y > T && c < .95 * a.data.videoHeight && a.setData({
                          countDown: 3,
                          countDownSrc: a.data.countDownSrcAry[2]
                      }, function() {
                          i.triggerGameStart();
                      });
                  } else a.data.gameStart && !a.isInBox(o) && a.setData({
                      show_tip: !0
                  }), a.data.gameStart && a.isOutScreen(!0);
                  a.setData({
                      predicting: !1
                  });
              }
          }).catch(function(t) {
              console.log(t, t.stack), a.setData({
                  predicting: !1
              }), a.data.gameStart && a.isOutScreen(!0);
          });
      });
  },
  initClassifier: function() {
      var i = this;
      this.showLoadingToast();
      var e = wx.getSystemInfoSync();
      this.classifier = new t.Classifier("front", {
          width: e.windowWidth,
          height: e.windowHeight
      }), this.setData({
          videoHeight: e.windowHeight,
          videoWidth: e.windowWidth,
          left_point_pos: (e.windowWidth - .35 * e.windowHeight) / 2,
          right_point_pos: e.windowWidth - (e.windowWidth - .35 * e.windowHeight) / 2,
          pixelRatio: e.pixelRatio / 2,
          widthMulti: e.windowWidth >= 768 ? e.windowWidth / 375 : 1
      }), this.classifier.load().then(function() {
          i.hideLoadingToast();
      }).catch(function(t) {
          console.log(t), wx.showToast({
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
  }
});