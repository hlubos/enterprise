// plugin/pages/run_page/index.js
import douglasPeuker from '../../utils/Douglas_Peuker'
import myFormats from '../../utils/format'
import api from '../../server/run'
import wxFun from '../../utils/wxFun'
import i18nInstance from 'miniprogram-i18n-plus'
let getLocation = wxFun.promisify('getLocation')
let redirectTo = wxFun.promisify('redirectTo')
let navigateBack = wxFun.promisify('navigateBack')
let switchTab = wxFun.promisify('switchTab')
let stopLocationUpdate = wxFun.promisify('stopLocationUpdate')
let startLocationUpdateBackground = wxFun.promisify(
  'startLocationUpdateBackground',
)
let setStorage = wxFun.promisify('setStorage')
let removeStorage = wxFun.promisify('removeStorage')
let showModal = wxFun.promisify('showModal')
let hideLoading = wxFun.promisify('hideLoading')
let startAccelerometer = wxFun.promisify('startAccelerometer')
let stopAccelerometer = wxFun.promisify('stopAccelerometer')

let onLocationChange = wxFun.ordinary('onLocationChange')
let offLocationChange = wxFun.ordinary('offLocationChange')
let createInnerAudioContext = wxFun.ordinary('createInnerAudioContext')
let setStorageSync = wxFun.ordinary('setStorageSync')
let getStorageSync = wxFun.ordinary('getStorageSync')
let removeStorageSync = wxFun.ordinary('removeStorageSync')
let onAccelerometerChange = wxFun.ordinary('onAccelerometerChange')
let offAccelerometerChange = wxFun.ordinary('offAccelerometerChange')
let getBackgroundAudioManager = wxFun.ordinary('getBackgroundAudioManager')
let nextTick = wxFun.ordinary('nextTick')

// const backgroundAudioManager = wx.getBackgroundAudioManager()
// let innerAudioContext = createInnerAudioContext({useWebAudioImplement:true})
// innerAudioContext.autoplay = true
let innerAudioContext
let backgroundAudioManager = getBackgroundAudioManager()
backgroundAudioManager.title = '跑步'
let runGuideCountTimer
Page({
  data: {
    setInfo: {
      // 是否语音播报
      openVoice: true,
      // 播报类型(暂时只有一种)
      voiceIndex: 0,
      // 语音播报频率
      freIndex: [0, 0],
      // 地图样式
      mapStyle: {
        subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
        // 'subkey':'V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J',
        'layer-style': '1',
      },
    },
    // 引导页显示
    guidePageShow: false,
    // 跑步倒计时
    runGuideCount: 3,
    // 跑步倒计时计时器
    runGuideCountTimer: null,
    // 当前跑步状态 0.running正在跑步 1.pause暂停 2.stop结束跑步
    runStatus: 0,
    // 是否显示地图
    mapPanelShow: false,
    // 是否显示结束按钮
    stopBtnShow: true,
    // 当前位置
    mapCenterLocation: {
      longitude: 0,
      latitude: 0,
    },
    // 跑步类型 类型id(0:室外跑; 1:室内跑; 2:自动记步; 3: 骑行)
    kind_id: 0,
    // 跑步开始时间(时间戳)
    runStartTime: 0,
    // 跑步结束时间(时间戳)
    runEndTime: 0,
    // 跑步持续时间(秒)
    runTime: 0,
    // 跑步距离(米m)
    runMiles: 0,
    // 消耗卡路里
    calorie: 0,
    // 跑步计时器
    runTimer: null,
    // 位置获取计时器
    locaTimer: null,
    // 跑步时的初始步数
    initialStep:0,
    // 总步数
    steps:1,
    // 跑步显示的数据
    runShowData: {
      // 公里数
      runKmiles: '0.00',
      // 总计时间
      sumTime: '0:00:00',
      // 平均配速
      avePace: `0'00''`,
      // 消耗千卡
      kiloCalorie: '0.0',
      // 步幅
      stride:0
    },
    // 位置点保存数组
    locaDotArr: [],
    // 是否能够获取位置（5s获取一次）
    canGetLocation: false,
    // 超出一公里的距离
    outMiles: 0,
    // 超出一公里的时间
    outTime: 0,
    // 当前是第几公里
    kmilesCount: 1,
    // 播报：
    reportData: {
      // 时间频率（秒）
      audiotime: 600,
      // 距离频率（米）
      audioDistance: 500,
      // 下次播报的时间（秒）
      nextTime: 600,
      // 下次播报的距离（米）
      nextDistance: 500,
    },
    //
    accFlag: false,
    //
    x: 0,
    y: 0,
  },
  // 语音播报
  runAudioReport() {
    if (this.data.setInfo.openVoice == true) {
      let auidos = []
      // 播报频率 ['按距离播报', '按时间播报'] ['10分钟', '20分钟', '30分钟', '40分钟'] ['0.5公里', '1公里', '2公里', '3公里']
      if (this.data.setInfo.freIndex[0] == 0) {
        // 按距离播报
        if (this.data.runMiles >= this.data.reportData.nextDistance) {
          auidos.push('ninyijingpaole')
          let kMiles = this.data.reportData.nextDistance / 1000
          if (kMiles % 1 != 0) {
            let karr = String(kMiles).split('.')
            auidos = [...auidos, ...[karr[0], 'dian', karr[1]]]
          } else {
            auidos = [...auidos, ...[kMiles]]
          }
          auidos.push('gongli')
          this.setData({
            'reportData.nextDistance':
              this.data.reportData.nextDistance +
              this.data.reportData.audioDistance,
          })
        }
      } else if (this.data.setInfo.freIndex[0] == 1) {
        // 按时间播报
        if (this.data.runTime >= this.data.reportData.nextTime) {
          auidos.push('ninyijingpaole')
          let h = parseInt(this.data.reportData.nextTime / 3600)
          let m = this.data.reportData.nextTime / 60 - h * 60
          let timeArr = [h, m]
          timeArr.forEach((item, index) => {
            if (item % 10 == 0) {
              if (item == 0) {
                auidos = [...auidos, ...[0]]
              } else if (item == 10) {
                auidos = [...auidos, ...[10]]
              } else if (item > 10) {
                let f = item / 10
                auidos = [...auidos, ...[f, 10]]
              }
            } else if (item % 10 != 0) {
              if (item < 10) {
                auidos = [...auidos, ...[item]]
              } else if (item > 10 && item < 20) {
                let l = item % 10
                auidos = [...auidos, ...[10, l]]
              } else if (item > 20) {
                let f = parseInt(item / 10)
                let l = item % 10
                auidos = [...auidos, ...[f, 10, l]]
              }
            }
            if (index == 0) {
              auidos.push('xiaoshi')
            } else if (index == 1) {
              auidos.push('fenzhong')
            }
          })
          this.setData({
            'reportData.nextTime':
              this.data.reportData.nextTime + this.data.reportData.audiotime,
          })
          // 播放语音
        }
      }
      let play = createInnerAudioContext({ useWebAudioImplement: true })
      let index = 0
      play.src = `https://ydcommon.51yund.com/mini_run_voice/voice_1/${auidos[index]}.mp3`
      play.onCanplay(() => {
        play.play()
      })
      play.onEnded(() => {
        index++
        if (index == auidos.length) {
          play.stop()
          play.destroy()
        }
        play.src = `https://ydcommon.51yund.com/mini_run_voice/voice_1/${auidos[index]}.mp3`
      })
    }
  },
  // 获取跑步数据可视化信息
  getRunShowData() {
    // 跑步公里数
    let points = this.data.locaDotArr
    let runMiles = 0
    if (points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        if (points[i].length > 0) {
          runMiles += this._calculateRunMiles(points[i])
        }
      }
    } else {
      runMiles = 0
    }
    let runKmiles = myFormats.clip(runMiles / 1000)
    if (runMiles == 0) {
      runKmiles == '0.00'
    }
    this.setData({
      runMiles: runMiles,
    })
    // 每公里缓存一次配速(秒/公里)
    let cut = parseInt(runMiles / 1000) + 1
    let outMiles = runMiles % 1000
    if (cut > this.data.kmilesCount) {
      this.setKmilesCache()
      this.setData({
        kmilesCount: this.data.kmilesCount + 1,
        outTime: 0,
      })
    }
    // 跑步时长
    let sumTime = myFormats.secTranlateTime(this.data.runTime)
    // 步幅
    let stride =((this.data.runMiles*100)/this.data.steps).toFixed(0)
    // 平均配速
    let avePace = myFormats.formatAvg(this.data.runTime, runMiles)
    // 消耗千卡
    let kiloCalorie = (55 * 1.036 * (runMiles / 1000)).toFixed(1)
    // 消耗卡路里
    let calorie = 55 * 1.036 * runMiles
    this.setData({
      'runShowData.runKmiles': runKmiles,
      'runShowData.sumTime': sumTime,
      'runShowData.avePace': avePace,
      'runShowData.kiloCalorie': kiloCalorie,
      calorie: calorie,
      outMiles: outMiles,
      stride:stride,
    })
    // 语音播报
    this.runAudioReport()
  },
  // 计算总距离（米m）
  _calculateRunMiles(pointArr) {
    let sumRunMiles = 0
    for (let i = 0; i < pointArr.length - 1; i++) {
      sumRunMiles += myFormats.calcDistance(
        pointArr[i].longitude,
        pointArr[i].latitude,
        pointArr[i + 1].longitude,
        pointArr[i + 1].latitude,
      )
    }
    return sumRunMiles
  },
  // 显示地图
  showMap() {
    this.setData({
      mapPanelShow: true,
      stopBtnShow: false,
    })
  },
  // 隐藏地图
  hideMap() {
    this.setData({
      mapPanelShow: false,
    })
  },
  hideMapA() {
    this.setData({
      stopBtnShow: true,
      mapPanelShow: false,
    })
  },
  // 设置当前步数
  setNowStep(flag=true){
    return new Promise((resolve)=>{
      wx.getWeRunData({
        success:async (res)=>{
          // 拿 encryptedData 到开发者后台解密开放数据
          let parms = {
            open_id: wx.getStorageSync('openid'),
            wxapp_source: 'wx_ydenterprise',
            encryptedData: res.encryptedData,
            iv: res.iv,
          }
          let data = await api.getUserDayStep(parms)
          if (data.code == 0) {
            if(flag){//如果为初始化步数
              this.setData({
                steps:0,
                initialStep:data.steps
              })
              resolve()
            }else{//如果为结束 或 暂停
              this.setData({
                steps:data.steps-this.data.initialStep+this.data.steps,
                initialStep:data.steps
              })
              resolve()
            }
          }
        }
      })
  })
  },
  // 开始跑步
  async runStart() {
    // 开始计时
    let second = this.data.runTime
    // let canGetLocation = true
    this.setData({
      runStatus: 0,
      canGetLocation: true,
    })
    // 初始化当前步数
    console.log("555");
    await this.setNowStep()
    console.log("开始");
    console.log(this.data.steps);
    console.log(this.data.initialStep)
    // 跑步计时
    var runTimer = setInterval(() => {
      // 累计跑步时间
      second++
      this.setData({
        runTime: second,
        outTime: this.data.outTime + 1,
      })
      // 更新跑步信息
      this.getRunShowData()
      // 缓存跑步数据
      this.setRunDataCache()
    }, 1000)
    this.setData({
      runTimer: runTimer,
    })
    // 监听加速度数据事件
    onAccelerometerChange((absObj) => {
      this.setData({
        x: absObj.x,
        y: absObj.y,
      })
    })
    // 开启监听位置变化，5秒返回一次结果
    // stopLocationUpdate()
    startLocationUpdateBackground().then((res) => {
      // console.log(res)
      onLocationChange(this._mylocationChangeFn)
    })
  },
  // 监听位置变化的操作
  _mylocationChangeFn(res) {
    // 判断离上一次获取位置的时间是否超过5s
    if (!this.data.canGetLocation) {
      return false
    }
    // 时间5s,可以获取点位信息
    this.setData({
      canGetLocation: false,
    })
    // 判断跑步点并进行保存
    this.savePoint(res)
  },
  // 判断并存点 返回最新的轨迹点数组
  savePoint(res) {
    let correctFlag = 1
    let pointArr = this.data.locaDotArr
    let pots = []
    pointArr.forEach((i) => {
      pots = [...pots, ...i]
    })
    if (
      !(Math.abs(this.data.x) > 0.07 && Math.abs(this.data.y) > 0.02) &&
      pots.length > 0
    ) {
      // 判断手机是否在移动？
      correctFlag = 0
    } else if (res.speed == 0 && pots.length > 0) {
      // 判断速度是否异常
      correctFlag = 0
    } else {
      let newPoint = {
        runner_id: '',
        point_id: '',
        longitude: res.longitude,
        latitude: res.latitude,
        time: new Date().getTime(),
      }
      if (pointArr.length == 0) {
        pointArr = [[]]
      }
      let finalArr = pointArr[pointArr.length - 1]
      if (finalArr.length > 0) {
        let finalPoint = finalArr[finalArr.length - 1]
        let dic = myFormats.calcDistance(
          newPoint.longitude,
          newPoint.latitude,
          finalPoint.longitude,
          finalPoint.latitude,
        )
        // if(dic < 1){
        //     correctFlag = 0
        //     // return pointArr
        // }else
        if (dic > 75) {
          if (finalArr.length <= 1) {
            pointArr.pop()
          }
          let newfinalArr = []
          newfinalArr.push(newPoint)
          pointArr.push(newfinalArr)
          correctFlag = 0
        } else {
          pointArr[pointArr.length - 1].push(newPoint)
        }
      } else {
        pointArr[pointArr.length - 1].push(newPoint)
      }
    }
    if (correctFlag == 0) {
      this.setData({
        canGetLocation: true,
      })
    } else if (correctFlag == 1) {
      var locaTimer = setTimeout(() => {
        // 获取一次当前位置
        this.setData({
          canGetLocation: true,
        })
      }, 1000)
      this.setData({
        locaTimer: locaTimer,
      })
    }
    for (let i = 0; i < pointArr.length; i++) {
      // GPS轨迹处理
      pointArr[i] = douglasPeuker(pointArr[i], 0.000005)
    }
    this.setData({
      locaDotArr: pointArr,
    })
    // return pointArr
  },
  // 跑步暂停
  async runPause() {
    let pointArr = this.data.locaDotArr
    if (pointArr.length == 0) {
      pointArr[0] = []
    } else if (pointArr[pointArr.length - 1].length <= 1) {
      pointArr[pointArr.length - 1] = []
    } else {
      pointArr.push([])
    }
    this.setData({
      locaDotArr: pointArr,
    })
    // 重新获取当前步数
    await this.setNowStep(false)
    console.log("暂停");
    console.log(this.data.steps);
    console.log(this.data.initialStep);
    // 清除跑步计时器
    clearInterval(this.data.runTimer)
    clearTimeout(this.data.locaTimer)
    backgroundAudioManager.src =
      'https://ydcommon.51yund.com/mini_run_voice/voice_1/yundongyizanting.mp3'
    this.setData({
      runStatus: 1,
    })
    // 关闭定位追踪
    offLocationChange(this._mylocationChangeFn)
    stopLocationUpdate().then((res) => {})
    // stopAccelerometer()
    offAccelerometerChange()
  },
  // 继续跑步
  runContinue() {
    this.setData({
      runStatus: 0,
    })
    this.runStart()
    backgroundAudioManager.src =
      'https://ydcommon.51yund.com/mini_run_voice/voice_1/yundongyihuifu.mp3'
  },
  // 结束跑步
  async runStop() {
    // 读取缓存的轨迹数组，没有移动则不允许结算
    let user_id = getStorageSync('user_id')
    let key = 'run_data_' + user_id
    let kMilesCacheData = getStorageSync(key)
    if (
      !kMilesCacheData.locaDotArr[0] ||
      kMilesCacheData.locaDotArr[0].length < 2 ||
      this.data.runMiles <= 10
    ) {
      showModal({
        title: this.data.$language['是否退出跑步'] + ' ？',
        content: this.data.$language['您的移动距离过短,数据将不会保存'],
        cancelText: this.data.$language['取消'],
        confirmText: this.data.$language['确定'],
      }).then(async (res) => {
        if (res.confirm) {
          // 清除运动数据缓存
          let user_id = getStorageSync('user_id')
          let storageKey = 'run_kmiles_pace_arr_' + user_id
          setStorageSync(storageKey, [])
          setStorageSync(key, {})
          // 清除定时器
          clearInterval(this.data.runTimer)
          backgroundAudioManager.src =
            'https://ydcommon.51yund.com/mini_run_voice/voice_1/paobujieshu.mp3'
          this.setData({
            runTime: 0,
          })
          // 关闭定位追踪
          offLocationChange(this._mylocationChangeFn)
          stopLocationUpdate().then((res) => {})
          offAccelerometerChange()
          switchTab({
            url: '/pages/tabBar/home/home',
          })
        } else {
          return false
        }
      })
      return false
    }
    // 缓存最后一公里的配速
    this.setKmilesCache(false)
    // 跑步结束时间
    let runEndTime = parseInt(Date.now() / 1000)
    this.setData({
      runEndTime,
    })
    // 重新获取当前步数
    await this.setNowStep(false)
    console.log("暂停");
    console.log(this.data.steps);
    console.log(this.data.initialStep);
    this.setRunDataCache()
    // 处理缓存数据
    let speed_infos=this.getKmilesCache()
    for(const index in speed_infos){
      speed_infos[index]={
        index:speed_infos[index]['kmiles_cut'],
        distance:speed_infos[index]['outMiles'],
        avg_time:speed_infos[index]['usetime']
      }
    }
    // 上报跑步数据
    let params = {
      kind_id: 0,
      distance: this.data.runMiles,
      cost_time: this.data.runTime,
      time: this.data.runStartTime,
      // time:runEndTime,
      caloric: this.data.calorie,
      run_source: 'wx_mini_program',
      // 每公里配速缓存上报
      speed_infos:JSON.stringify(speed_infos),
      // 步数
      u_steps:this.data.steps,
    }
    if (this.data.runTime == 0 || this.data.runMiles == 0) {
      params.avg_pace = 0
      params.avg_speed = 0
    } else {
      // 配速(秒/公里)
      params.avg_pace = (
        this.data.runTime /
        (this.data.runMiles / 1000)
      ).toFixed(2)
      // 均速(公里/小时)
      params.avg_speed = (
        this.data.runMiles /
        1000 /
        (this.data.runTime / 3600)
      ).toFixed(2)
    }
    api.reportRunnerInfo(params).then((res) => {
      // 获取runner_id
      let runId = res.runner_id
      // 上传轨迹点信息
      let points = []
      this.data.locaDotArr.forEach((item) => {
        points = [...points, ...item]
      })
      api
        .reportRunnerPathData({
          runner_id: runId.toString(),
          detail: JSON.stringify(points),
        })
        .then((res) => {})
      if (res.code == 0) {
        // 清除定位，时间置零
        clearInterval(this.data.runTimer)
        this.setData({
          runTime: 0,
          runStatus: 1,
        })
        // 关闭定位追踪
        offLocationChange(this._mylocationChangeFn)
        stopLocationUpdate().then((res) => {})
        stopAccelerometer()
        offAccelerometerChange()
        // 跳转到跑步结算页
        let runner_id = res.runner_id
        redirectTo({
          url: `../run_final/index?runner_id=${runner_id}`,
        })
      }
    })
  },
  // 缓存运动数据
  setRunDataCache() {
    let user_id = getStorageSync('user_id')
    let storageKey = 'run_data_' + user_id
    setStorage({
      key: storageKey,
      data: {
        kind_id: this.data.kind_id,
        // 跑步持续时间(秒)
        runTime: this.data.runTime,
        // 跑步轨迹点数组
        locaDotArr: this.data.locaDotArr,
        // 跑步开始时间(时间戳)
        runStartTime: this.data.runStartTime,
        // 跑步结束时间(时间戳)
        runEndTime: this.data.runEndTime,
        // 跑步距离(米m)
        runMiles: this.data.runMiles,
        // 消耗卡路里
        calorie: this.data.calorie,
        // 最新一公里的跑步时间
        outTime: this.data.outTime,
        // 步数
        steps: this.data.steps
      },
    })
  },
  // 缓存每公里配速
  setKmilesCache(flag = true) {
    let user_id = getStorageSync('user_id')
    let key = 'run_kmiles_pace_arr_' + user_id
    let oldArr = []
    if (getStorageSync(key)) {
      oldArr = getStorageSync(key)
    }
    let newData = {
      kmiles_cut: this.data.kmilesCount,
      usetime: this.data.outTime,
      outMiles: this.data.outMiles,
    }
    if (flag == true) {
      // 最后结束时的缓存
      newData.avg_pace = this.data.outTime
    } else if (flag == false) {
      // 正常每公里缓存
      newData.avg_pace = (this.data.outTime / this.data.outMiles) * 1000
    }
    let newArr = [...oldArr, newData]
    setStorageSync(key, newArr)
  },
  // 读取每公里配速缓存
  getKmilesCache() {
    let user_id = getStorageSync('user_id')
    let key = 'run_kmiles_pace_arr_' + user_id
    let kMilesCacheData = getStorageSync(key)
    return kMilesCacheData
  },
  // 获取缓存数据
  getRunDataCache() {
    let user_id = getStorageSync('user_id')
    let storageKey = 'run_data_' + user_id
    try {
      let cacheData = getStorageSync(storageKey)
      return cacheData
    } catch (e) {}
  },
  // 读取跑步设置缓存
  getRunSetCache() {
    try {
      let user_id = getStorageSync('user_id')
      let storageKey = 'run_set_infos_' + user_id
      let res = getStorageSync(storageKey)
      if (res) {
        this.setData({
          'setInfo.mapStyle': res.nowMapStyInfo,
          'setInfo.openVoice': res.openVoice,
          'setInfo.voiceIndex': res.voiceIndex,
          'setInfo.freIndex': res.freIndex,
        })
        // 根据缓存的播报频率，设置播报频率和下一次播报的时间
        if (res.freIndex[0] == 0) {
          let audioDistance = 500
          let nextDistance = 500
          switch (res.freIndex[1]) {
            case 0:
              audioDistance = 500
              break
            case 1:
              audioDistance = 1000
              break
            case 2:
              audioDistance = 2000
              break
            case 3:
              audioDistance = 3000
              break
            default:
              audioDistance = 500
              break
          }
          nextDistance =
            (parseInt(this.data.runMiles / audioDistance) + 1) * audioDistance
          this.setData({
            'reportData.audioDistance': audioDistance,
            'reportData.nextDistance': nextDistance,
          })
        } else if (res.freIndex[0] == 1) {
          let audiotime = 600
          let nextTime = 600
          switch (res.freIndex[1]) {
            case 0:
              audiotime = 600
              break
            case 1:
              audiotime = 1200
              break
            case 2:
              audiotime = 1800
              break
            case 3:
              audiotime = 2400
              break
            default:
              audiotime = 600
              break
          }
          nextTime = (parseInt(this.data.runTime / audiotime) + 1) * audiotime
          this.setData({
            'reportData.audiotime': audiotime,
            'reportData.nextTime': nextTime,
          })
        }
      } else {
        let audioDistance = 500
        let nextDistance =
          (parseInt(this.data.runMiles / audioDistance) + 1) * audioDistance
        this.setData({
          'reportData.audioDistance': audioDistance,
          'reportData.nextDistance': nextDistance,
        })
      }
    } catch (e) {}
  },
  // 音频播放
  playVoice(src) {
    innerAudioContext.destroy()
    innerAudioContext = createInnerAudioContext({ useWebAudioImplement: true })
    innerAudioContext.src = src
    innerAudioContext.play()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    innerAudioContext = createInnerAudioContext({ useWebAudioImplement: true })
    innerAudioContext.autoplay = true
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 查看缓存，是否有上次未完成的运动
    let cacheData = this.getRunDataCache()
    // 有残留的运动记录时
    if (cacheData && JSON.stringify(cacheData) != '{}') {
      // console.log("上次运动未完成")
      let {
        calorie,
        kind_id,
        locaDotArr,
        runMiles,
        runStartTime,
        runTime,
        outTime,
        steps,
      } = cacheData
      this.setData({
        calorie,
        kind_id,
        locaDotArr,
        runMiles,
        runStartTime,
        runTime,
        outTime,
        steps,
      })
      // 查看每公里配速缓存
      let kMilesCache = this.getKmilesCache()
      if (kMilesCache && JSON.stringify(kMilesCache) != '[]') {
        this.setData({
          kmilesCount: kMilesCache[kMilesCache.length - 1].kmiles_cut + 1,
        })
      }
      // 读取跑步设置缓存
      this.getRunSetCache()
      //
      this.runStart()
      backgroundAudioManager.src =
        'https://ydcommon.51yund.com/mini_run_voice/voice_1/kaishipaobu.mp3'
    } else {
      // 没有残留的运动记录时
      // console.log("上次运动已完成")
      this.setData({
        guidePageShow: false,
      })
      // 开启跑步引导页
      this.setData({
        guidePageShow: true,
        runGuideCount: 3,
      })
      // 开始倒计时
      let c = 0
      runGuideCountTimer = setInterval(() => {
        this.setData({
          runGuideCountTimer: runGuideCountTimer,
        })
        if (c % 1000 == 0 && c > 0 && c < 3000) {
          this.setData({
            runGuideCount: this.data.runGuideCount - 1,
          })
        }
        if (c == 0) {
          backgroundAudioManager.src =
            'https://ydcommon.51yund.com/mini_run_voice/voice_1/3.mp3'
        } else if (c == 1000) {
          backgroundAudioManager.src =
            'https://ydcommon.51yund.com/mini_run_voice/voice_1/2.mp3'
        } else if (c == 2000) {
          backgroundAudioManager.src =
            'https://ydcommon.51yund.com/mini_run_voice/voice_1/1.mp3'
        } else if (c == 3000) {
          this.setData({
            guidePageShow: false,
            runStartTime: parseInt(Date.now() / 1000),
          })
          clearInterval(this.data.runGuideCountTimer)
          this.runStart()
          // innerAudioContext.src = "https://ydcommon.51yund.com/mini_run_voice/voice_1/kaishipaobu.mp3"
          backgroundAudioManager.src =
            'https://ydcommon.51yund.com/mini_run_voice/voice_1/kaishipaobu.mp3'
        }
        c += 1000
      }, 1000)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 读取跑步设置缓存
    this.getRunSetCache()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    innerAudioContext.stop()
    innerAudioContext.destroy()
    clearInterval(runGuideCountTimer)
    clearInterval(this.data.runTimer)
    clearInterval(this.data.runGuideCountTimer)
    // 关闭定位追踪
    offLocationChange()
    stopLocationUpdate().then((res) => {})
  },

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
