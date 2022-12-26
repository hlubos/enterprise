Component({
  properties: {
    skinCode: String,
    normalBallShow: Boolean,
    normalTouchPoint: Object,
    specialBallShow: Boolean,
    specialTouchPoint: Object,
  },
  data: {},
  ready: function () {
    this.getSkin()
  },
  methods: {
    getSkin: function () {
      var e = this
      l.getSkin(
        {
          code: this.properties.skinCode,
        },
        function (l) {
          l.result.ballNormalUrl.split(',').length > 0 &&
            (l.result.ballNormalUrl = l.result.ballNormalUrl.split(',')),
            e.setData({
              skin: l.result,
            })
        },
      )
    },
  },
})
