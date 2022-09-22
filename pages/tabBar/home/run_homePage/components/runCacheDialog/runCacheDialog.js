// run_packege/pages/index/components/runCacheDialog/runCacheDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    giveUpRun() {
      this.triggerEvent('giveUpRun')
    },
    continueRun() {
      this.triggerEvent('continueRun')
    },
  },
})
