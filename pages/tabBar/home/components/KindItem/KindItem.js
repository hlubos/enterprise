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
      console.log(111)
      if (user_id) {
        wx.navigateTo({
          url: `${this.data.info.path}`
        })
      }
    }
  }
})
