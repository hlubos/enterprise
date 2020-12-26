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
      n.configPlugin({
          fetchFunc: a.fetchFunc(),
          tf: o,
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
          var i, e, a;
          t.ctx = wx.createCanvasContext("canvas"), t.audioCtx = wx.createInnerAudioContext(), 
          t.appearCtx = wx.createInnerAudioContext(), t.downloadAudios(), t.backgroundVideo = t.selectComponent("#backgroundVideo"), 
          t.initClassifier(), t.context = wx.createCameraContext(t), t.context.onCameraFrame((i = function(i) {
              t.convertBufferToCanvasImage(i);
          }, e = 500, a = Date.now(), function() {
              var t = this, o = arguments, n = Date.now();
              n - a >= e && (i.apply(t, o), a = Date.now());
          })).start();
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
          return e.forEach(function(e, o) {
              (!t[e] || t[e].score < i) && (a = !1);
          }), a;
      }
      return !1;
  },
  satisfyFrame: function(t, i) {
      var e = this, a = !0, o = 40 * this.data.pixelRatio;
      return Array.isArray(i) && Array.isArray(t) && i.forEach(function(i) {
          (!t[i] || t[i].position.x < e.data.left_point_pos - 2 * o || t[i].position.x > e.data.right_point_pos + 2 * o || t[i].position.y > .9 * e.data.videoHeight + 40 * e.data.pixelRatio + o || t[i].position.y < .1 * e.data.videoHeight - o) && (a = !1);
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
      var a = this, o = !0;
      return t.forEach(function(t) {
          (Math.abs(t.position.x - i) > 30 * a.data.pixelRatio || Math.abs(t.position.y - e) > 30 * a.data.pixelRatio) && (o = !1);
      }), o;
  },
  saveFrameToArray: function(t) {
      this.keypointStack.length > 400 ? this.keypointStack.splice(0, Math.floor(this.keypointStack.length / 2)) : this.keypointStack.push(t);
  },
  isMoving: function(t) {
      var i = this;
      if (0 === this.data.num) return !0;
      var e = 0, a = this.keypointStack.slice(-5);
      return 5 === a.length && (a.forEach(function(o, n) {
          if (0 !== n) {
              var r = !1;
              t.forEach(function(t) {
                  var e = Math.abs(o[t].position.x - a[n - 1][t].position.x), s = Math.abs(o[t].position.y - a[n - 1][t].position.y);
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
      var a = [ 5, 6, 7, 8 ], o = e.isMoving(a);
      e.data.time != e.data.recordTime && (e.setData({
          recordTime: e.data.time
      }), !o || i ? e.notMovingTimer || (e.notMovingTimer = setInterval(function() {
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
      var i = this;
      r.postBase64ImageData({
          base64_image: t
      }, function(t) {
          i.analysisData(t);
      }, function(t) {
          console.log("rerr");
      });
  },
  analysisData: function(t) {
      var i = this, a = this;
      if (a.data.time <= 0) return a.uploadScore(), void a.setData({
          gameEnd: !0,
          shoulder_elbow_mid_line: null
      }, function() {
          a.reStartTimer = setInterval(function() {
              a.data.reStartCountDown > 1 ? a.setData({
                  reStartCountDown: a.data.reStartCountDown - 1
              }) : (clearInterval(a.reStartTimer), a.reStart());
          }, 1e3);
      });
      if (!a.data.gameEnd) if (t.length) {
          var o = t[0], n = {
              score: 1,
              keypoints: [ {
                  position: {
                      y: o[0][1],
                      x: o[0][0]
                  },
                  part: "nose",
                  score: 1
              }, {
                  position: {
                      y: o[16][1],
                      x: o[16][0]
                  },
                  part: "leftEye",
                  score: 1
              }, {
                  position: {
                      y: o[15][1],
                      x: o[15][0]
                  },
                  part: "rightEye",
                  score: 1
              }, {
                  position: {
                      y: o[18][1],
                      x: o[18][0]
                  },
                  part: "leftEar",
                  score: 1
              }, {
                  position: {
                      y: o[17][1],
                      x: o[17][0]
                  },
                  part: "rightEar",
                  score: 1
              }, {
                  position: {
                      y: o[5][1],
                      x: o[5][0]
                  },
                  part: "leftShoulder",
                  score: 1
              }, {
                  position: {
                      y: o[2][1],
                      x: o[2][0]
                  },
                  part: "rightShoulder",
                  score: 1
              }, {
                  position: {
                      y: o[6][1],
                      x: o[6][0]
                  },
                  part: "leftElbow",
                  score: 1
              }, {
                  position: {
                      y: o[3][1],
                      x: o[3][0]
                  },
                  part: "rightElbow",
                  score: 1
              }, {
                  position: {
                      y: o[7][1],
                      x: o[7][0]
                  },
                  part: "leftWrist",
                  score: 1
              }, {
                  position: {
                      y: o[4][1],
                      x: o[4][0]
                  },
                  part: "rightWrist",
                  score: 1
              }, {
                  position: {
                      y: o[12][1],
                      x: o[12][0]
                  },
                  part: "leftHip",
                  score: 1
              }, {
                  position: {
                      y: o[9][1],
                      x: o[9][0]
                  },
                  part: "rightHip",
                  score: 1
              }, {
                  position: {
                      y: o[13][1],
                      x: o[13][0]
                  },
                  part: "leftKnee",
                  score: 1
              }, {
                  position: {
                      y: o[10][1],
                      x: o[10][0]
                  },
                  part: "rightKnee",
                  score: 1
              }, {
                  position: {
                      y: o[14][1],
                      x: o[14][0]
                  },
                  part: "leftAnkle",
                  score: 1
              }, {
                  position: {
                      y: o[11][1],
                      x: o[11][0]
                  },
                  part: "rightAnkle",
                  score: 1
              } ]
          };
          this.classifier.drawSinglePose(this.ctx, n);
          var r = n.keypoints;
          a.saveFrameToArray(r);
          var s = [ 5, 6 ], c = a.satisfyConf(r, .2, s), l = (r[15].position.y + r[16].position.y) / 2, d = (r[9].position.y + r[10].position.y) / 2, p = r[0].position.y;
          if (c) if (a.data.gameStart || a.timer) {
              if (!a.data.countDown) {
                  var u = (r[5].position.y + r[6].position.y) / 2, h = (r[13].position.y + r[14].position.y) / 2, m = (r[11].position.y + r[12].position.y) / 2, f = Math.abs(r[11].position.x - r[12].position.x), g = Math.abs(r[5].position.x - r[6].position.x);
                  Math.abs(r[5].position.y - r[6].position.y);
                  a.data.show_tip && a.setData({
                      show_tip: !1
                  }), 0 === a.data.num && a.setData({
                      num: a.data.num + 1,
                      shoulder_elbow_mid_line: Math.abs(r[7].position.y + r[8].position.y + r[5].position.y + r[6].position.y) / 4
                  }), a.notMovingTimer && clearInterval(a.notMovingTimer);
                  var v = (0, e.getJointAngle)(r[7].position, r[5].position, r[9].position), y = (0, 
                  e.getJointAngle)(r[8].position, r[6].position, r[10].position), w = (0, e.getJointAngle)(r[13].position, r[11].position, r[15].position), x = (0, 
                  e.getJointAngle)(r[14].position, r[12].position, r[16].position), T = v > 160 && y > 160, S = w < 90 && x < 90, D = a.matchPoint([ r[7] ], r[13].position.x, r[13].position.y), I = a.matchPoint([ r[8] ], r[14].position.x, r[14].position.y), _ = a.matchPoint([ r[9] ], r[15].position.x, r[15].position.y), M = a.matchPoint([ r[10] ], r[16].position.x, r[16].position.y), C = !(D || I) && !(_ || M) && h > m + 10, b = r[15].score > .2 || r[16].score > .2;
                  if (u < a.data.shoulder_elbow_mid_line - 20 && T && C && f <= .8 * g && b && !S) {
                      if (!a.leftTimer && !a.cantCounter) {
                          var k = function() {
                              a.cantCounter = !0, clearTimeout(a.disappearTimer), a.data.num && a.playMusic("appear"), 
                              a.setData({
                                  num: a.data.num + 1
                              }), a.disappearTimer = setTimeout(function() {
                                  a.cantCounter = !1;
                              }, 1e3);
                          };
                          k(), clearInterval(a.leftTimer), a.leftTimer = setInterval(k, 1e3);
                      }
                  } else a.leftTimer && (clearInterval(a.leftTimer), a.leftTimer = null);
              }
          } else {
              var A = !a.data.gameStart && l > .9 * a.data.videoHeight + 20 * a.data.pixelRatio, P = p > .25 * a.data.videoHeight + 20 * a.data.pixelRatio, E = (r[9].position.y + r[10].position.y - r[6].position.y - r[5].position.y) / 2, H = (r[15].position.y + r[16].position.y - r[11].position.y - r[12].position.y) / 2;
              a.isInBox(s) && !A && P && E > H && d < .95 * a.data.videoHeight && a.setData({
                  countDown: 3,
                  countDownSrc: a.data.countDownSrcAry[2]
              }, function() {
                  i.triggerGameStart();
              });
          } else a.data.gameStart && !a.isInBox(s) && a.setData({
              show_tip: !0
          }), a.data.gameStart && a.isOutScreen(!0);
      } else a.leftTimer && clearInterval(a.leftTimer), a.data.gameStart && (this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight), 
      this.ctx.draw(), a.isOutScreen(!0));
  },
  takePhotoAndUpload: function() {
      var t = this;
      t.context.takePhoto({
          quality: "normal",
          success: function(i) {
              wx.getFileSystemManager().readFile({
                  filePath: i.tempImagePath,
                  encoding: "base64",
                  success: function(i) {
                      var e = "data:image/png;base64," + i.data;
                      t.postImageData(e);
                  },
                  fail: function(t) {
                      console.log("fail", t);
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
                  fileType: "jpg",
                  destWidth: i.data.videoWidth,
                  destHeight: i.data.videoHeight,
                  quality: .3,
                  success: function(t) {
                      wx.getFileSystemManager().readFile({
                          filePath: t.tempFilePath,
                          encoding: "base64",
                          success: function(t) {
                              console.log("data:image/png;base64," + t.data);
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
  executeClassifyApi: function(t) {
      this.takePhotoAndUpload(t);
  },
  executeClassify: function(t) {
      var i = this, a = this;
      if (console.log(123), a.data.time <= 0) return a.uploadScore(), void a.setData({
          gameEnd: !0,
          shoulder_elbow_mid_line: null
      }, function() {
          a.reStartTimer = setInterval(function() {
              a.data.reStartCountDown > 1 ? a.setData({
                  reStartCountDown: a.data.reStartCountDown - 1
              }) : (clearInterval(a.reStartTimer), a.reStart());
          }, 1e3);
      });
      if (!a.data.gameEnd) {
          this.classifier.drawSinglePose(this.ctx, t);
          var o = t[0].keypoints;
          a.saveFrameToArray(o);
          var n = [ 5, 6 ], r = a.satisfyConf(o, .2, n), s = (o[15].position.y + o[16].position.y) / 2, c = (o[9].position.y + o[10].position.y) / 2, l = o[0].position.y;
          if (r) if (a.data.gameStart || a.timer) {
              if (!a.data.countDown) {
                  var d = (o[5].position.y + o[6].position.y) / 2, p = (o[13].position.y + o[14].position.y) / 2, u = (o[11].position.y + o[12].position.y) / 2, h = Math.abs(o[11].position.x - o[12].position.x), m = Math.abs(o[5].position.x - o[6].position.x);
                  Math.abs(o[5].position.y - o[6].position.y);
                  a.data.show_tip && a.setData({
                      show_tip: !1
                  }), 0 === a.data.num && a.setData({
                      num: a.data.num + 1,
                      shoulder_elbow_mid_line: Math.abs(o[7].position.y + o[8].position.y + o[5].position.y + o[6].position.y) / 4
                  }), a.notMovingTimer && clearInterval(a.notMovingTimer);
                  var f = (0, e.getJointAngle)(o[7].position, o[5].position, o[9].position), g = (0, 
                  e.getJointAngle)(o[8].position, o[6].position, o[10].position), v = f > 160 && g > 160, y = a.matchPoint([ o[7] ], o[13].position.x, o[13].position.y), w = a.matchPoint([ o[8] ], o[14].position.x, o[14].position.y), x = a.matchPoint([ o[9] ], o[15].position.x, o[15].position.y), T = a.matchPoint([ o[10] ], o[16].position.x, o[16].position.y), S = !(y || w) && !(x || T) && p > u + 10, D = o[15].score > .2 || o[16].score > .2;
                  if (d < a.data.shoulder_elbow_mid_line - 20 && v && S && !a.isMoving([ 5, 6 ], !0) && h <= .8 * m && D) {
                      if (!a.leftTimer && !a.cantCounter) {
                          var I = function() {
                              a.cantCounter = !0, clearTimeout(a.disappearTimer), a.data.num && a.playMusic("appear"), 
                              a.setData({
                                  num: a.data.num + 1
                              }), a.disappearTimer = setTimeout(function() {
                                  a.cantCounter = !1;
                              }, 1e3);
                          };
                          I(), clearInterval(a.leftTimer), a.leftTimer = setInterval(I, 1e3);
                      }
                  } else a.leftTimer && (clearInterval(a.leftTimer), a.leftTimer = null);
              }
          } else {
              var _ = !a.data.gameStart && s > .9 * a.data.videoHeight + 20 * a.data.pixelRatio, M = l > .25 * a.data.videoHeight + 20 * a.data.pixelRatio, C = (o[9].position.y + o[10].position.y - o[6].position.y - o[5].position.y) / 2, b = (o[15].position.y + o[16].position.y - o[11].position.y - o[12].position.y) / 2;
              a.isInBox(n) && !_ && M && C > b && c < .95 * a.data.videoHeight && a.setData({
                  countDown: 3,
                  countDownSrc: a.data.countDownSrcAry[2]
              }, function() {
                  i.triggerGameStart();
              });
          } else a.data.gameStart && !a.isInBox(n) && a.setData({
              show_tip: !0
          }), a.data.gameStart && a.isOutScreen(!0);
          a.setData({
              predicting: !1
          });
      }
  },
  initClassifier: function() {
      var i = this;
      this.showLoadingToast();
      var e = wx.getSystemInfoSync();
      this.classifier = new t.Classifier("front", {
          width: e.windowWidth,
          height: e.windowHeight
      }), console.log("systemInfo.pixelRatio", e.pixelRatio), this.setData({
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