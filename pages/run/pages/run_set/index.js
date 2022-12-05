// plugin/pages/run_set/index.js
import wxFun from '../../utils/wxFun'
import i18nInstance from 'miniprogram-i18n-plus'

let getNetworkType = wxFun.promisify('getNetworkType')
let setStorageSync = wxFun.ordinary('setStorageSync')
let getStorageSync = wxFun.ordinary('getStorageSync')
Page({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    // 是否开启语音播报
    openVoice: true,
    // 网络状态
    networkType: '',
    // 网络信号强度 dbm
    signalStrength: 0,
    // 网络检测结果
    netTxt: '',
    // 当前语音类型索引
    voiceIndex: 0,
    // 当前播报频率索引
    freIndex: [0, 0],
    // 显示语音类型选择器
    isVoicePickerShow: false,
    // 显示播报频率选择器
    isFrePickerShow: false,
    // 语音类型列表
    // voiceList: ['国语女声', '国语男声', '英语女声', '英语男声'],
    voiceList: ['国语女声'],
    // 播报频率 ['10分钟', '20分钟', '30分钟', '40分钟']
    defaultDistanceArr: ['0.5公里', '1公里', '2公里', '3公里'],
    defaultTimeArr: ['10分钟', '20分钟', '30分钟', '40分钟'],
    frequencyArray: [
      ['按距离播报', '按时间播报'],
      ['0.5公里', '1公里', '2公里', '3公里'],
    ],
    freColumns: [
      {
        values: ['按距离播报', '按时间播报'],
        className: 'column1',
        defaultIndex: '0',
      },
      {
        values: ['0.5公里', '1公里', '2公里', '3公里'],
        className: 'column2',
        defaultIndex: '0',
      },
    ],
    // 地图样式列表
    mapStyleList: [
      {
        title: '经典',
        icon: 'https://ssl-pubpic.51yund.com/1223520672.png',
        mapStyInfo: {
          subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
          'layer-style': '1',
        },
      },
      // {
      //     title:"白浅",
      //     icon:"https://ssl-pubpic.51yund.com/1223520701.png",
      //     mapStyInfo:{
      //         "subkey":"L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2",
      //         "layer-style":"2",
      //     }
      // },
      {
        title: '玉露',
        icon: 'https://ssl-pubpic.51yund.com/1223520743.png',
        mapStyInfo: {
          subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
          'layer-style': '2',
        },
      },
      // {
      //     title:"烟翠",
      //     icon:"https://ssl-pubpic.51yund.com/1223520762.png",
      //     mapStyInfo:{
      //         // subkey:'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
      //         "subkey":"V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J",
      //         "layer-style":"1",
      //     }
      // },
      // {
      //     title:"澹月",
      //     icon:"https://ssl-pubpic.51yund.com/1223520780.png",
      //     mapStyInfo:{
      //         // subkey:'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
      //         "subkey":"V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J",
      //         "layer-style":"2",
      //     }
      // },
      {
        title: '墨渊',
        icon: 'https://ssl-pubpic.51yund.com/1223520834.png',
        mapStyInfo: {
          subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
          // "subkey":"V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J",
          'layer-style': '3',
        },
      },
    ],
    // 当前地图样式
    nowMapStyInfo: {
      subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
      'layer-style': '1',
    },
  },
  // 缓存设置的数据
  cacheSetData() {
    try {
      let user_id = getStorageSync('user_id')
      let storageKey = 'run_set_infos_' + user_id
      setStorageSync(storageKey, {
        openVoice: this.data.openVoice,
        voiceIndex: this.data.voiceIndex,
        freIndex: this.data.freIndex,
        nowMapStyInfo: this.data.nowMapStyInfo,
      })
    } catch (e) {}
  },
  // 语音播报开关
  switchVoice(e) {
    // console.log(e.detail)
    this.setData({
      openVoice: e.detail.value,
    })
    this.cacheSetData()
  },
  // 检查网络类型
  checkNet() {
    getNetworkType().then((res) => {
      console.log(res)
      this.setData({
        networkType: res.networkType,
        signalStrength: res.signalStrength,
      })
      let netTxt = ''
      if (res.networkType == 'wifi') {
        netTxt = '当前为WIFI网络'
      } else if (res.networkType == '4g' || res.networkType == '5g') {
        netTxt = '当前为4G/5G网络'
      } else {
        netTxt = '当前网络信号弱'
      }
      // if(!res.signalStrength){
      //     if(res.networkType == 'wifi'){
      //         netTxt='当前为WIFI网络'
      //     }else if(res.networkType == '4g' || res.networkType == '5g'){
      //         netTxt='当前为4G/5G网络'
      //     }else{
      //         netTxt='当前网络信号弱'
      //     }
      // }else{
      //     if(res.networkType == 'wifi'){
      //         // wifi
      //         if(res.signalStrength <= 0 && res.signalStrength > -55){
      //             netTxt = '网络信号强'
      //         }else if(res.signalStrength <= -55 && res.signalStrength >= -100){
      //             netTxt ='网络信号一般'
      //         }else {
      //             // netTxt = '网络信号差'
      //             netTxt = '您当前网络信号不好，请切换网络'
      //         }
      //     }else if(res.networkType == '4g' || res.networkType == '5g'){
      //         // 4g/5g
      //         if(res.signalStrength >= -51 && res.signalStrength < 0){
      //             netTxt = '网络信号强'
      //         }else if(res.signalStrength >= -89 && res.signalStrength < -51){
      //             // （-89）-（-51）满格（Great）
      //             netTxt = '网络信号强'
      //         }else if(res.signalStrength >= -97 && res.signalStrength < -89){
      //             // （-97）-（-89）很好（Good）
      //             netTxt = '网络信号很好'
      //         }else if(res.signalStrength >= -103 && res.signalStrength < -97){
      //             // （-103）-（-97）良好（MODERATE）
      //             netTxt = '网络信号良好'
      //         }else if(res.signalStrength >= -107 && res.signalStrength < -103){
      //             // （-107）-（-103）很差（poor）
      //             netTxt = '您当前网络信号不好，请切换网络'
      //         }else if(res.signalStrength >= -113 && res.signalStrength < -107){
      //             // （-113）-（-107）无信号（min）
      //             netTxt = "您当前网络信号不好，请切换网络"
      //         }else {
      //             netTxt = "您当前网络信号不好，请切换网络"
      //         }
      //     }else {
      //         netTxt = "您当前网络信号不好，请切换网络"
      //     }
      // }
      this.setData({
        netTxt,
      })
    })
  },
  // 设置地图样式
  selectMapSty(e) {
    // console.log(e.currentTarget.dataset.key)
    let mapStyInfo = e.currentTarget.dataset.key.mapStyInfo
    this.setData({
      nowMapStyInfo: mapStyInfo,
    })
    this.cacheSetData()
  },
  // 播报类型改变
  // voiceChange(e){
  //     this.setData({
  //         voiceIndex: e.detail.value
  //     })
  //     this.cacheSetData()
  // },
  onVoiceColumnChange(e) {},
  onVoiceColumnConfirm(e) {
    this.setData({
      voiceIndex: e.detail.index,
      isPickerShow: false,
    })
    this.cacheSetData()
  },
  onVoiceColumnCancel(e) {
    this.setData({
      isPickerShow: false,
    })
  },
  // 播报频率改变
  // freChange(e){
  //     this.setData({
  //         freIndex: e.detail.value
  //     })
  //     this.cacheSetData()
  // },
  // 选择播报频率列改变时触发
  // freColumnChange(e){
  //     if(e.detail.column == 0){
  //         if(e.detail.value == 0){
  //             this.setData({
  //                 "frequencyArray[1]": this.data.defaultDistanceArr
  //             })
  //         }else if(e.detail.value == 1){
  //             this.setData({
  //                 "frequencyArray[1]": this.data.defaultTimeArr
  //             })
  //         }
  //     }
  // },
  onFreColumnChange(e) {
    let { picker, value, index } = e.detail
    if (index == 0) {
      let valIndex = picker.getColumnIndex(0)
      if (valIndex == 0) {
        this.setData({
          'frequencyArray[1]': this.data.defaultDistanceArr,
          'freColumns[1].values': this.data.defaultDistanceArr,
        })
      } else if (valIndex == 1) {
        this.setData({
          'frequencyArray[1]': this.data.defaultTimeArr,
          'freColumns[1].values': this.data.defaultTimeArr,
        })
      }
    }
  },
  onFreColumnConfirm(e) {
    this.setData({
      freIndex: e.detail.index,
      isPickerShow: false,
    })
    this.cacheSetData()
  },
  onFreColumnCancel(e) {
    this.setData({
      isPickerShow: false,
    })
  },
  // 选择播报频率取消时
  // freCancel(e){
  //     this.setData({
  //         freIndex:this.data.freIndex
  //     })
  //     if(this.data.freIndex[0] == 0){
  //         this.setData({
  //             "frequencyArray[1]": this.data.defaultDistanceArr
  //         })
  //     }else if(this.data.freIndex[0] == 1){
  //         this.setData({
  //             "frequencyArray[1]": this.data.defaultTimeArr
  //         })
  //     }
  // },
  // 读取跑步设置缓存
  getRunSetCache() {
    try {
      let user_id = getStorageSync('user_id')
      let storageKey = 'run_set_infos_' + user_id
      let res = getStorageSync(storageKey)
      if (res) {
        this.setData({
          nowMapStyInfo: res.nowMapStyInfo,
          freIndex: res.freIndex,
          openVoice: res.openVoice,
          voiceIndex: res.voiceIndex,
        })
        if (this.data.freIndex[0] == 0) {
          this.setData({
            'frequencyArray[1]': this.data.defaultDistanceArr,
            'freColumns[1].values': this.data.defaultDistanceArr,
          })
        } else if (this.data.freIndex[0] == 1) {
          this.setData({
            'frequencyArray[1]': this.data.defaultTimeArr,
            'freColumns[1].values': this.data.defaultTimeArr,
          })
        }
        this.setData({
          'freColumns[0].defaultIndex': res.freIndex[0],
          'freColumns[1].defaultIndex': res.freIndex[1],
        })
      }
      // console.log(this.data.mapStyle.subkey)
    } catch (e) {}
  },
  showPicker() {
    this.setData({
      isPickerShow: true,
    })
  },
  showVoicePicker() {
    this.setData({
      isPickerShow: true,
      isFrePickerShow: false,
      isVoicePickerShow: true,
    })
  },
  showFrePicker() {
    this.setData({
      isPickerShow: true,
      isVoicePickerShow: false,
      isFrePickerShow: true,
    })
  },
  changeVoiceIndex(e) {
    console.log(e)
    this.setData({
      voiceIndex: e.detail.value,
    })
    this.cacheSetData()
  },
  changeFreIndex(e) {
    // console.log(e)
    this.setData({
      freIndex: e.detail.value,
    })
    this.cacheSetData()
    if (this.data.freIndex[0] == 0) {
      this.setData({
        'frequencyArray[1]': this.data.defaultDistanceArr,
      })
    } else if (this.data.freIndex[0] == 1) {
      this.setData({
        'frequencyArray[1]': this.data.defaultTimeArr,
      })
    }
  },

  initI18nData() {
    const voiceList = this.data.voiceList
    this.formatI18nArr(voiceList)
    const frequencyArray = this.data.frequencyArray
    frequencyArray.forEach((item) => {
      this.formatI18nArr(item)
    })
    const freColumns = this.data.freColumns
    freColumns.forEach((item) => {
      this.formatI18nArr(item.values)
    })
    const defaultDistanceArr = this.data.defaultDistanceArr
    const defaultTimeArr = this.data.defaultTimeArr
    this.formatI18nArr(defaultDistanceArr)
    this.formatI18nArr(defaultTimeArr)
    this.setData({
      voiceList,
      frequencyArray,
      freColumns,
      defaultDistanceArr,
      defaultTimeArr,
    })
  },

  formatI18nArr(data) {
    data.forEach((item, index, arr) => {
      arr[index] = this.data.$language[item]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    i18nInstance.effect(this)
    this.initI18nData()
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 读取设置缓存
    this.getRunSetCache()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      isPickerShow: false,
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.setData({
      isPickerShow: false,
    })
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
