// components/SuspensionHome/SuspensionHome.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    img: 'https://ssl-pubpic.51yund.com/1042507673.png',
    appID: 'wxa04d36164f2f64c9',
    path: 'pages/tabBar/home/home',
  },

  onLoad () {
    this.setData({
      img: this.data.img
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    open () {
      wx.navigateToMiniProgram({
        appId: this.data.appID,
        path: this.data.path,
        extraData: {
          from: 'work'
        },
        // envVersion: 'develop',
        success (res) {
          // 打开成功
        }
      })
    }
  }
})
