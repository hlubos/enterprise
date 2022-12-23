// run_packege/pages/run_share/index.js
import api from '../../server/run'
import Wxml2Canvas from '../../wxml2canvas/index'
import wxFun from '../../utils/wxFun'
import i18nInstance from 'miniprogram-i18n-plus'
let navigateTo = wxFun.promisify('navigateTo')
let showLoading = wxFun.promisify('showLoading')
let hideLoading = wxFun.promisify('hideLoading')
let showToast = wxFun.promisify('showToast')
let previewImage = wxFun.promisify('previewImage')
let saveImageToPhotosAlbum = wxFun.promisify('saveImageToPhotosAlbum')
let createSelectorQuery = wxFun.ordinary('createSelectorQuery')
let getStorageSync = wxFun.ordinary('getStorageSync')
var log = require("../../../../common/log")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataImg: '',
    staticMapUrl:
      'https://apis.map.qq.com/ws/staticmap/v2/?key=L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2&scale=2&size=500x400&center=39.12,116.54&zoom=12',
    qrcodeImg: 'https://ydcommon.51yund.com/wxapp/upimg/mini-qrcode.jpg',
    // qrcodeImg: 'https://ydcommon.51yund.com/wxapp/upimg/geely-in-show.png',
    posterImgUrl: '',
    canvasWidth: 750,
    canvasHeight: 1000,
  },
  // 调整canvas宽高
  setCanvasSize() {
    return new Promise(reslove=>{
    let shareBox = createSelectorQuery()
    shareBox
      .select('.img-area')
      .boundingClientRect((res) => {
        // myCanvasHeight = res.height
        this.setData({
          canvasHeight: res.height,
          canvasWidth: res.width,
        })
        console.log("调整canvas宽高");
        console.log(res);
        reslove()
      })
      .exec()      
    })
  },
  // 生成图片
  createImg() {
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
  async draw() {
    let that = this
    //创建wxml2canvas对象
    console.log("star draw");
    let drawImage = new Wxml2Canvas(
      {
        element: 'answerCanvas', // canvas节点的id,
        obj: that, // 在组件中使用时，需要传入当前组件的this
        width: this.data.canvasWidth, // 宽 自定义
        height: 5000, // 高 自定义
        background: '#ffffff', // 默认背景色 设置背景色
        scrolly: 0,
        scrollx: 0,
        //   fileType:'jpg',
        //   zoom:0.8,
        progress(percent) {
          // 绘制进度
        },
        finish(url) {
          console.log(url)
          hideLoading()
          showToast({
            title: that.data.$language['图片已生成'],
            icon: 'none',
            duration: 1500,
          })
          that.setData({
            posterImgUrl: url,
          })
        },
        error(res) {
          console.log("darw");
          console.log(res);
          log.error({
            "share_err":res
          })
          hideLoading()
          // 画失败的原因
        },
      },
      that,
    )
    console.log("drawImage after");
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
    console.log("setCanvasSize before");
    await  this.setCanvasSize()
    console.log("setCanvasSize after");
    drawImage.draw(data, that)
    console.log("draw after");
  },
  // 保存图片
  clickSaveImg() {
    console.log('filePath', this.data.posterImgUrl)
    log.error({
      "保存图片":this.data.posterImgUrl
    })
    if (!this.data.posterImgUrl) {
      showToast({
        title: this.data.$language['保存失败'],
        icon: 'none',
        duration: 1500,
      })
      return
    }
    saveImageToPhotosAlbum({
      filePath: this.data.posterImgUrl,
    })
      .then((res) => {
        showToast({
          title: this.data.$language['图片已保存'] + '！',
          icon: 'none',
          duration: 2000,
        })
      })
      .catch((rej) => {
        if (rej.errno == 103 || rej.errno == 104) {
          // console.log("用户取消或拒绝授权")
        }
      })
  },

  // 微信分享
  wxShare() {
    let that=this
    if (!this.data.posterImgUrl) {
      showToast({
        title: this.data.$language['保存失败'],
        icon: 'none',
        duration: 1500,
      })
      return
    }
    wx.showToast({
      title: this.data.$language['长按图片分享'],
      icon:'none',
      duration:1500
    })
    setTimeout(() => {
      previewImage({
        urls: [that.data.posterImgUrl],
      }).then(()=>{
        wx.hideLoading()
      })
    }, 1000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options)
    i18nInstance.effect(this)
    wx.setNavigationBarTitle({
      title: this.data.$language['企业悦动'],
    })
    this.setData({
      runner_id: options.runner_id,
      dataImg: decodeURIComponent(options.dataImg),
      staticMapUrl: decodeURIComponent(options.mapImg),
    })
    // this.setStaticMapInfo()
    this.createImg()
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
  onUnload() {
    
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
