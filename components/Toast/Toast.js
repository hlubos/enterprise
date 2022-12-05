// components/headerToast/headerToast.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 提示的内容
    title: {
      type: String,
      value: '',
    },

    // 【提示】多少毫秒后消失
    delay: {
      type: Number,
      value: 1600,
    },

    // 是否显示提示
    isShow: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        let that = this
        if (newVal) {
          if (this.timer) {
            clearTimeout(this.timer)
          }
          this.timer = setTimeout(function () {
            that.setData({
              isShow: false,
            })
          }, this.data.delay)
        }
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {},
})
