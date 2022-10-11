// pages/history/components/RecordItem/RecordItem.js
import i18nInstance from 'miniprogram-i18n-plus'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Object,
      value: {},
    },

    // 是否是最后一个
    isLast: {
      type: Boolean,
      value: false,
    },
  },

  attached: function () {
    i18nInstance.effect(this)
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
