// plugin/pages/run_page/index.js
import { getLocation , onLocationChange , offLocationChange,startLocationUpdate } from '../../utils/wxApi'
import myFormats from '../../utils/format'
Page({
    data: {
        // 引导页显示
        guidePageShow: false,
        // 跑步倒计时
        runGuideCount: 3,
        // 跑步倒计时计时器
        runGuideCountTimer:null,
        // 当前跑步状态 0.running正在跑步 1.pause暂停 2.stop结束跑步
        runStatus: 0,
        // 是否显示地图
        mapPanelShow:false,
        // 当前位置
        mapCenterLocation:{
            longitude:0,
            latitude:0,
        },
        // 跑步计时时长(秒)
        runTime:0,
        // 跑步距离(米m)
        runMiles:0,
        // 跑步计时器
        runTimer:null,
        // 位置获取计时器
        locaTimer:null,
        // 跑步显示的数据
        runShowData:{
            // 公里数
            runKmiles:'0',
            // 总计时间
            sumTime:'0:00:00',
            // 平均配速
            avePace:`0'00''`,
            // 消耗千卡
            kiloCalorie:'0.0',
        },
        // 位置点保存数组
        locaDotArr:[],
        // 是否能够获取位置（5s获取一次）
        canGetLocation:false
    },
    // 获取跑步数据可视化信息
    getRunShowData(){
        // 跑步公里数
        let runKmiles = (this._calculateRunMiles(this.data.locaDotArr)/1000).toFixed(2)
        let runMiles = this._calculateRunMiles(this.data.locaDotArr)
        this.setData({
            runMiles:runMiles,
        })
        // 跑步时长
        // let sumTime = myFormats.secTranlateTime(this.data.runTime)
        // 平均配速
        let avePace = myFormats.formatAvg(this.data.runTime,runMiles)
        // 消耗千卡
        let kiloCalorie = (55 * 1.036 * (runMiles / 1000)).toFixed(1);
        this.setData({
            "runShowData.runKmiles":runKmiles,
            // "runShowData.sumTime":sumTime,
            "runShowData.avePace":avePace,
            "runShowData.kiloCalorie":kiloCalorie,
        })
    },
    // 计算总距离（米m）
    _calculateRunMiles(pointArr){
        let sumRunMiles = 0
        for(let i = 0;i<pointArr.length-1;i++){
            sumRunMiles+=myFormats.calcDistance(pointArr[i].longitude,pointArr[i].latitude,pointArr[i+1].longitude,pointArr[i+1].latitude)
        }
        return sumRunMiles
    },
    // 显示地图
    showMap(){
        this.setData({
            mapPanelShow:true,
        })
    },
    // 隐藏地图
    hideMap(){
        this.setData({
            mapPanelShow:false,
        })
    },
    // 开始跑步
    runStart(){
        // 开始计时
        let that = this
        let second = this.data.runTime
        // let canGetLocation = true
        this.setData({
            canGetLocation: true
        })
        // 跑步计时
        var runTimer = setInterval(()=>{
            // 累计跑步时间
            second++
            that.setData({
                runTime:second
            })
            // 跑步时长+1
            let sumTime = myFormats.secTranlateTime(this.data.runTime)
            this.setData({
                "runShowData.sumTime":sumTime,
            })
            // that.getRunShowData()
        },1000)
        that.setData({
            runTimer:runTimer
        })
        // 开启监听位置变化，5秒返回一次结果
        startLocationUpdate().then(res=>{
            onLocationChange(this._mylocationChangeFn)
        })
    },
    // 监听位置变化的操作
    _mylocationChangeFn(res){
        // 判断离上一次获取位置的时间是否超过5s
        if(!this.data.canGetLocation){
            return false
        }
        // 判断当前点位与上个点位的距离是否超过10m
        if(this.data.locaDotArr.length > 0){
            let finalDoc = this.data.locaDotArr[this.data.locaDotArr.length-1]
            if(myFormats.calcDistance(res.longitude,res.latitude,finalDoc.longitude,finalDoc.latitude)<10){
                return false
            }
        }
        // 时间5s,移动距离超过10m,可以获取点位信息
        this.setData({
            canGetLocation: false
        })
        console.log(res)
        let locaDotArr = this.data.locaDotArr
        locaDotArr.push({
            latitude:res.latitude,
            longitude:res.longitude
        })
        this.setData({
            locaDotArr:locaDotArr
        })
        var locaTimer = setTimeout(()=>{
            // 5秒才能获取一次当前位置
            this.setData({
                canGetLocation: true
            })
            this.getRunShowData()
        },5000)
        this.setData({
            locaTimer:locaTimer
        })
    },
    // 跑步暂停
    runPause(){
        // 清除跑步计时器
        clearInterval(this.data.runTimer)
        clearTimeout(this.data.locaTimer)
        this.setData({
            runStatus:1
        })
        // 关闭定位追踪
        offLocationChange(this._mylocationChangeFn)
        wx.stopLocationUpdate({
            success: (res) => {
              console.log("停止追踪", res);
            },
            fail: (err) => {
              console.log(err);
            },
        });
    },
    // 继续跑步
    runContinue(){
        this.setData({
            runStatus:0
        })
        this.runStart()
    },
    // 结束跑步
    runStop(){
        clearInterval(this.data.runTimer)
        this.setData({
            runTime:0,
            runStatus:1,
        })
        // 关闭定位追踪
        offLocationChange(this._mylocationChangeFn)
        wx.stopLocationUpdate({
            success: (res) => {
              console.log("停止追踪", res);
            },
            fail: (err) => {
              console.log(err);
            },
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this
        // 获取初始位置信息
        getLocation().then(res=>{
            console.log(res)
            const latitude = res.latitude
            const longitude = res.longitude
            console.log(latitude,longitude)
            that.setData({
                mapCenterLocation:{
                    latitude,
                    longitude
                }
            })
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.setData({
            guidePageShow:false
        })
        // 开启跑步引导页
        this.setData({
            guidePageShow:true,
            runGuideCount: 3,
        })
        // 开始倒计时
        var runGuideCountTimer = setInterval(()=>{
            this.setData({
                runGuideCountTimer:runGuideCountTimer
            })
            this.setData({
                runGuideCount: this.data.runGuideCount - 1
            })
            // 倒计时结束后隐藏引导页，清除定时器，开始跑步计时
            if(this.data.runGuideCount == 0){
                this.setData({
                    guidePageShow:false
                })
                clearInterval(this.data.runGuideCountTimer)
                this.runStart()
            }
        },1000)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 
        wx.startLocationUpdate({
            success: (res) => {},
            fail: (err) => {
              console.log(err);
            },
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        console.log('跑步页面隐藏')
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        console.log('跑步页面卸载')
        clearInterval(this.data.runTimer)
        clearInterval(this.data.runGuideCountTimer)
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