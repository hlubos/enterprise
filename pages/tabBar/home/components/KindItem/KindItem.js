// pages/tabBar/home/components/KindItem/KindItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Object,
      value: {}
    }
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
    goSport () {
      let user_id = wx.getStorageSync('user_id')
      let info = this.data.info
      if (user_id) {
        wx.navigateTo({
          url: `${info.path}?video_id=${info.video_id}&video_name=${info.name}`
        })
      }
    }
  }
})
