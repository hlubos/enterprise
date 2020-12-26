// require("../../@babel/runtime/helpers/Arrayincludes");

Component({
  properties: {
      code: String,
      angleRange: String,
      type: String
  },
  trueTime: 0,
  countDownInterVal: null,
  platform: "",
  data: {
      offestTop: 10,
      countDownNum: 3,
      titleText: "调整手机角度",
      beta: 0
  },
  ready: function() {
      this.setData({
          beta: 0,
          offestTop: 10
      });
      var e = this;
      wx.getSystemInfo({
          success: function(t) {
              e.setData({
                  systemInfo: t
              }), "ios" == t.platform ? e.platform = "ios" : "android" == t.platform && (e.platform = "android"), 
              e.deviceLinstener();
          },
          fail: function(e) {
              console.log(e);
          }
      });
  },
  detached: function() {
      console.log("移除"), this.closeListent();
  },
  methods: {
      deviceLinstener: function() {
          var e = this;
          this.trueTime = 0;
          var t = this.properties.angleRange.split("-");
          t[0] = parseFloat(t[0]), t[1] = parseFloat(t[1]);
          t[1], t[0];
          var o = this, n = 0, a = 280 / t[0];
          wx.startAccelerometer({
              interval: "ui",
              success: function(r) {
                  wx.onAccelerometerChange(function(r) {
                      var s = 0;
                      s = (n = 180 + 57.3 * Math.atan2(r.y, r.z)) * a < 0 ? 10 : n * a > 580 ? 560 : n * a, 
                      e.setData({
                          offestTop: s
                      }), n > t[0] && n < t[1] ? e.trueTime++ : e.trueTime = 0, 10 == e.trueTime ? (getApp().globalData.angleSuccess = !0, 
                      e.setData({
                          canCountDown: !0,
                          titleText: "请保持当前手机角度"
                      }), e.countDownInterVal = setInterval(function() {
                          if (o.data.countDownNum > 1) o.setData({
                              countDownNum: o.data.countDownNum - 1
                          }); else {
                              clearInterval(o.countDownInterVal);
                              var e = "";
                              e = "back" == o.properties.type ? "back" : [ "ChuQiu", "ShuZiWangZhe" ].includes(o.properties.code) ? "/pages/games/" + o.properties.code + "/game/game" : "/pages/sports/".concat(o.properties.code, "/").concat(o.properties.code, "?angleRange=").concat(o.properties.angleRange, "&code=").concat(o.properties.code), 
                              o.triggerEvent("angleSuccess", e);
                          }
                      }, 1e3)) : 0 == e.trueTime && (e.setData({
                          canCountDown: !1,
                          countDownNum: 3,
                          titleText: "调整手机角度"
                      }), clearInterval(e.countDownInterVal));
                  });
              },
              fail: function(e) {
                  console.log(e);
              }
          });
      },
      closeListent: function() {
          this.setData({
              beta: 0,
              offestTop: 10
          }), clearInterval(this.countDownInterVal), wx.stopAccelerometer(), wx.offAccelerometerChange();
      }
  }
});