// run_packege/pages/run_share/index.js
import {
    navigateTo,
    getStorageSync,
    createSelectorQuery,
    showLoading,
    hideLoading,
    previewImage,
    saveImageToPhotosAlbum,
    showToast,
} from '../../utils/wxApi'
import api from '../../server/run'
import Wxml2Canvas from 'wxml2canvas'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataImg:'',
        staticMapUrl:'https://apis.map.qq.com/ws/staticmap/v2/?key=L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2&scale=2&size=500x400&center=39.12,116.54&zoom=12',
        qrcodeImg:'https://ssl-pubpic.51yund.com/1224160409.jpg',
        posterImgUrl:'',
        canvasWidth:750,
        canvasHeight:1000,
    },
    // 调整canvas宽高
    setCanvasSize() {
        let shareBox = createSelectorQuery()
        // console.log(shareBox.select('.img-area'))
        shareBox.select('.img-area').boundingClientRect(res => {
            // myCanvasHeight = res.height
            this.setData({
                canvasHeight: res.height,
                canvasWidth:res.width,
            })
        }).exec()
    },
    // 生成图片
    createImg(){
         showLoading({
            title:'分享图片生成中'
         })
         const that = this
         const query = createSelectorQuery().in(this);
         query.select('#answer-canvas').fields({ //answer-canvas要绘制的canvas的id
             size: true,
             scrollOffset: true
         }).exec(res=>{
             // console.log(res)
             setTimeout(() => {
                 that.draw()
             }, 1500);
        })
    },
    draw(){
        let that = this
        //创建wxml2canvas对象
        let drawImage = new Wxml2Canvas({
          element: 'answerCanvas', // canvas节点的id,
          obj: that, // 在组件中使用时，需要传入当前组件的this
          width: this.data.canvasWidth, // 宽 自定义
          height: this.data.canvasHeight, // 高 自定义
          background: '#ffffff', // 默认背景色 设置背景色
          scrolly: 0,
          scrollx: 0,
        //   fileType:'jpg',
        //   zoom:0.8,
          progress(percent) { // 绘制进度
            // console.log(percent);
          },
          finish(url) {
            // console.log("创建的图片", url);
            hideLoading()
            showToast({
                title:'图片已生成',
                icon:'none',
                duration:1500,
            })
            that.setData({
                posterImgUrl:url,
            })
          },
          error(res) {
            // console.log(res);
            hideLoading()
            // 画失败的原因
          }
        }, that);
        let data = {
          //直接获取wxml数据
          list: [{
              type: 'wxml',
              //class: '.answer_canvas .answer_draw_canvas',  // answer_canvas这边为要绘制的wxml元素跟元素类名， answer_draw_canvas要绘制的元素的类名（所有要绘制的元素都要添加该类名）
              class: '.answer_canvas .answer_draw_canvas', 
              limit: '.answer_canvas', // 这边为要绘制的wxml元素跟元素类名,最外面的元素
              x: 0,
              y: 0
            } ]
        }
        this.setCanvasSize()
        drawImage.draw(data, that);
    },
    // 保存图片
    clickSaveImg() {
        saveImageToPhotosAlbum({
            filePath:this.data.posterImgUrl
        })
        .then(res=>{
            showToast({
                title:"图片已保存！",
                icon:'none',
                duration:2000,
            })
        })
        .catch(rej=>{
            // console.log(rej)
            if(rej.errno == 103 || rej.errno == 104){
                // console.log("用户取消或拒绝授权")
            }
        })
    },

    // 微信分享
    wxShare() {
        previewImage({
            urls:[this.data.posterImgUrl]
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // console.log(options)
        this.setData({
            runner_id: options.runner_id,
            dataImg:decodeURIComponent(options.dataImg),
            staticMapUrl:decodeURIComponent(options.mapImg),
        })
        // this.setStaticMapInfo()
        this.createImg()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // 获取轨迹点
        // api.getRunnerPathData({
        //     runner_id: this.data.runner_id
        // }).then(res=>{
        //     if(res.code == 0){
        //         console.log(res)
        //     }
        // })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})