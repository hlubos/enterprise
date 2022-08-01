// run_packege/pages/run_final/index.js
// import QRCode from '../../utils/weapp.qrcode.esm.js'
import api from '../../server/run'
import myFormats from '../../utils/format'
import {
    getStorageSync,
    removeStorageSync,
    navigateBack
} from '../../utils/wxApi'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 
        shareFlag:0,
        canvasWidth:0,
        canvasHeight:0,
        mapHeight:'600rpx',
        isShowPanel:true,
        pointsList:[],
        polylines:[
            {
                points: [],//是一个数组形式的坐标点[{lat,log}]
                color:"#4CDDB4",//线条的颜色
                width: 5,//宽度
                arrowLine: true,//是否带箭头
                borderWidth:0//线的边框宽度，还有很多参数，请看文档 
            }
        ],
        // 二维码图片
        qrcodeImg:'https://ssl-pubpic.51yund.com/1224160409.jpg',
        // 跑步开始时间(时间戳)
        runStartTime:0,
        // 跑步总距离（米）
        runMiles: 0,
        // 跑步时长（秒）
        runTime: 0,
        // 跑步消耗卡路里（卡）
        calorie: 0,
        // 要显示的跑步数据
        showRunData:{
            runStartTime:'',
            runKMiles:'0.00',
            avgPace:`00'00"`,
            sumTime:'00:00',
            kCalorie: 0,
        },
        // 用户信息
        userInfo:{
            head_url:'',
            run_day_cnt: 0,
            user_id: 0,
            nick:'',
        }
    },
    handleMap(e){
        console.log(e.detail)
    },
    // 打开/关闭面板
    switchPanel(){
        if(this.data.isShowPanel){
            this.setData({
                isShowPanel:false,
                mapHeight:'100vh',
            })
        }else{
            this.setData({
                isShowPanel:true,
                mapHeight:'600rpx',
            })
        }
        setTimeout(()=>{
            let mapFinalCtx = wx.createMapContext('run-final-map',this) // mapId对应地图id属性
            mapFinalCtx.includePoints({
                padding: [ 70,70,70,70 ], // padding类似我们css中的padding，可以有四个值
                points: this.data.pointsList
            })
        },500)
    },
    // 结束跑步
    runFinish(){
        try {
            let user_id = getStorageSync('user_id')
            let storageKey = 'run_data_' + user_id
            // 清除运动数据缓存
            removeStorageSync(storageKey)
        } catch (error) {}
        navigateBack()
    },
    // 分享按钮,显示二维码
    createQrcode(){
        this.setData({
            shareFlag: 1
        })
        this.setCanvasSize()
    },
    // 调整canvas宽高
    setCanvasSize(){
        let shareBox = wx.createSelectorQuery()
        console.log(shareBox.select('.share-img-box'))
        shareBox.select('.share-img-box').boundingClientRect(res=>{
            // myCanvasHeight = res.height
            this.setData({
                canvasHeight: res.height
            })
        }).exec()
    },
    // 保存图片
    clickSaveImg(){
        wx.canvasToTempFilePath({     //将canvas生成图片
            canvasId: 'shareCanvas',
            x: 0,
            y: 0,
            success: function (res) {
                // _this._data.imgUrl = res.tempFilePath
                wx.saveImageToPhotosAlbum({  //保存图片到相册
                    filePath: res.tempFilePath, //生成图片临时路径
                    success: function () {
                        wx.showToast({
                            title: "图片已保存！",
                            duration: 2000
                        })
                    }
                })
            },
            fail: error => {
                wx.showToast({
                    title: "保存图片失败",
                    duration: 2000
                })
                if (error.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || error.errMsg === "saveImageToPhotosAlbum:fail auth deny" || error.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
                    // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
                    wx.showModal({
                        title: '提示',
                        content: '需要您授权保存相册',
                        showCancel: false,
                        success: modalSuccess => {
                            wx.openSetting({
                                success(settingdata) {
                                    console.log("settingdata", settingdata)
                                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取权限成功',
                                            showCancel: false,
                                        })
                                    } else {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取权限失败，将无法保存到相册哦~',
                                            showCancel: false,
                                        })
                                    }
                                },
                            })
                        }
                    })
                }
            }
        },this)
    },
    // 微信分享
    wxShare(){

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setCanvasSize()
        api.runnerFinishDetail({
            sport_type: 0
        }).then(res=>{
            console.log(res)
            // userInfo:{
            //     head_url:'',
            //     run_day_cnt: 0,
            //     user_id: 0,
            // }
            if(res.code == 0){
                this.setData({
                    "userInfo.head_url":res.user_info.head_url,
                    "userInfo.run_day_cnt":res.user_info.run_day_cnt,
                    "userInfo.nick":res.user_info.nick,
                    "userInfo.user_id":getStorageSync('user_id'),
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // 读取缓存
        try {
            let user_id = getStorageSync('user_id')
            let storageKey = 'run_data_' + user_id
            let data = getStorageSync(storageKey)
            // console.log(data)
            this.setData({
                pointsList:data.locaDotArr,
                "polylines[0].points": data.locaDotArr,
                "showRunData.runStartTime": myFormats.formatDate(data.runStartTime,'yyyy-MM-dd hh:mm:ss'),
                "showRunData.runKMiles": (data.runMiles/1000).toFixed(2),
                "showRunData.avgPace": myFormats.formatAvg(data.runTime,data.runMiles),
                "showRunData.sumTime": myFormats.secTranlateTime(data.runTime),
                "showRunData.kCalorie": (55 * 1.036 * (data.runMiles / 1000)).toFixed(1),
            })
        } catch (error) {}
        // 
        var mapFinalCtx = wx.createMapContext('run-final-map',this) // mapId对应地图id属性
        mapFinalCtx.includePoints({
            padding: [ 70,70,70,70 ], // padding类似我们css中的padding，可以有四个值
            points: this.data.pointsList
        })
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
        // 清除运动数据缓存
        let user_id = getStorageSync('user_id')
        let storageKey = 'run_data_' + user_id
        removeStorageSync(storageKey)
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