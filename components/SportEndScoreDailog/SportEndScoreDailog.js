// components/SportEndScoreDailog/SportEndScoreDailog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num: Number,
    costTimeStr: String,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack: function () {
      this.triggerEvent("goBack");
    },
    reStart: function () {
      this.triggerEvent("reStart");
    }
  }
})
