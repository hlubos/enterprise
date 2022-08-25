// pages/tabBar/home/run_homePage/run_homePage.js
import { 
    getSetting,
    getLocation,
    authorize,
    openSetting,
    startLocationUpdateBackground,
    navigateTo,
    navigateBack,
    getStorageSync,
    setStorageSync,
    showToast,
    showModal,
    showLoading,
    hideLoading,
    removeStorageSync,
    removeStorage,
} from '../../../../common/wxApi.js'
import api from '../../../../server/run'

import tool from '../../../../common/tool'
import loginApi from '../../../../server/login'

const app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        
    },

    /**
     * 组件的初始数据
     */
    data: {
        loading:false,
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
        showRunCheckModal: false,
        // 显示跑步异常中断弹框
        showRunBreakDialog:false,
        // 地图样式
        mapStyle:{
            subkey:'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
            // 'subkey':'V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J',
            'layer-style':'1'
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 授权地理定位
        toastAuthUserLocation(){
            getSetting().then(res=>{
                if(res.authSetting.hasOwnProperty('scope.userLocation')){
                    openSetting().then(res=>{
                        this.setData({
                            "auth.hasAuthUserLocation":res.authSetting['scope.userLocation']
                        })
                    })
                }else{
                    authorize({
                        scope:'scope.userLocation'
                    }).then(res=>{
                        this.setData({
                            "auth.hasAuthUserLocation":true,
                        })
                    }).catch(rej=>{
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
                        // console.log(res)
                        this.setData({
                            "auth.hasAuthUserLocation":res.authSetting['scope.userLocation'],
                            "auth.hasAuthUserLocationBackground":res.authSetting['scope.userLocationBackground'],
                        })
                    })
                }else{
                    // 调用授权API
                    authorize({
                        scope:'scope.userLocationBackground'
                    }).then(res=>{
                        // 用户点击允许前台定位权限会被授予，后台定位权限用户不一定会授予
                        this.setData({
                            "auth.hasAuthUserLocation":true
                        })
                        // 用户点击允许后调用API查看用户是否勾选后台权限。
                        getSetting().then(res=>{
                            if(res.authSetting["scope.userLocationBackground"] == true){
                                // console.log('已授权后台定位')
                                this.setData({
                                    "auth.hasAuthUserLocationBackground":true
                                })
                            }
                        })
                    }).catch(rej=>{
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
            // this.selectComponent('#runTypeModal').showFrame();
            // 运动前首先检查权限是否满足，权限满足则允许跑步，不满足则弹出弹框（去设置）
            getSetting().then(res=>{
                // console.log(res)
                if(res.authSetting['scope.userLocation'] != true || res.authSetting['scope.userLocationBackground'] != true){
                    showModal({title:'未授权后台定位',content:'是否前往设置？'}).then(res=>{
                        if(res.confirm){
                            openSetting().then(ress=>{
                                this.setData({
                                    "auth.hasAuthUserLocation":ress.authSetting['scope.userLocation'],
                                    "auth.hasAuthUserLocationBackground":ress.authSetting['scope.userLocationBackground'],
                                })
                            })
                        }
                    })
                }else {
                    this.setData({
                        showRunCheckModal: true
                    })
                }
            })
        },
        // 返回上一页
        back(){
            navigateBack()
        },
        // 进入跑步页面
        gotoRunPage(){
            // 室内跑暂未开发
            if(this.data.runType == 1){
                showToast({
                    title:'敬请期待!',
                    icon:'none',
                    duration:1500,
                })
                this.setData({
                    showRunCheckModal: false
                })
                return false
            }
            // let that = this
            // that.selectComponent('#runTypeModal').hideFrame();
            // this.setData({
            //     showRunCheckModal: false
            // })
            navigateTo({
                url:'/pages/run/pages/run_page/index'
            })
            // hideLoading()
        },
        // 放弃跑步
        async giveUpRun(){
            // 清缓存
            this.setData({
                showRunBreakDialog: false
            })
            // 清除运动数据缓存
            let user_id = getStorageSync('user_id')
            let storageKey = 'run_data_' + user_id
            let key = 'run_kmiles_pace_arr_'+user_id
            setStorageSync(storageKey,{})
            setStorageSync(key,[])
        },
        // 继续跑步
        continueRun(){
            // 不清缓存
            showLoading({
                title:'跑步加载中...',
                mask:true,
            })
            this.setData({
                showRunBreakDialog: false
            })
            // 跳转到跑步页面
            navigateTo({
                url:'/pages/run/pages/run_page/index'
            })
        },
        // 获取缓存数据,读取缓存查看是否存在未完成的运动
        getRunDataCache(){
            try {
                let user_id = getStorageSync('user_id')
                let storageKey = 'run_data_' + user_id
                let cacheData = getStorageSync(storageKey)
                if(!cacheData || JSON.stringify(cacheData) == '{}'){
                    return false
                }else {
                    this.setData({
                        showRunBreakDialog: true
                    })
                }
            } catch (e) { }
        },
        // 读取跑步设置缓存
        getRunSetCache(){
            try {
                let user_id = getStorageSync('user_id')
                let storageKey = 'run_set_infos_' + user_id
                let res = getStorageSync(storageKey)
                if(res){
                    this.setData({
                        mapStyle:res.nowMapStyInfo
                    })
                }
            } catch (e) { }
        },
        // 读取用户缓存，判断是否为新用户
        judgeNewUser(){
            let user_id = getStorageSync('user_id')
            let storageKey = 'isNewUser_' + user_id
            let res = getStorageSync(storageKey)
            if(res != 1){
                // 新用户，跳转到常见问题（引导）页
                navigateTo({
                    url:'/pages/run/pages/run_FAQ/index'
                })
            }
        },
        // 页面初始化
        initPage(){
            // 页面数据初始化
            // 在组件在视图层布局完成后执行
            getSetting().then(res=>{
                // console.log(res)
                if(!res.authSetting["scope.userLocation"]){
                    // console.log('未授权地理位置')
                    this.setData({
                        "auth.hasAuthUserLocation":false
                    })
                }
                if(!res.authSetting["scope.userLocationBackground"]){
                    // console.log('未授权后台定位')
                    this.setData({
                        "auth.hasAuthUserLocationBackground":false
                    })
                }
            })
            this.setData({
                showRunCheckModal: false
            })
            if(getStorageSync("user_id") && getStorageSync("user_id") !== 0 ){
                // 获取累计公里数
                let params = {
                    // user_id:284209535,
                    sport_type:0,
                    time_range:'all',
                }
                api.userSportSummary(params).then(res=>{
                    if(res.code == 0){
                        this.setData({
                            // totalDistance:(res.total_distance/1000).toFixed(2)
                            totalDistance:Number(parseFloat(res.summary_detail.sum_distance/1000).toFixed(3).slice(0,-1))
                        })
                    }
                })
            }
            // 读取缓存,应用设置
            this.getRunSetCache()
            // 读取缓存查看是否存在未完成的运动
            this.getRunDataCache()
            // 读缓存判断是否为新用户
            // this.judgeNewUser()
        },
        // ===============================================
        // 微信授权登录
        async getUserInfo (obj) {
            let user_id = wx.getStorageSync('user_id')
            if (user_id) {
            return
            }
            if(this.loading) return
            this.loading = true
            let userInfo = obj.userInfo;
            if (!obj.iv) {
                wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: '授权失败'
                });
                delete this.isExecuting;
                return
            } 
            if (userInfo) {
            app.globalData.userInfo = userInfo
            }
            let wxlogin = tool.promisify('login')
            try {
            let res = await wxlogin()
            if (!res.code) {
                wx.showToast({
                title: '登录失败',
                icon: 'none'
                })
                return
            }
            let params = {
                "code": res.code,
                "wxapp_source": "wx_ydenterprise",
            }
            this.goWxLogin(params)
            } catch (err) {
            } 
        },
        // 后台登录
        goWxLogin (params) {
            return loginApi.wxLogin(params).then(res => {
            this.loading = false
            if (res.code !== 0) return
            if (res.user_id > 0) { // 老用户
                this.storageWXlogin(res)
            } else { // 新用户
                this.registerNew(res.openid, obj.encryptedData, obj.iv);
            }
            })
        },
    
        // 新用户注册
        registerNew (openid, encrypted, iv) {
            let globalData = getApp().globalData;
            let param = {
                "openid": openid,
                "encrypted": encrypted,
                "iv": iv,
                "sub_channel": globalData.shareFrom,
                "wx_scene": globalData.wxScene,
                "share_id": globalData.shareFromId
            }
            loginApi.register(param).then(res=>{
            res.openid = res.open_id;//【特别注意】这里返回的是open_id不是openid
                this.storageWXlogin(res); 
            })
        },
    
        storageWXlogin(res){ 
            let loginObj = {
            session_key: res.session_key,
            user_id: res.user_id,
            xyy: res.xyy,
            openid: res.openid
            }
            wx.setStorageSync('user_id', loginObj.user_id)
            wx.setStorageSync('session_key', loginObj.session_key)
            wx.setStorageSync('openid', loginObj.openid)
            wx.setStorageSync('xyy', loginObj.xyy)
            this.triggerEvent('success', res)

            // 初始化页面
            this.initPage()
            // 读缓存判断是否为新用户
            this.judgeNewUser()
        }, 
    },
    lifetimes: {
        created(){
            // 在组件实例刚刚被创建时执行
        },
        attached: function() {
            // 在组件实例进入页面节点树时执行
            let that = this
            // 登录
            wx.login({
                success (res) {
                  if (res.code) {
                    //获取用户信息
                    // console.log(res)
                    wx.getUserInfo({
                        withCredentials:true,
                        success:(ress)=>{
                            that.getUserInfo(ress)
                        }
                    })
                  } else {
                    console.log('登录失败！' + res.errMsg)
                  }
                }
            })
            // 
            startLocationUpdateBackground().then(res=>{
                // console.log(res)
                if(res.errMsg == "startLocationUpdateBackground:ok"){
                    this.setData({
                        "auth.hasAuthUserLocation":true,
                        "auth.hasAuthUserLocationBackground":true,
                    })
                }
            })
        },
        ready(){
            this.initPage()
        },
        detached: function() {
          // 在组件实例被从页面节点树移除时执行
        },
    },
    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {
            this.initPage()
        },
        hide: function () { },
        resize: function () { },
    },
})
