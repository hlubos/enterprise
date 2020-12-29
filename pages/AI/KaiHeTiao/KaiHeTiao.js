var t = require("../../../models/posenet/classifier.js"), a = require("../utils")/*, new i.PageModel()*/;

Page({
    classifier: null,
    ctx: null,
    keypointStack: [],
    audios: ["appear", "tooClose", "start", "timeOut", "comeOn", "5", "4", "3", "2", "1", "keepMoving", "endsoon", "adjustAngle"],
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
        actionAry: [!1],
        countDownSrcAry: ["1", "2", "3"],
        show_in_box: !1,
        stopGame: !1,
        showDevicePage: !0,
        canAdd: !0
    },
    onLoad: function (t) {
        var i = this;
        this.setData({
            angleRange: "90-110",
            code: t.code
        });
        // try {
        //     this.setData({
        //         "userInfo.skinCode": getApp().globalData.userInfo.skinCode
        //     });
        // } catch (t) {
        //     e.getUserInfo({}, function(t) {
        //         i.setData({
        //             "userInfo.skinCode": getApp().globalData.userInfo.skinCode
        //         });
        //     });
        // }
    },
    onReady: function () {
        wx.setKeepScreenOn({
            keepScreenOn: !0
        });
        var t = this;
        setTimeout(function () {
            t.ctx = wx.createCanvasContext("canvas"), t.audioCtx = wx.createInnerAudioContext(),
                t.appearCtx = wx.createInnerAudioContext(), t.downloadAudios(), t.backgroundVideo = t.selectComponent("#backgroundVideo"),
                t.initClassifier(), wx.createCameraContext(t).onCameraFrame(function (i) {
                    t.executeClassify(i);
                }).start();
        }, 1e3);
    },
    setTimeDown: function () {
        var t = this;
        t.timerDown = setInterval(function () {
            t.data.time > 0 ? (21 === t.data.time && t.playMusic("comeOn"), t.setData({
                time: t.data.time - 1
            }), 0 == t.data.time ? t.playMusic("timeOut", !0) : t.data.time <= 5 && t.playMusic(t.data.time, !0)) : clearInterval(t.timerDown);
        }, 1e3);
    },
    angleSuccess: function (t) {
        clearInterval(this.timerDown);
        this.setData({
            stopGame: !1
        }), this.data.gameEnd || this.backgroundVideo && this.backgroundVideo.play(), this.playMusic("keepMoving"),
            this.setTimeDown();
    },
    stopGame: function () {
        this.setData({
            stopGame: !0,
            showDevicePage: !1
        }), this.timerDown && clearInterval(this.timerDown), this.backgroundVideo && this.backgroundVideo.stop(),
            this.notMovingTimer && clearInterval(this.notMovingTimer), this.endTimer && clearInterval(this.endTimer),
            this.playMusic("adjustAngle");
    },
    onShow: function () {
        this.data.stopGame && (this.angleSuccess(), this.setData({
            showDevicePage: !0
        }));
    },
    playMusic: function (t) {
        "appear" === t ? (this.audioSrcs[t + ""] != this.appearCtx.src && (this.appearCtx.src = this.audioSrcs[t + ""]),
            this.appearCtx.play()) : (this.audioCtx.src = this.audioSrcs[t + ""], this.audioCtx.play());
    },
    downloadAudios: function () {
        var t = this;
        t.audios.forEach(function (i) {
            var a = "appear" === i ? "Sport_Ball_appear" : i;
            wx.downloadFile({
                url: "https://go-ran-pic.lovedabai.com/sound/" + a + ".mp3",
                success: function (a) {
                    200 === a.statusCode && (t.audioSrcs[i] = a.tempFilePath);
                }
            });
        });
    },
    clearTimer: function () {
        this.timer && clearInterval(this.timer), this.timerDown && clearInterval(this.timerDown),
            this.reStartTimer && clearInterval(this.reStartTimer), this.startTimer && clearInterval(this.startTimer),
            this.endTimer && clearInterval(this.endTimer), this.endTimer1 && clearInterval(this.endTimer1),
            this.notMovingTimer && clearInterval(this.notMovingTimer), this.setData({
                showDevicePage: !1
            });
    },
    onUnload: function () {
        this.data.gameStart && !this.data.gameEnd && this.uploadScore(), wx.setKeepScreenOn({
            keepScreenOn: !1
        }), this.clearTimer(), this.classifier && this.classifier.isReady() && this.classifier.dispose(),
            this.backgroundVideo && this.backgroundVideo.stop();
    },
    reStart: function () {
        this.clearTimer(), this.timerDown = null, this.timer = null, this.reStartTimer && clearInterval(this.reStartTimer),
            this.setData({
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
                actionAry: [!1],
                show_tip: !0,
                show_in_box: !1,
                stopGame: !1,
                showDevicePage: !1
            });
    },
    goBack: function () {
        wx.navigateBack();
    },
    satisfyConf: function (t, i, a) {
        if (Array.isArray(t) && i && Array.isArray(a)) {
            var e = !0;
            return a.forEach(function (a, n) {
                (!t[a] || t[a].score < i) && (e = !1);
            }), e;
        }
        return !1;
    },
    satisfyFrame: function (t, i) {
        var a = this, e = !0;
        return Array.isArray(i) && Array.isArray(t) && i.forEach(function (i) {
            (!t[i] || t[i].position.x < a.data.left_point_pos - 80 || t[i].position.x > a.data.right_point_pos + 80 || t[i].position.y > .9 * a.data.videoHeight + 40 + 40 || t[i].position.y < .1 * a.data.videoHeight - 40) && (e = !1);
        }), e;
    },
    triggerGameStart: function () {
        var t = this, i = this;
        this.setData({
            show_tip: !1
        });
        var a = 3, e = function () {
            a > 0 ? (t.playMusic(a), a--) : (t.playMusic("start"), clearInterval(i.startTimer),
                i.backgroundVideo && i.backgroundVideo.play());
        };
        e(), clearInterval(i.startTimer), i.startTimer = setInterval(e, 1e3), i.timer = setInterval(function () {
            i.data.countDown > 0 ? i.setData({
                countDown: i.data.countDown - 1,
                countDownSrc: i.data.countDownSrcAry[i.data.countDown - 1 == 2 ? 1 : 0]
            }) : (clearInterval(i.timer), i.setData({
                countDown: "",
                gameStart: !0,
                showDevicePage: !0
            }), i.setTimeDown());
        }, 1e3);
    },
    matchPoint: function (t, i, a) {
        var e = this, n = !0;
        return t.forEach(function (t) {
            (Math.abs(t.position.x - i) > 35 * e.data.widthMulti || Math.abs(t.position.y - a) > 35 * e.data.widthMulti) && (n = !1);
        }), n;
    },
    saveFrameToArray: function (t) {
        this.keypointStack.length > 400 ? this.keypointStack.splice(0, Math.floor(this.keypointStack.length / 2)) : this.keypointStack.push(t);
    },
    isMoving: function (t) {
        var i = this;
        if (0 === this.data.num) return !0;
        var a = 0, e = this.keypointStack.slice(-5);
        return 5 === e.length && (e.forEach(function (n, o) {
            if (0 !== o) {
                var r = !1;
                t.forEach(function (t) {
                    var a = Math.abs(n[t].position.x - e[o - 1][t].position.x), s = Math.abs(n[t].position.y - e[o - 1][t].position.y);
                    (a > s ? a : s) > 7 * i.data.widthMulti && (r = !0);
                }), r && a++;
            }
        }), a >= 3);
    },
    isInBox: function (t) {
        var i = this, a = this.keypointStack.slice(-5);
        if (5 === a.length) {
            var e = 0;
            return a.forEach(function (a) {
                i.satisfyFrame(a, t) && e++;
            }), e >= 3;
        }
        return !1;
    },
    isTooClose: function (t) {
        var i = this;
        t > .95 * this.data.videoHeight && (i.data.justRing || i.data.gameEnd || (i.playMusic("tooClose"),
            i.setData({
                show_in_box: !0
            }, function () {
                return setTimeout(function () {
                    i.setData({
                        show_in_box: !1
                    });
                }, 1e3);
            }), i.setData({
                justRing: !0
            }, function () {
                var t = setTimeout(function () {
                    i.setData({
                        justRing: !1
                    }), clearTimeout(t);
                }, 5e3);
            })));
    },
    triggerGameReStart: function () {
        var t = this;
        t.reStartTimer = setInterval(function () {
            t.data.reStartCountDown > 1 ? t.setData({
                reStartCountDown: t.data.reStartCountDown - 1
            }) : (clearInterval(t.reStartTimer), t.reStart());
        }, 1e3);
    },
    uploadScore: function () {
        var t = this;
        clearInterval(t.timerDown), this.backgroundVideo && this.backgroundVideo.stop(),
            this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight), this.ctx.draw(), t.timerDown = null,
            this.clearTimer(), t.data.num <= 1 ? t.setData({
                rate: 0,
                integral: 0
            }) : (this.setData({
                showDevicePage: !1
            }), e.gameFinish({
                code: "KaiHeTiao",
                score: this.data.num > 0 ? this.data.num - 1 : 0,
                time: 60 - this.data.time
            }, function (i) {
                i.result && t.setData({
                    rate: (100 * i.result.exceedRate).toFixed(2),
                    integral: i.result.integral
                });
            }));
    },
    isOutScreen: function () {
        var t = this, i = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], a = this;
        if (this.data.gameEnd) return console.log("结束啦"), void this.clearTimer();
        var e = [5, 6, 11, 12, 15, 16], n = a.isMoving(e);
        a.data.time != a.data.recordTime && (a.setData({
            recordTime: a.data.time
        }), !n || i ? a.notMovingTimer || (a.notMovingTimer = setInterval(function () {
            a.setData({
                notMovingTimer: a.data.notMovingTimer ? a.data.notMovingTimer + 1 : 1
            }, function () {
                if (3 === a.data.notMovingTimer) t.playMusic("keepMoving"); else if (6 === a.data.notMovingTimer) t.playMusic("keepMoving"); else if (9 === a.data.notMovingTimer && a.data.time > 10) {
                    var i = 5, e = function () {
                        i > 0 ? (i <= 3 ? t.playMusic(i) : 5 === i && t.playMusic("endsoon"), i--) : (t.playMusic("timeOut"),
                            clearInterval(a.endTimer), a.setData({
                                gameEnd: !0
                            }), a.uploadScore(), a.triggerGameReStart());
                    };
                    e(), clearInterval(a.endTimer), a.endTimer = setInterval(e, 1e3);
                }
            });
        }, 1e3)) : (clearInterval(a.notMovingTimer), a.notMovingTimer = null, clearInterval(a.endTimer),
            a.endTimer = null, a.setData({
                notMovingTimer: 0
            })));
    },
    executeClassify: function (t) {
        var i = this, e = this;
        this.classifier && this.classifier.isReady() && !this.data.predicting && this.setData({
            predicting: !0
        }, function () {
            i.classifier.detectSinglePose(t, "multiple").then(function (t) {
                if (e.data.time <= 0) return e.uploadScore(), void e.setData({
                    gameEnd: !0
                }, function () {
                    e.reStartTimer = setInterval(function () {
                        e.data.reStartCountDown > 1 ? e.setData({
                            reStartCountDown: e.data.reStartCountDown - 1
                        }) : (clearInterval(e.reStartTimer), e.reStart());
                    }, 1e3);
                });
                if (!e.data.gameEnd) {
                    var n = t[0].keypoints;
                    e.saveFrameToArray(n);
                    var o = [5, 6, 13, 14, 15, 16], r = (n[15].position.y + n[16].position.y) / 2;
                    if (e.satisfyConf(n, .2, o)) if (e.data.gameStart || e.timer) {
                        if (!e.data.countDown && e.data.gameStart) {
                            e.isOutScreen(), e.data.show_tip && e.setData({
                                show_tip: !1
                            }), e.isTooClose(r), 0 === e.data.num && e.setData({
                                jumpY: (n[15].position.y + n[16].position.y) / 2
                            });
                            var s = n[5].position.y;
                            if (e.data.doClose && !1 === e.data.actionAry[e.data.actionAry.length - 1]) e.matchPoint([n[15], n[16]], e.data.videoWidth / 2, e.data.jumpY) && (n[9].position.y > s || n[10].position.y > s) && e.data.canAdd && (e.data.num && e.playMusic("appear"),
                                e.setData({
                                    num: e.data.num + 1,
                                    doClose: !1,
                                    actionAry: e.data.actionAry.concat(!0),
                                    left_mid: !1,
                                    right_mid: !1,
                                    canAdd: !1
                                }), setTimeout(function () {
                                    e.setData({
                                        canAdd: !0
                                    });
                                }, 300)); else if (!0 === e.data.actionAry[e.data.actionAry.length - 1]) {
                                    var c = e.data.videoWidth / e.data.videoHeight, d = Math.abs(e.data.jumpY - .9 * e.data.videoHeight) * c, u = e.data.left_point_pos + d, h = e.data.jumpY, l = e.data.right_point_pos - d, m = e.data.jumpY, p = n[5].position.y, g = n[15].position.x < n[16].position.x ? n[15] : n[16], f = n[15].position.x > n[16].position.x ? n[15] : n[16];
                                    e.matchPoint([g], u, h) && e.setData({
                                        left_mid: !0,
                                        bot_mid: !1
                                    }, function () {
                                        setTimeout(function () {
                                            e.setData({
                                                left_mid: !1
                                            });
                                        }, 500);
                                    }), e.matchPoint([f], l, m) && e.setData({
                                        right_mid: !0,
                                        bot_mid: !1
                                    }, function () {
                                        setTimeout(function () {
                                            e.setData({
                                                right_mid: !1
                                            });
                                        }, 500);
                                    }), (n[9].position.y < p || n[10].position.y < p) && e.setData({
                                        top_mid: !0,
                                        bot_mid: !1
                                    }, function () {
                                        setTimeout(function () {
                                            e.setData({
                                                top_mid: !1
                                            });
                                        }, 500);
                                    });
                                    var v = e.data, w = v.top_mid, D = v.right_mid, y = v.left_mid;
                                    w && (D || y) && e.setData({
                                        doClose: !0,
                                        actionAry: e.data.actionAry.concat(!1),
                                        top_mid: !1,
                                        right_mid: !1,
                                        left_mid: !1
                                    });
                                }
                        }
                    } else e.isInBox(o) && (0, a.judgeIsStand)(n) && e.setData({
                        countDown: 3,
                        countDownSrc: e.data.countDownSrcAry[2]
                    }, function () {
                        i.triggerGameStart();
                    }); else e.data.gameStart && !e.isInBox(o) && e.setData({
                        show_tip: !0
                    }), e.data.gameStart && e.isOutScreen(!0);
                    e.setData({
                        predicting: !1
                    });
                }
            }).catch(function (t) {
                console.log(t, t.stack), e.setData({
                    predicting: !1
                }), e.data.gameStart && e.isOutScreen(!0);
            });
        });
    },
    initClassifier: function () {
        var i = this;
        this.showLoadingToast();
        var a = wx.getSystemInfoSync();
        this.classifier = new t.Classifier("front", {
            width: a.windowWidth,
            height: a.windowHeight
        });
        var e = a.windowWidth / 2 - .175 * a.windowHeight, n = a.windowWidth - e;
        this.setData({
            videoHeight: a.windowHeight,
            videoWidth: a.windowWidth,
            left_point_pos: e,
            right_point_pos: n,
            pixelRatio: a.pixelRatio / 2,
            jumpY: .9 * a.windowHeight - 40,
            widthMulti: a.windowWidth >= 768 ? a.windowWidth / 375 : 1
        }), this.classifier.load().then(function () {
            i.hideLoadingToast();
        }).catch(function (t) {
            wx.showToast({
                title: "网络连接异常",
                icon: "none"
            });
        });
    },
    showLoadingToast: function () {
        wx.showLoading({
            title: "加载中..."
        });
    },
    hideLoadingToast: function () {
        wx.hideLoading();
    },
    onShareAppMessage: function () {
        return {
            title: "企业悦动"
        };
    }
});