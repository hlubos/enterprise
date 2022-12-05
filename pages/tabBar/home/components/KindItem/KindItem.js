// pages/tabBar/home/components/KindItem/KindItem.js
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
  },

  attached: function (options) {
    i18nInstance.effect(this)
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    goSport() {
      let user_id = wx.getStorageSync('user_id')
      let info = this.data.info
      if (info.video_id <= 0) {
        return wx.showToast({
          title: '敬请期待',
          icon: 'none',
        })
      }
      if (user_id) {
        wx.navigateTo({
          url: `${info.path}?video_id=${info.video_id}&video_name=${info.name}`,
        })
      }
    },
  },
})
