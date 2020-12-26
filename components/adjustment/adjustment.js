//index.js
//获取应用实例
Component({
    data: {
        styleTop: 30,//图标初始值
        countDownInterVal: null,
        canvas: false,
        angleRange: [65, 75],
        trueTime: 0,
        countDownNum: 4,
        isTocanvas: false,
        titleText: "使箭头进入圆圈内",
        bgImage: "https://ssl-pubpic.51yund.com/1040233516.png",
        bgImageTo: "https://ssl-pubpic.51yund.com/1040233944.png"
    },
    created: function () {
        var that = this
        var o = this, n = 0, a = 190 / this.data.angleRange[0];
        wx.startAccelerometer({
            success() {
                //加速数据事件回调函数
                wx.onAccelerometerChange((el) => {
                    console.log(Math.atan2(el.y, el.z));
                    var s = 0;
                    s = (n = 180 + 57.3 * Math.atan2(el.y, el.z)) * a < 0 ? 30 : n * a > 424 ? 380 : n * a,
                        console.log(n, '789');
                    that.setData({
                        styleTop: s
                    })
                    const num = Math.floor(n)
                    if (num < 65) {
                        if (that.data.isTocanvas == true) {
                            clearInterval(that.data.countDownInterVal)
                        }
                        that.setData({
                            titleText: "使箭头进入圆圈内",
                            bgImage: "https://ssl-pubpic.51yund.com/1040233516.png",
                            bgImageTo: "https://ssl-pubpic.51yund.com/1040233944.png",
                            countDownNum: 4,
                            isTocanvas: false,
                            canvas: false
                        })

                    }
                    else if (num >= 65 && num <= 75 && that.data.isTocanvas == false) {
                        that.setData({
                            isTocanvas: true
                        })
                        that.data.countDownInterVal = setInterval(() => {
                            that.setData({
                                titleText: "请保持当前手机角度",
                                bgImage: "https://ssl-pubpic.51yund.com/1040233516.png",
                                bgImageTo: "https://ssl-pubpic.51yund.com/1040536188.png",
                                canvas: true
                            })
                            if (that.data.countDownNum > 1) {
                                that.setData({
                                    countDownNum: that.data.countDownNum - 1
                                })
                            } else {
                                clearInterval(that.data.countDownInterVal)
                            }
                        }, 1e3);

                    } else if (num > 75) {
                        clearInterval(that.data.countDownInterVal)
                        that.setData({
                            titleText: "使箭头进入圆圈内",
                            bgImage: "https://ssl-pubpic.51yund.com/1040534592.png",
                            bgImageTo: "https://ssl-pubpic.51yund.com/1040233944.png",
                            countDownNum: 4,
                            isTocanvas: false,
                            canvas: false
                        })

                    }
                })
            },
            fail(res) {
                console.log('失败');
            }
        })
    },
    methods: {
    },

})
