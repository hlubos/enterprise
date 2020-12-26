Component({
  data: {
      bgMusic: !0
  },
  attached: function() {
      this.setData({
          bgMusic: getApp().globalData.bgMusic
      });
  },
  methods: {
      play: function() {
          wx.createVideoContext("myVideo", this).play();
      },
      stop: function() {
          wx.createVideoContext("myVideo", this).stop();
      }
  }
});