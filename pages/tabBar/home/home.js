// pages/tabBar/home/home.js
import api from '../../../server/home'

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
      video_id: 45,
      cnt: 0
    },
    {
      kind_id: 15,
      name: '俯卧撑',
      path: '/pages/AI/FuWoCheng/FuWoCheng',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293806.jpg',
      video_id: 33,
      cnt: 0
    },
    {
      kind_id: 22,
      name: '深蹲',
      path: '/pages/AI/ShenDun/ShenDun',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293895.jpg',
      video_id: 1,
      cnt: 0
    },
    {
      kind_id: 17,
      name: '仰卧起坐',
      path: '/pages/AI/YangWoQiZuo/YangWoQiZuo',
      pic_url: 'https://17yd-common.51yund.com/ai_coach/icon_index_yangwoqizuo%403x.png',
      video_id: 40,
      cnt: 0
    },
    {
      kind_id: 16,
      name: '开合跳',
      path: '/pages/AI/KaiHeTiao/KaiHeTiao',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293849.jpg',
      video_id: 2,
      cnt: 0
    },
    {
      kind_id: -1,
      name: '敬请期待',
      path: '',
      pic_url: 'https://ssl-pubpic.51yund.com/1040424039.png',
      video_id: -1,
      cnt: 0
    },
    ],
    kindListMode: [{
      kind_id: 19,
      name: '跳绳',
      path: '/pages/AI/TiaoSheng/TiaoSheng',
      pic_url: 'https://17yd-common.51yund.com/ai_coach/icon_index_tiaoshen%403x.png',
      video_id: 45,
      cnt: 0
    },
    {
      kind_id: 19,
      name: '平板支撑',
      path: '/pages/AI/ShuangBiZhiCheng/ShuangBiZhiCheng',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293873.jpg',
      video_id: 29,
      cnt: 0
    }, {
      kind_id: 19,
      name: '俯卧撑',
      path: '/pages/AI/FuWoCheng/FuWoCheng',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293806.jpg',
      video_id: 33,
      cnt: 0
    }, {
      kind_id: 19,
      name: '深蹲',
      path: '/pages/AI/ShenDun/ShenDun',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293895.jpg',
      video_id: 1,
      cnt: 0
    }, {
      kind_id: 19,
      name: '开合跳',
      path: '/pages/AI/KaiHeTiao/KaiHeTiao',
      pic_url: 'https://ssl-pubpic.51yund.com/1010293849.jpg',
      video_id: 2,
      cnt: 0
    }, {
      kind_id: 19,
      name: '仰卧起坐',
      path: '/pages/AI/YangWoQiZuo/YangWoQiZuo',
      pic_url: 'https://17yd-common.51yund.com/ai_coach/icon_index_yangwoqizuo%403x.png',
      video_id: 40,
      cnt: 0
    }, {
      kind_id: 19,
      name: '左体侧运动',
      path: '/pages/AI/TiaoSheng/TiaoSheng',
      pic_url: 'https://ssl-pubpic.51yund.com/1010294003.jpg',
      video_id: 4,
      cnt: 0
    }, {
      kind_id: 19,
      name: '右体侧运动',
      path: '/pages/AI/TiaoSheng/TiaoSheng',
      pic_url: 'https://ssl-pubpic.51yund.com/1010294056.jpg',
      video_id: 5,
      cnt: 0
    }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
  },

  onShareAppMessage: function (options) {
    return {
      title: "关爱员工健康，提高团队活力，快来加入企业悦动！",
      path: '/pages/tabBar/home/home',
      imageUrl: 'https://ssl-pubpic.51yund.com/997613364.jpg'
    }
  },

  initData () {
    this.updateKindList()
    let user_id = wx.getStorageSync('user_id')
    if (user_id) {
      this.setData({
        noLogin: false
      })
    }
  },
  gotoRecords () {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },
  updateKindList () {
    api.getAISportActionList().then(res => {
      let actionInfos = res.data.action_infos
      this.formatKindList(actionInfos)
    })
  },
  formatKindList (actionInfos) {
    for (let i = 0; i < this.data.kindList.length; i++) {
      const item = this.data.kindList[i];
      let actions = actionInfos.filter(el => el.video_id == item['video_id'])
      if (actions.length == 0) continue
      this.data.kindList[i]['cnt'] = actions[0]['join_cnt']
    }
    this.setData({
      kindList: this.data.kindList
    })
  }
})