//index.js
//获取应用实例
const bgImg = 'https://ssl-pubpic.51yund.com/1040233944.png',
  bgImgSuc = 'https://ssl-pubpic.51yund.com/1040536188.png',
  arrowDown = 'https://ssl-pubpic.51yund.com/1040233516.png',
  arrowUp = 'https://ssl-pubpic.51yund.com/1040534592.png'

Component({
  properties: {
    angleRange: String,
    sportStart: Boolean,
    sportEnd: Boolean,
  },
  countDownInterVal: null,
  data: {
    styleTop: 30, //图标初始值
    countDownInterVal: null,
    canvas: false,
    trueTime: 0,
    countDownNum: 4,
    isTocanvas: false,
    titleText: '使箭头进入圆圈内',
    bgImage: arrowDown,
    bgImageTo: bgImg,
    angleRangeArr: [],
  },
  attached: function (e) {
    this.setData({
      styleTop: 30,
    })
    this.startListent()
  },
  detached: function () {
    this.removeListent()
  },
  // observers: {
  //     'angleRange, sportStart, sportEnd': function (angleRange, sportStart, sportEnd) {
  //         // 在 numberA 或者 numberB 被设置时，执行这个函数
  //         this.setData({
  //             angleRange: angleRange,
  //             sportStart: sportStart,
  //             sportEnd: sportEnd
  //         })
  //     }
  // },
  methods: {
    formatAngleRange: function (angleRange) {
      let angleRangeArr = angleRange.split('-')
      if (angleRangeArr.length != 2) return
      this.data.angleRangeArr[0] = parseFloat(angleRangeArr[0])
      this.data.angleRangeArr[1] = parseFloat(angleRangeArr[1])
    },
    startListent: function () {
      var that = this
      var o = this,
        n = 0,
        a = 190 / this.data.angleRange[0]

      if (this.properties.angleRange) {
        this.formatAngleRange(this.properties.angleRange)
      }
      var o = 0,
        n = 0

      // var o = this, n = 0, a = 280 / t[0];
      wx.startAccelerometer({
        // interval: "ui",
        success: function (r) {
          //加速数据事件回调函数
          wx.onAccelerometerChange((el) => {
            console.log(Math.atan2(el.y, el.z))
            if (
              that.properties.angleRange &&
              that.data.angleRangeArr.length == 0
            ) {
              that.formatAngleRange(that.properties.angleRange)
            }
            a = 280 / that.data.angleRangeArr[0]
            var s = 0
            // s = (n = 180 + 57.3 * Math.atan2(el.y, el.z)) * a < 0 ? 30 : n * a > 424 ? 380 : n * a,

            s =
              (n = 180 + 57.3 * Math.atan2(el.y, el.z)) * a < 0
                ? 10
                : n * a > 580
                ? 560
                : n * a
            // console.log(n,a, '789');
            that.setData({
              styleTop: s,
            })
            const num = Math.floor(n)
            console.log(num, '999999')
            if (num < 65) {
              if (that.data.isTocanvas == true) {
                clearInterval(that.data.countDownInterVal)
              }
              that.setData({
                titleText: '使箭头进入圆圈内',
                bgImage: arrowDown,
                bgImageTo: bgImg,
                countDownNum: 4,
                isTocanvas: false,
                canvas: false,
              })
            } else if (
              num >= 65 &&
              num <= 75 &&
              that.data.isTocanvas == false
            ) {
              that.setData({
                isTocanvas: true,
              })
              that.data.countDownInterVal = setInterval(() => {
                that.setData({
                  titleText: '请保持当前手机角度',
                  bgImage: arrowDown,
                  bgImageTo: bgImgSuc,
                  canvas: true,
                })
                if (that.data.countDownNum > 1) {
                  that.setData({
                    countDownNum: that.data.countDownNum - 1,
                  })
                } else {
                  clearInterval(that.data.countDownInterVal)
                }
              }, 1e3)
            } else if (num > 75) {
              clearInterval(that.data.countDownInterVal)
              that.setData({
                titleText: '使箭头进入圆圈内',
                bgImage: arrowUp,
                bgImageTo: bgImg,
                countDownNum: 4,
                isTocanvas: false,
                canvas: false,
              })
            }
          })
        },
        fail(res) {
          console.log('失败')
        },
      })
    },
    removeListent: function () {
      this.setData({
        styleTop: 30,
      })
      clearInterval(this.countDownInterVal)
      this.countDownInterVal = null
      wx.stopAccelerometer()
      wx.offAccelerometerChange()
    },
    update: function () {},
  },
})
