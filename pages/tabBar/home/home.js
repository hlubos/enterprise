// pages/tabBar/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noLogin: true,
    kindList: [{
        kind_id: 19,
        name: '跳绳',
        path: '/pages/AI/TiaoSheng/TiaoSheng',
        pic_url: 'https://17yd-common.51yund.com/ai_coach/icon_index_tiaoshen%403x.png',
        video_id:45,
        cnt: 100
      },
      {
        kind_id: 19,
        name: '平板支撑',
        path: '/pages/AI/ShuangBiZhiCheng/ShuangBiZhiCheng',
        pic_url: 'https://ssl-pubpic.51yund.com/1010293873.jpg',
        video_id:29,
        cnt: 100
      }, {
        kind_id: 19,
        name: '俯卧撑',
        path: '/pages/AI/FuWoCheng/FuWoCheng',
        pic_url: 'https://ssl-pubpic.51yund.com/1010293806.jpg',
        video_id:33,
        cnt: 100
      }, {
        kind_id: 19,
        name: '深蹲',
        path: '/pages/AI/ShenDun/ShenDun',
        pic_url: 'https://ssl-pubpic.51yund.com/1010293895.jpg',
        video_id:1,
        cnt: 100
      }, {
        kind_id: 19,
        name: '开合跳',
        path: '/pages/AI/KaiHeTiao/KaiHeTiao',
        pic_url: 'https://ssl-pubpic.51yund.com/1010293849.jpg',
        video_id:2,
        cnt: 100
      }, {
        kind_id: 19,
        name: '仰卧起坐',
        path: '/pages/AI/YangWoQiZuo/YangWoQiZuo',
        pic_url: 'https://17yd-common.51yund.com/ai_coach/icon_index_yangwoqizuo%403x.png',
        video_id:40,
        cnt: 100
      }, {
        kind_id: 19,
        name: '左体侧运动',
        path: '/pages/AI/TiaoSheng/TiaoSheng',
        pic_url: 'https://ssl-pubpic.51yund.com/1010294003.jpg',
        video_id:4,
        cnt: 100
      }, {
        kind_id: 19,
        name: '右体侧运动',
        path: '/pages/AI/TiaoSheng/TiaoSheng',
        pic_url: 'https://ssl-pubpic.51yund.com/1010294056.jpg',
        video_id:5,
        cnt: 100
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
  },

  initData () {
    let user_id = wx.getStorageSync('user_id')
    if (user_id) {
      this.setData({
        noLogin: false
      })
    }
  },
  gotoRecords(){
    wx.navigateTo({
      url: '/pages/history/history'
    })
  }
})