// run_packege/pages/run_final/index.js
// import QRCode from '../../utils/weapp.qrcode.esm.js'
import api from '../../server/run'
import myFormats from '../../utils/format'
import uploadFile from '../../../../common/uploadFile'
// import Wxml2Canvas from '../../wxml2canvas/index'
import Wxml2Canvas from '../../wxml2canvas/index'
import wxFun from '../../utils/wxFun'
import i18nInstance from 'miniprogram-i18n-plus'

let removeStorage = wxFun.promisify('removeStorage')
let navigateBack = wxFun.promisify('navigateBack')
let showLoading = wxFun.promisify('showLoading')
let hideLoading = wxFun.promisify('hideLoading')
let showToast = wxFun.promisify('showToast')
let navigateTo = wxFun.promisify('navigateTo')

let getStorageSync = wxFun.ordinary('getStorageSync')
let removeStorageSync = wxFun.ordinary('removeStorageSync')
let setStorageSync = wxFun.ordinary('setStorageSync')
let createInnerAudioContext = wxFun.ordinary('createInnerAudioContext')
let createMapContext = wxFun.ordinary('createMapContext')
let createSelectorQuery = wxFun.ordinary('createSelectorQuery')

let innerAudioContext = createInnerAudioContext({ useWebAudioImplement: true })
// innerAudioContext.autoplay = true
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //
    runLog: {},
    speedDetails: [],
    min:'',
    max:'',
    isOverKm:false,
    loading: true,
    runner_id: 0,
    showPosterImage: false,
    posterImgUrl: '',
    shareFlag: false,
    canvasWidth: 0,
    canvasHeight: 0,
    mapHeight: '600rpx',
    isShowPanel: true,
    pointsList: [],
    polylines: [
      {
        points: [], //是一个数组形式的坐标点[{lat,log}]
        color: '#4CDDB4', //线条的颜色
        width: 5, //宽度
        arrowLine: true, //是否带箭头
        borderWidth: 0, //线的边框宽度，还有很多参数，请看文档
      },
    ],
    staticMapInfo: {
      key: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
      width: 500,
      height: 400,
      center: {
        latitude: 39.12,
        longitude: 116.54,
      },
      zoom: 12,
      scale: 2,
    },
    // 静态地图
    staticMapUrl: '',
    // 二维码图片
    qrcodeImg: 'https://ydcommon.51yund.com/wxapp/upimg/geely-in-show.png',
    triangleImg:'https://ssl-pubpic.51yund.com/1325499742.jpg',
    // echarts的图片
    chartImage: '',
    // 要显示的跑步数据
    showRunData: {
      runStartTime: '',
      runKMiles: '0.00',
      avgPace: `00'00''`,
      sumTime: '00:00',
      kCalorie: 0,
      avgSpeed: '0.00',
      stride: 0,
      bestSpeed:`00'00''`,
    },
    // 用户信息
    userInfo: {
      head_url: '',
      run_day_cnt: 0,
      user_id: 0,
      nick: '',
    },
    mapStyle: {
      subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
      // 'subkey':'V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J',
      'layer-style': '1',
    },
    //
    paceCompare: {},
    kmilesPaceCache: [],
    map_orig_url: '',
    map_thumb_url: '',
    isZh: wx.getStorageSync('language') == 'zh',
  },
  handleMap(e) { },
  // 获取echart的图片
  getChartImage(e) {
    let chartImage = e.detail.chartImage
    this.setData({
      chartImage,
    })
  },
  // 调整canvas宽高
  setCanvasSize() {
    let shareBox = createSelectorQuery()
    shareBox
      .select('.share-img-box')
      .boundingClientRect((res) => {
        // myCanvasHeight = res.height
        this.setData({
          canvasHeight: res.height,
          canvasWidth: res.width,
        })
      })
      .exec()
  },
  // =========================================
  drawCanvas: function () {
    showLoading({
      title: this.data.$language['分享图片生成中'],
    })
    const that = this
    const query = createSelectorQuery().in(this)
    query
      .select('#answer-canvas')
      .fields({
        //answer-canvas要绘制的canvas的id
        size: true,
        scrollOffset: true,
      })
      .exec((res) => {
        setTimeout(() => {
          that.draw()
        }, 1500)
      })
  },
  draw() {
    let that = this
    //创建wxml2canvas对象
    let drawImage = new Wxml2Canvas(
      {
        element: 'answerCanvas', // canvas节点的id,
        obj: that, // 在组件中使用时，需要传入当前组件的this
        width: this.data.canvasWidth, // 宽 自定义
        height: this.data.canvasHeight, // 高 自定义
        background: '#ffffff', // 默认背景色 设置背景色
        scrolly: 0,
        scrollx: 0,
        //   fileType:'jpg',
        //   zoom:0.8,
        progress(percent) {
          // 绘制进度
        },
        finish(url) {
          hideLoading()
          that.setData({
            // imgUrl: url,
            posterImgUrl: url,
          })
          that.setStaticMapInfo()
          // 跳转到分享页面
          navigateTo({
            url: `../run_share/index?&runner_id=${that.data.runner_id
              }&dataImg=${encodeURIComponent(url)}&mapImg=${encodeURIComponent(
                that.data.staticMapUrl,
              )}`,
          })
        },
        error(res) {
          console.log(res)
          hideLoading()
          // 画失败的原因
          showToast({
            title: '分享图片失败',
            icon: 'error',
          })
        },
      },
      that,
    )
    let data = {
      //直接获取wxml数据
      list: [
        {
          type: 'wxml',
          //class: '.answer_canvas .answer_draw_canvas',  // answer_canvas这边为要绘制的wxml元素跟元素类名， answer_draw_canvas要绘制的元素的类名（所有要绘制的元素都要添加该类名）
          class: '.answer_canvas .answer_draw_canvas',
          limit: '.answer_canvas', // 这边为要绘制的wxml元素跟元素类名,最外面的元素
          x: 0,
          y: 0,
        },
      ],
    }
    //传入数据，画制canvas图片
    this.setData({
      shareFlag: true,
    })
    this.setData({
      showPosterImage: true,
    })
    this.setCanvasSize()
    drawImage.draw(data, that)
  },
  // 设置静态地图参数
  setStaticMapInfo(w = 500, h = 400) {
    if (!!this.data.staticMapUrl) {
      return
    }
    let base = 'https://apis.map.qq.com/ws/staticmap/v2/'
    let key = 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2'
    let locations = this.data.pointsList
    let pathObj = {
      sty: {
        color: '0x4CDDB400', //线条的颜色
        weight: 5, //宽度
      },
      locations,
    }
    let locStr = ''
    pathObj.locations.forEach((item, index) => {
      if (index < pathObj.locations.length - 1) {
        locStr = locStr + item.latitude + ',' + item.longitude + '|'
      } else {
        locStr = locStr + item.latitude + ',' + item.longitude
      }
    })
    let path = `color:${pathObj.sty.color}|weight:${pathObj.sty.weight}|${locStr}`
    let sizeObj = {
      width: w,
      height: h,
    }
    let size = `${sizeObj.width}*${sizeObj.height}`
    let staticMapUrl = `${base}?size=${size}&scale=2&maptype=roadmap&key=${key}&path=${path}`
    this.setData({
      staticMapUrl,
    })
    this.upMapImg(staticMapUrl)
    console.log(staticMapUrl)
  },
  // 上传静态地图图片
  upMapImg(staticMapUrl) {
    if (!!this.data.thumb_url) {
      return
    }
    // 下载网络图片到本地
    //文件名设置为时间戳
    let fileName = new Date().valueOf()
    let that = this
    wx.downloadFile({
      //下载图片到本地
      url: staticMapUrl,
      // filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.png',
      filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.jpg',
      success(res) {
        if (res.statusCode === 200) {
          // debugger
          let img = res.filePath
          // 上传缩略图图片
          uploadFile.upload({
            source: 'wx_ydenterprise',
            file: img,
            fail(err) {
              //   wx.showToast({
              //     title: '使用图片失败，请重试',
              //     icon: 'none'
              //   })
            },
            success(obj) {
              //   wx.showToast({
              //     title: '上传成功',
              //     icon: 'none'
              //   })
              that.setData({
                map_orig_url: obj.orig_url,
                map_thumb_url: obj.thumb_url,
              })
              if (that.data.map_thumb_url) {
                // 上传运动缩略图
                api.AddTrackPic({
                  runner_id: that.data.runner_id,
                  kind_id: 0,
                  pic_url: that.data.map_thumb_url,
                })
              }
            },
          })
        }
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let points = []
    // 把原始数据存到 runLog 里面
    this.setData({
      runLog: JSON.parse(decodeURIComponent(options.runLog))
    })
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    //获取runid
    if (options.runner_id) {
      this.setData({
        runner_id: options.runner_id,
      })
      // 获取轨迹集合
      api.getRunnerPathData({
        runner_id: options.runner_id,
        // need_health_report:1
      })
        .then(res => {
          let detail = JSON.parse(res.detail)
          for (const key in detail) {
            points.push({
              longitude: detail[key].longitude,
              latitude: detail[key].latitude
            })
          }
          this.setData({
            pointsList: points,
            'polylines[0].points': points
          })
          var mapFinalCtx = createMapContext('run-final-map', this) // mapId对应地图id属性
          mapFinalCtx.includePoints({
            padding: [70, 70, 70, 70], // padding类似我们css中的padding，可以有四个值
            points: this.data.polylines[0].points,
          })
          this.setData({
            loading: false,
          })
        })
    }
    // 展示数据
    if (Object.keys(this.data.runLog).length != 0) {
      this.setData({
        'showRunData.runKMiles': myFormats.clip(parseInt(this.data.runLog.distance) / 1000),
        'showRunData.avgPace': myFormats.formatAvg(this.data.runLog.cost_time, this.data.runLog.distance),
        'showRunData.sumTime': myFormats.secTranlateTime(this.data.runLog.cost_time),
        'showRunData.kCalorie': (55 * 1.036 * (parseInt(this.data.runLog.distance) / 1000)).toFixed(1),
        'showRunData.avgSpeed': (((this.data.runLog.distance / 1000) / (this.data.runLog.cost_time / 360)) * 10).toFixed(1),
        'showRunData.stride': ((this.data.runLog.distance * 100) / (this.data.runLog.u_steps?this.data.runLog.u_steps:1)).toFixed(0)
      })
      //
      if(this.data.showRunData.stride==this.data.runLog.distance * 100){ //步幅异常给默认步幅
        this.setData({
          'showRunData.stride':75
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 加载数据
    try {
      //1.获取每公里配速详情
      api.getRunnerPathData({
        runner_id: this.data.runner_id,
        oper_type: "speed_info",
        now_timestamp: new Date().getTime()
      })
        .then(res => {
        console.log("每公里配速详情");
        console.log(res);
        //处理配速数据
        let obj=myFormats.processSpeedData(JSON.parse( res.speed_detail),this.data.runLog.distance)
        this.setData({
          speedDetails:obj.speedDetails,
          'showRunData.bestSpeed':obj.bestSpeed,
          max:obj.max,
          min:obj.min,
          isOverKm:obj.isOverKm
        })
        })
      // 2.跑步结束页面详情
      api
        .runnerFinishDetail({
          sport_type: 0,
          runner_id: this.data.runner_id,
        })
        .then((res) => {
          if (res.code == 0) {
            this.setData({
              'userInfo.head_url': res.user_info.head_url,
              'userInfo.this_sport_cnt': res.this_sport_cnt,
              'userInfo.nick': res.user_info.nick,
              'userInfo.user_id': getStorageSync('user_id'),
            })
            let last_sport_record = res.last_sport_record
            let last_cost_time = last_sport_record.cost_time
              ? last_sport_record.cost_time
              : 0
            let last_distance = last_sport_record.distance
              ? last_sport_record.distance
              : 0
            let last_pace = parseInt((last_cost_time / last_distance) * 1000)
              ? parseInt((last_cost_time / last_distance) * 1000)
              : 0
            let now_pace = parseInt((this.data.runTime / this.data.runMiles) * 1000)
            let paceCompare = {}
            if (now_pace >= last_pace) {
              paceCompare = {
                nowVal: this.data.showRunData.avgPace,
                flag: 1,
                value: myFormats.formatShowAvg(now_pace - last_pace),
              }
            } else {
              paceCompare = {
                nowVal: this.data.showRunData.avgPace,
                flag: 0,
                value: myFormats.formatShowAvg(last_pace - now_pace),
              }
            }
            this.setData({
              paceCompare,
            })
          }
        })
    } catch (error) { }

    //
    var mapFinalCtx = createMapContext('run-final-map', this) // mapId对应地图id属性
    mapFinalCtx.includePoints({
      padding: [70, 70, 70, 70], // padding类似我们css中的padding，可以有四个值
      points: this.data.polylines[0].points,
    })
    this.setData({
      loading: false,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      shareFlag:false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  async onHide() { },

  /**
   * 生命周期函数--监听页面卸载
   */
  async onUnload() { },
  // 下拉
  // onPageScroll: function(e) {
  //     if (e.scrollTop < 0) {
  //         wx.pageScrollTo({
  //             scrollTop: 0
  //         })
  //     }
  // },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() { },
})
