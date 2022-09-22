// plugin/pages/FAQ/index.js
import wxFun from '../../utils/wxFun'
let navigateBack = wxFun.promisify('navigateBack')
let setStorageSync = wxFun.ordinary('setStorageSync')
let getStorageSync = wxFun.ordinary('getStorageSync')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedNavIndex: 0,
    navList: [
      { name: '手机定位' },
      { name: '微信悬浮框' },
      { name: '微信定位' },
      { name: '小程序定位' },
    ],
    faqList: [
      {
        index: 0,
        title: '1.手机定位服务位置信息',
        text: '跑步时需要使用手机GPS定位服务，获取运动轨迹和计算运动里程',
        solveTle: '如何开启？',
        solveCon: '【打开手机设置】-【位置信息/定位服务】-【开启】',
        img: '',
      },
      {
        index: 1,
        title: '2.微信悬浮窗权限',
        text: '开启后，在运动过程中，能确保熄屏和后台运行场景下，微信不被强制关闭，从而确保运动进程正常进行',
        solveTle: '如何开启？',
        solveCon:
          '【打开手机设置】-【应用】-【找到微信】-【权限】-【悬浮窗】-【允许】',
        img: '',
      },
      {
        index: 2,
        title: '3.微信定位权限',
        text: '在跑步过程中，需要始终允许微信定位权限，才能完整记录运动轨迹',
        solveTle: '如何开启？',
        solveCon:
          '【打开手机设置】-【应用】-【找到微信】-【权限】-【位置信息】-【始终允许】',
        img: '',
      },
      {
        index: 3,
        title: '4.小程序定位权限',
        text: '在跑步过程中，需要打开小程序和小程序悬浮后台时的定位权限，才能完整记录运动轨迹',
        solveTle: '如何开启？',
        solveCon:
          '【小程序设置】-【位置信息】-【打开小程序和小程序悬浮后台时允许】',
        img: 'https://ssl-pubpic.51yund.com/1225197969.png',
      },
    ],
  },
  selectedNav(e) {
    let index = e.currentTarget.dataset['index']
    this.setData({
      selectedNavIndex: index,
    })
  },
  nextTip() {
    this.setData({
      selectedNavIndex: this.data.selectedNavIndex + 1,
    })
  },
  finishTip() {
    let user_id = getStorageSync('user_id')
    let storageKey = 'isNewUser_' + user_id
    setStorageSync(storageKey, 1)
    navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

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
