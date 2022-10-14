// run_packege/pages/index/components/runCacheDialog/runCacheDialog.js
import i18nInstance from 'miniprogram-i18n-plus'
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {},

  attached: function (options) {
    i18nInstance.effect(this)
  },

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
