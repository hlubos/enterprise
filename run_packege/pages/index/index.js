// plugin/pages/index/index.js
import { 
    getSetting,
    getLocation,
    authorize,
    openSetting,
    startLocationUpdateBackground,
    navigateTo 
} from '../../utils/wxApi'
import api from '../../server/run'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        totalDistance:'0.00',
        auth:{
            // 地理定位是否授权
            hasAuthUserLocation:true,
            // 后台地理定位是否授权
            hasAuthUserLocationBackground:true
        },
        // 跑步模式： '0'：室外跑 ，'1'：室内跑
        runType:'0',
        // 是否显示跑步模式选择框
        showRunCheckModal: false
    },
    // 授权地理定位
    toastAuthUserLocation(){
        getSetting().then(res=>{
            if(res.authSetting.hasOwnProperty('scope.userLocation')){
                openSetting().then(res=>{
                    // console.log(res)
                    this.setData({
                        "auth.hasAuthUserLocation":res.authSetting['scope.userLocation']
                    })
                })
            }else{
                authorize('scope.userLocation').then(res=>{
                    console.log('已授权定位')
                    this.setData({
                        "auth.hasAuthUserLocation":true,
                    })
                }).catch(rej=>{
                    console.log("定位授权失败")
                })
            }
        })
        
    },
    // 授权后台地理定位（此时后台定位权限未被授予，但是前台定位权限有可能已被授予）
    toastAuthUserLocationBac(){
        // 判断前台定位权限，如已授权则打开设置，让用户勾选后台权限。未授权则弹出授权窗口。
        getSetting().then(res=>{
            if(res.authSetting.hasOwnProperty('scope.userLocation')){
                openSetting().then(res=>{
                    console.log(res)
                    this.setData({
                        "auth.hasAuthUserLocation":res.authSetting['scope.userLocation'],
                        "auth.hasAuthUserLocationBackground":res.authSetting['scope.userLocationBackground'],
                    })
                })
            }else{
                // 调用授权API
                authorize('scope.userLocationBackground').then(res=>{
                    // 用户点击允许前台定位权限会被授予，后台定位权限用户不一定会授予
                    this.setData({
                        "auth.hasAuthUserLocation":true
                    })
                    console.log('已授权定位')
                    // 用户点击允许后调用API查看用户是否勾选后台权限。
                    getSetting().then(res=>{
                        if(res.authSetting["scope.userLocationBackground"] == true){
                            console.log('已授权后台定位')
                            this.setData({
                                "auth.hasAuthUserLocationBackground":true
                            })
                        }
                    })
                }).catch(rej=>{
                    console.log("后台定位授权失败")
                })
            }
        })
    },
    // 跑步模式选择
    selectRunType(e){
        let runType = e.currentTarget.dataset['runtype']
        this.setData({
            runType:runType
        })
    },
    // 开始运动
    startRun(){
        // 打开运动类型选择弹窗
        // this.selectComponent('#runTypeModal').showFrame();
        this.setData({
            showRunCheckModal: true
        })
    },
    // 进入跑步页面
    gotoRunPage(){
        let that = this
        // 运动前首先检查权限是否满足，权限满足则允许跑步，不满足则弹出弹框（去设置）
        getSetting().then(res=>{
            console.log(res)
            if(res.authSetting['scope.userLocation'] == true){
                // that.selectComponent('#runTypeModal').hideFrame();
                this.setData({
                    showRunCheckModal: false
                })
                navigateTo("../run_page/index").then((res)=>{
                    console.log(res)
                })
            }else{
                console.log("未授予定位权限")
                // that.selectComponent('#runTypeModal').hideFrame();
                this.setData({
                    showRunCheckModal: false
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let params = {
            user_id:13368385,
        }
        api.getRunnerInfo(params).then(res=>{
            if(res.code == 0){
                console.log(res)
                this.setData({
                    totalDistance:(res.total_distance/1000).toFixed(2)
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        getSetting().then(res=>{
            console.log(res)
            if(!res.authSetting["scope.userLocation"]){
                console.log('未授权地理位置')
                this.setData({
                    "auth.hasAuthUserLocation":false
                })
            }
            if(!res.authSetting["scope.userLocationBackground"]){
                console.log('未授权后台定位')
                this.setData({
                    "auth.hasAuthUserLocationBackground":false
                })
            }
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