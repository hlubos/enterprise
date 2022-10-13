// run_packege/pages/run_final/index.js
// import QRCode from '../../utils/weapp.qrcode.esm.js'
import api from '../../server/run'
import myFormats from '../../utils/format'
import uploadFile from '../../../../common/uploadFile'
// import Wxml2Canvas from '../../wxml2canvas/index'
import Wxml2Canvas from 'wxml2canvas'
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
    loading: true,
    runner_id: 0,
    showPosterImage: false,
    posterImgUrl: '',
    shareFlag: 0,
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
    qrcodeImg: 'https://ssl-pubpic.51yund.com/1224160409.jpg',
    // echarts的图片
    chartImage: '',
    // 跑步开始时间(时间戳)
    runStartTime: 0,
    // 跑步结束时间(时间戳)
    runEndTime: 0,
    // 跑步总距离（米）
    runMiles: 0,
    // 跑步时长（秒）
    runTime: 0,
    // 跑步消耗卡路里（卡）
    calorie: 0,
    // 要显示的跑步数据
    showRunData: {
      runStartTime: '',
      runEndTime: '',
      runKMiles: '0.00',
      avgPace: `00'00''`,
      sumTime: '00:00',
      kCalorie: 0,
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
  handleMap(e) {},
  // 读取跑步设置缓存
  getRunSetCache() {
    try {
      let user_id = getStorageSync('user_id')
      let storageKey = 'run_set_infos_' + user_id
      let res = getStorageSync(storageKey)
      if (res) {
        this.setData({
          mapStyle: res.nowMapStyInfo,
        })
      }
    } catch (e) {}
  },
  // 打开/关闭面板
  switchPanel() {
    if (this.data.isShowPanel) {
      this.setData({
        isShowPanel: false,
        mapHeight: '100vh',
      })
      // let mapBox = wx.createSelectorQuery()
      // mapBox.select('.fina-map-box').boundingClientRect(res => {
      //     this.setStaticMapInfo(res.width,res.height)
      // }).exec()
    } else {
      this.setData({
        isShowPanel: true,
        mapHeight: '600rpx',
      })
      // let mapBox = wx.createSelectorQuery()
      // mapBox.select('.fina-map-box').boundingClientRect(res => {
      //     this.setStaticMapInfo(res.width,res.height)
      // }).exec()
    }
    setTimeout(() => {
      let mapFinalCtx = createMapContext('run-final-map', this) // mapId对应地图id属性
      mapFinalCtx.includePoints({
        padding: [70, 70, 70, 70], // padding类似我们css中的padding，可以有四个值
        points: this.data.pointsList,
      })
    }, 500)
  },
  // 结束跑步
  async runFinish() {
    try {
      let user_id = getStorageSync('user_id')
      let storageKey = 'run_data_' + user_id
      let key = 'run_kmiles_pace_arr_' + user_id
      // 清除运动数据缓存
      // await removeStorage(storageKey)
      // await removeStorage(key)
      setStorageSync(storageKey, {})
      setStorageSync(key, [])
      // removeStorageSync(storageKey)
      // removeStorageSync(key)
    } catch (error) {}
    navigateBack()
  },
  playFinalVoice(src) {
    innerAudioContext.src = src
    innerAudioContext.play()
  },
  // 跑步结束语音播报
  runFinishAudio() {
    //
    let auidos = this.audioDidy()
    let index = 0
    // innerAudioContext.src = `https://ydcommon.51yund.com/mini_run_voice/voice_1/${auidos[index]}.mp3`
    this.playFinalVoice(
      `https://ydcommon.51yund.com/mini_run_voice/voice_1/${auidos[index]}.mp3`,
    )
    // 监听音频自然结束
    innerAudioContext.onEnded(() => {
      index++
      // innerAudioContext.src = `https://ydcommon.51yund.com/mini_run_voice/voice_1/${auidos[index]}.mp3`
      this.playFinalVoice(
        `https://ydcommon.51yund.com/mini_run_voice/voice_1/${auidos[index]}.mp3`,
      )
      if (index >= auidos.length - 1) {
        innerAudioContext.offEnded()
      }
    })
  },
  // 语音播报内容整理
  audioDidy() {
    // 总里程 xx点xx公里 总用时 xx小时xx分xx秒 平均配速 xx分xx秒 每公里
    let allAudio = ['paobujieshu']
    let { runKMiles, avgPace, sumTime } = this.data.showRunData
    // 总里程语音播报数组=======================start============================
    let runKMilesAudioList = []
    runKMilesAudioList.push('zonglicheng')
    let runKMilesArr = String(runKMiles).split('.')
    // 小数点前面的
    // 分成0,被10整除,和不被10整除
    if (Number(runKMilesArr[0]) == 0) {
      runKMilesAudioList = [...runKMilesAudioList, 0]
    } else if (
      Number(runKMilesArr[0]) % 10 == 0 &&
      Number(runKMilesArr[0]) > 0
    ) {
      // 分成等于10和大于10
      if (Number(runKMilesArr[0]) == 10) {
        runKMilesAudioList = [...runKMilesAudioList, 10]
      } else if (Number(runKMilesArr[0]) > 10) {
        let firstNum = Number(runKMilesArr[0]) / 10
        runKMilesAudioList = [...runKMilesAudioList, ...[firstNum, 10]]
      }
    } else if (Number(runKMilesArr[0]) % 10 > 0) {
      // 分成大于20、小于20大于10、小于10
      if (Number(runKMilesArr[0]) < 10) {
        runKMilesAudioList = [...runKMilesAudioList, Number(runKMilesArr[0])]
      } else if (Number(runKMilesArr[0]) > 10 && Number(runKMilesArr[0]) < 20) {
        let lastNum = Number(runKMilesArr[0]) % 10
        runKMilesAudioList = [...runKMilesAudioList, ...[10, lastNum]]
      } else if (Number(runKMilesArr[0]) > 20) {
        let firstNum = Number(runKMilesArr[0]) / 10
        let lastNum = Number(runKMilesArr[0]) % 10
        runKMilesAudioList = [...runKMilesAudioList, ...[firstNum, 10, lastNum]]
      }
    }
    // 小数点后面的
    if (Number(runKMilesArr[1]) > 0 && Number(runKMilesArr[1])) {
      runKMilesAudioList = [...runKMilesAudioList, 'dian']
      let newArr = String(runKMilesArr[1]).split('')
      for (let i = 0; i < newArr.length; i++) {
        runKMilesAudioList.push(newArr[i])
      }
    }
    runKMilesAudioList.push('gongli')
    // 总里程语音播报数组=====================end==============================
    // 总用时================================start=================================
    let sumTimeAudioList = []
    sumTimeAudioList.push('zongyongshi')
    let sumTimeArr = sumTime.split(':')
    sumTimeArr.forEach((item, index) => {
      // 数字
      // 分为0,被10整除,和不被10整除
      if (Number(item) == 0) {
        sumTimeAudioList = [...sumTimeAudioList, 0]
      } else if (Number(item) % 10 == 0 && Number(item) > 0) {
        if (Number(item) > 10) {
          let firstNum = Number(item) / 10
          sumTimeAudioList = [...sumTimeAudioList, ...[firstNum, 10]]
        } else if (Number(item) == 10) {
          sumTimeAudioList = [...sumTimeAudioList, ...[10]]
        }
      } else if (Number(item) % 10 > 0) {
        // 分成大于20、小于20大于10、小于10
        if (Number(Number(item) < 10)) {
          sumTimeAudioList = [...sumTimeAudioList, Number(item)]
        } else if (Number(item) > 10 && Number(item) < 20) {
          let lastNum = Number(item) % 10
          sumTimeAudioList = [...sumTimeAudioList, ...[10, lastNum]]
        } else if (Number(item) > 20) {
          let firstNum = Number(item) / 10
          let lastNum = Number(item) % 10
          sumTimeAudioList = [...sumTimeAudioList, ...[firstNum, 10, lastNum]]
        }
      }
      // 单位
      if (sumTimeArr.length == 3) {
        if (index == 0) {
          sumTimeAudioList.push('xiaoshi')
        } else if (index == 1) {
          sumTimeAudioList.push('fen')
        } else if (index == 2) {
          sumTimeAudioList.push('miao')
        }
      } else if (sumTimeArr.length == 2) {
        if (index == 0) {
          sumTimeAudioList.push('fen')
        } else if (index == 1) {
          sumTimeAudioList.push('miao')
        }
      }
    })
    // 总用时================================end====================
    // 平均配速==============================start=================
    let avgPaceAudioList = []
    avgPaceAudioList.push('pingjunpeisu')
    // 清除数组空元素
    let avgPaceArr = avgPace.split("'").filter(function (s) {
      return s && s.trim()
    })
    avgPaceArr.forEach((item, index) => {
      // 数字
      // 分为0,被10整除,和不被10整除
      if (Number(item) == 0) {
        avgPaceAudioList = [...avgPaceAudioList, 0]
      } else if (Number(item) % 10 == 0 && Number(item) > 0) {
        if (Number(item) > 10) {
          let firstNum = Number(item) / 10
          avgPaceAudioList = [...avgPaceAudioList, ...[firstNum, 10]]
        } else if (Number(item) == 10) {
          avgPaceAudioList = [...avgPaceAudioList, ...[10]]
        }
      } else if (Number(item) % 10 > 0) {
        // 分成大于20、小于20大于10、小于10
        if (Number(item) < 10) {
          avgPaceAudioList = [...avgPaceAudioList, item]
        } else if (Number(item) > 10 && Number(item) < 20) {
          let lastNum = Number(item) % 10
          avgPaceAudioList = [...avgPaceAudioList, ...[10, lastNum]]
        } else if (Number(item) > 20) {
          let firstNum = parseInt(Number(item) / 10)
          let lastNum = Number(item) % 10
          avgPaceAudioList = [...avgPaceAudioList, ...[firstNum, 10, lastNum]]
        }
      }
      // 单位
      if (index == 0) {
        avgPaceAudioList.push('fen')
      } else if (index == 1) {
        avgPaceAudioList.push('miao')
      }
    })
    avgPaceAudioList.push('meigongli')
    // 平均配速==============================end=================
    // 合并所有
    // allAudio = [...allAudio,...runKMilesAudioList,...sumTimeAudioList,...avgPaceAudioList]
    allAudio = [...allAudio, ...runKMilesAudioList]
    return allAudio
  },
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
            url: `../run_share/index?&runner_id=${
              that.data.runner_id
            }&dataImg=${encodeURIComponent(url)}&mapImg=${encodeURIComponent(
              that.data.staticMapUrl,
            )}`,
          })
        },
        error(res) {
          // console.log(res);
          hideLoading()
          // 画失败的原因
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
      shareFlag: 1,
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
    // staticMapUrl:'https://apis.map.qq.com/ws/staticmap/v2/?key=L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2&scale=2&size=500x400&center=39.12,116.54&zoom=12',
    let user_id = getStorageSync('user_id')
    let storageKey = 'run_data_' + user_id
    let data = getStorageSync(storageKey)
    let base = 'https://apis.map.qq.com/ws/staticmap/v2/'
    let key = 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2'

    let locations = []
    data.locaDotArr.forEach((item) => {
      if (item.length > 0) {
        locations = [...locations, ...item]
      }
    })
    let pathObj = {
      sty: {
        color: '0x4CDDB400', //线条的颜色
        weight: 5, //宽度
      },
      locations: locations,
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
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    //
    if (options.runner_id) {
      this.setData({
        runner_id: options.runner_id,
      })
    }
    // this.setCanvasSize()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 读取缓存
    try {
      let user_id = getStorageSync('user_id')
      let storageKey1 = 'run_data_' + user_id
      let storageKey2 = 'run_kmiles_pace_arr_' + user_id
      let data = getStorageSync(storageKey1)
      let kmilesPaceCache = getStorageSync(storageKey2)
      let points = []
      data.locaDotArr.forEach((item) => {
        // points.push(item)
        points = [...points, ...item]
      })
      this.setData({
        pointsList: points,
        'polylines[0].points': points,
        'showRunData.runStartTime': myFormats.formatDate(
          data.runStartTime,
          'yyyy-MM-dd hh:mm:ss',
        ),
        'showRunData.runEndTime': myFormats.formatDate(
          data.runEndTime,
          'yyyy-MM-dd hh:mm:ss',
        ),
        'showRunData.runKMiles': myFormats.clip(parseInt(data.runMiles) / 1000),
        'showRunData.avgPace': myFormats.formatAvg(data.runTime, data.runMiles),
        'showRunData.sumTime': myFormats.secTranlateTime(data.runTime),
        'showRunData.kCalorie': (55 * 1.036 * (data.runMiles / 1000)).toFixed(
          1,
        ),
      })
      // 设置静态地图
      this.setStaticMapInfo()

      // 跑步结束页面详情
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
            let now_pace = parseInt((data.runTime / data.runMiles) * 1000)
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
              kmilesPaceCache,
              paceCompare,
            })
          }
          // 清除缓存
          setStorageSync(storageKey1, {})
          setStorageSync(storageKey2, [])
        })
    } catch (error) {}

    //
    var mapFinalCtx = createMapContext('run-final-map', this) // mapId对应地图id属性
    mapFinalCtx.includePoints({
      padding: [70, 70, 70, 70], // padding类似我们css中的padding，可以有四个值
      points: this.data.pointsList,
    })
    this.setData({
      loading: false,
    })
    // 语音播报
    this.runFinishAudio()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    innerAudioContext = createInnerAudioContext({ useWebAudioImplement: true })
    // innerAudioContext.autoplay = true
    this.getRunSetCache()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  async onHide() {
    // 语音播报停止
    innerAudioContext.stop()
    innerAudioContext.destroy()
    // 清除所有跑步数据缓存
    let userId = getStorageSync('user_id')
    let storageKey1 = 'run_data_' + userId
    let storageKey2 = 'run_kmiles_pace_arr_' + userId
    setStorageSync(storageKey1, {})
    setStorageSync(storageKey2, [])
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  async onUnload() {
    // 语音播报停止
    innerAudioContext.stop()
    innerAudioContext.destroy()
    // 清除所有跑步数据缓存
    let userId = getStorageSync('user_id')
    let storageKey1 = 'run_data_' + userId
    let storageKey2 = 'run_kmiles_pace_arr_' + userId
    setStorageSync(storageKey1, {})
    setStorageSync(storageKey2, [])
    // 销毁音频实例
    // innerAudioContext.destroy()
  },
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
