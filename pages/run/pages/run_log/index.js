// plugin/pages/run_log/index.js
import api from '../../server/run'
import myFormats from '../../utils/format'
import i18nInstance from 'miniprogram-i18n-plus'
import utils from '../../../../common/utils'
import { logPath } from '../../../../config/env'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    total_cnt: 0,
    total_cost_time: '0:00:00',
    total_distance: '0.00',
    total_caloric: '0.0',
    begin_cnt: 0,
    end_cnt: 60,
    len: 60,
    runLogList: [],
    rawRunLog:[],
    thumbImgList: [],
    // 节流阀
    canLoadData: true,
    // has_more
    has_more: 1,
    offset: 0,
    defaultImg: 'https://ssl-pubpic.51yund.com/1301346077.png',
    IndoordefaultImg:'https://ssl-pubpic.51yund.com/1325542342.jpg'
  },
  // 用户历史数据
  getUserSportSummary() {
    let params = {
      sport_type: 0,
      time_range: 'all',
    }
    api.userSportSummary(params).then((res) => {
      if (res.code == 0) {
        console.log("用户历史记录");
        console.log(res);
        this.setData({
          total_cnt: res.summary_detail.sport_cnt,
          total_cost_time: myFormats.secTranlateTime(
            res.summary_detail.sum_cost_time,
          ),
          // total_cost_time: res.total_cost_time,
          total_distance: myFormats.clip(
            res.summary_detail.sum_distance / 1000,
          ),
          // total_caloric: (55 * 1.036 * (res.total_distance / 1000)).toFixed(1),
          total_caloric: res.summary_detail.sum_calories,
        })
      }
    })
  },
  // 加载数据
  async loadData() {
    if (!this.data.canLoadData || this.data.has_more == 0) {
      return false
    }
    this.setData({
      canLoadData: false,
    })
    // 获取缩略图接口
    let peakRecordRes = await api.getDayPeakRecord({
      // user_id:47419973,
      // kind_id: 100,
      kind_id: 0,
      offset: this.data.offset,
    })
    if (peakRecordRes.code == 0) {
      console.log("轨迹图");
      console.log(peakRecordRes);
      this.setData({
        has_more: peakRecordRes.has_more,
        offset: this.data.offset + peakRecordRes.runner_extra_infos.length,
      })
      if (this.data.thumbImgList.length == 0) {
        this.setData({
          thumbImgList: peakRecordRes.runner_extra_infos,
        })
      } else if (this.data.thumbImgList.length == 0) {
        this.setData({
          thumbImgList: [
            ...this.data.thumbImgList,
            ...peakRecordRes.runner_extra_infos,
          ],
        })
      }
    }
    //
    let params = {
      // user_id:284209535,
      begin_cnt: this.data.begin_cnt,
      end_cnt: this.data.end_cnt,
      kind_id: 100,
    }
    api.getRunnerInfo(params).then((res) => {
      console.log("用户跑步记录");
      console.log(res);
      if (res.code == 0) {
        let infosLen = res.infos.length
        let newInfos = res.infos
        let rawRunLog=JSON.parse(JSON.stringify(newInfos))
        for (let i = 0; i < newInfos.length; i++) {
          newInfos[i].time = myFormats.formatDate(
            newInfos[i].time,
            'yyyy/MM/dd hh:mm:ss',
          )
          newInfos[i].caloric = (55 * 1.036 * (parseInt(newInfos[i].distance) / 1000)).toFixed(1)
          newInfos[i].distance = myFormats.clip(newInfos[i].distance / 1000)
          newInfos[i].cost_time = myFormats.secTranlateTime(
            newInfos[i].cost_time,
          )
          // avg_pace formatAvg
          newInfos[i].avg_pace = myFormats.formatShowAvg(newInfos[i].avg_pace)
          if (
            this.data.thumbImgList.find(
              (item) => item.runner_id == newInfos[i].runner_id,
            )
            && newInfos[i].kind_id == 0
          ) {
            newInfos[i].pic_url = this.data.thumbImgList.find(
              (item) => item.runner_id == newInfos[i].runner_id,
            ).pic_url
          } else if(newInfos[i].kind_id == 1){ // 如果是室内跑 換成市内跑默認圖片
              newInfos[i].pic_url = this.data.IndoordefaultImg
          }else{
            newInfos[i].pic_url = ''
          }
        }
        this.setData({
          // total_cnt: res.total_cnt,
          // total_cost_time: myFormats.secTranlateTime(res.total_cost_time),
          // // total_cost_time: res.total_cost_time,
          // total_distance: myFormats.clip(res.total_distance/1000),
          // total_caloric: (55 * 1.036 * (res.total_distance / 1000)).toFixed(1),
          begin_cnt: this.data.begin_cnt + infosLen,
          end_cnt: this.data.end_cnt + infosLen,
        })
        if (this.data.runLogList.length == 0) {
          this.setData({
            runLogList: newInfos,
            loading: false,
            rawRunLog
          })
        } else if (this.data.runLogList.length > 0) {
          this.setData({
            runLogList: [...this.data.runLogList, ...newInfos],
            rawRunLog:[...this.data.rawRunLog,...rawRunLog]
          })
        }
        this.setData({
          canLoadData: true,
        })
        // console.log('runLogList',this.data.runLogList)
      }
    })
  },
  /**
   * 图片加载错误触发的事件
   */
  errorFunction(e) {
    console.log(e);
    console.log(this.data.runLogList);
    // debugger
    if (e.type == 'error') {
      var errorImgIndex = e.target.dataset.errorimg //获取错误图片循环的下标
      var runLogList = this.data.runLogList //将图片列表数据绑定到变量
      runLogList[errorImgIndex].pic_url = this.data.defaultImg //错误图片替换为默认图片
      this.setData({
        runLogList: runLogList,
      })
    }
  },
  // 跳转详情页
  gotoDetail:utils.throttle(function(e){
   wx.navigateTo({
     url: `../run_detail/index?runner_id=${
      e.currentTarget.dataset.runnerid
    }&runLog=${encodeURIComponent(JSON.stringify(this.data.rawRunLog[e.currentTarget.dataset.idx]))}`,
   })
  },2000),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    i18nInstance.effect(this)
    this.getUserSportSummary()
    this.loadData()
    // myFormats.formatDate(1646209697,'yyyy/MM/dd hh:mm:ss')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
