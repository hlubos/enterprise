// pages/history/history.js
import api from '../../server/history'
import utils from '../../common/utils'
import i18nInstance from 'miniprogram-i18n-plus'

const imgMap = {
  45: 'https://17yd-common.51yund.com/ai_coach/icon_index_tiaoshen%403x.png', // 跳绳
  29: 'https://ssl-pubpic.51yund.com/1010293873.jpg', // 平板支撑
  33: 'https://ssl-pubpic.51yund.com/1010293806.jpg', // 俯卧撑
  1: 'https://ssl-pubpic.51yund.com/1010293895.jpg', // 深蹲
  2: 'https://ssl-pubpic.51yund.com/1010293849.jpg', // 开合跳
  40: 'https://17yd-common.51yund.com/ai_coach/icon_index_yangwoqizuo%403x.png', // 仰卧起坐
  4: 'https://ssl-pubpic.51yund.com/1010294003.jpg', // 左体测
  5: 'https://ssl-pubpic.51yund.com/1010294056.jpg', // 右体测
}

Page({
  data: {
    lastRecordId: 0,
    recordList: [], // 历史列表
    hasMore: true, // 是否还有更多
    isLoading: false,
  },

  onLoad: function (options) {
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    this.getHistory()
  },

  onReachBottom: function () {
    this.getHistory()
  },

  // 获取历史记录
  getHistory() {
    if (!this.data.hasMore || this.data.isLoading) {
      return
    }
    this.data.isLoading = true
    api
      .getUserHistory({
        last_record_id: this.data.lastRecordId,
      })
      .then((res) => {
        if (res.code === 0) {
          let list = this.data.recordList.concat(res.infos)
          let recordList = this.dealList(list)
          this.data.isLoading = false
          this.setData({
            recordList: recordList,
            hasMore: res.has_more,
            lastRecordId: res.last_record_id,
          })
        }
      })
  },

  // 处理列表
  dealList(list) {
    let map = new Map()
    let res = []
    for (let i = 0; i < list.length; i++) {
      let item = this.dealItem(list[i])
      let isGroup = !item.start_ts || false
      let start_ts = item.start_ts ? item.start_ts : item.list[0].start_ts
      let date = this.getDate(start_ts)

      if (map.has(date)) {
        let index = map.get(date)
        res[index].calories += item.calories
        res[index].cost_time += item.cost_time
        if (!isGroup) {
          res[index].list.push(item)
          continue
        }
        res[index].list.unshift(...item.list)
        continue
      }
      map.set(date, res.length)
      if (isGroup) {
        res[res.length] = item
        continue
      }
      res[res.length] = {
        date: this.formateDate(item.start_ts),
        calories: item.calories,
        cost_time: item.cost_time,
        list: [item],
      }
    }
    return res
  },

  dealTime(ts) {
    let min = Math.floor(ts / 60)
    let sec = ts % 60
    return `${utils.addZero(min)}:${utils.addZero(sec)}`
  },

  dealItem(info) {
    let res = JSON.parse(JSON.stringify(info))
    if (res.video_id === 29) {
      res.spend_time = this.dealTime(res.cost_time)
    }
    res.pic_url =
      imgMap[info.video_id] || 'https://ssl-pubpic.51yund.com/1040597365.png'
    res.calories = (info.calories / 1000).toFixed(2) - 0
    return res
  },

  formateDate(ts) {
    let date = new Date(ts * 1000)
    let month = date.getMonth() + 1
    let day = date.getDate()
    let weekDay = date.getDay()
    let weekChinese
    switch (weekDay) {
      case 0:
        weekChinese = '周日'
        break
      case 1:
        weekChinese = '周一'
        break
      case 2:
        weekChinese = '周二'
        break
      case 3:
        weekChinese = '周三'
        break
      case 4:
        weekChinese = '周四'
        break
      case 5:
        weekChinese = '周五'
        break
      case 6:
        weekChinese = '周六'
        break
    }
    return `${month}/${day} ${this.data.$language[weekChinese]}`
  },

  // 返回时间20201226
  getDate(ts) {
    let date = new Date(ts * 1000)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    return `${year}${utils.addZero(month)}${utils.addZero(day)}`
  },
})
