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
    showToast,
    showModal,
    showLoading,
    removeStorageSync,
} from '../../../../common/wxApi.js'
import api from '../../../../server/run'
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
            // this.selectComponent('#runTypeModal').showFrame();
            // 运动前首先检查权限是否满足，权限满足则允许跑步，不满足则弹出弹框（去设置）
            getSetting().then(res=>{
                console.log(res)
                if(res.authSetting['scope.userLocation'] != true || res.authSetting['scope.userLocationBackground'] != true){
                    showModal('未授权后台定位','是否前往设置？').then(res=>{
                        if(res.confirm){
                            openSetting().then(ress=>{
                                // console.log(ress)
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
                showToast('敬请期待！','none')
                this.setData({
                    showRunCheckModal: false
                })
                return false
            }
            let that = this
            // that.selectComponent('#runTypeModal').hideFrame();
            // this.setData({
            //     showRunCheckModal: false
            // })
            showLoading('跑步加载中...',true)
            navigateTo("/run_packege/pages/run_page/index").then((res)=>{
                // console.log(res)
            })
        },
        // 放弃跑步
        giveUpRun(){
            // 清缓存
            console.log("清缓存")
            this.setData({
                showRunBreakDialog: false
            })
            // 清除运动数据缓存
            let user_id = getStorageSync('user_id')
            let storageKey = 'run_data_' + user_id
            let key = 'run_kmiles_pace_arr_'+user_id
            removeStorageSync(storageKey)
            removeStorageSync(key)
        },
        // 继续跑步
        continueRun(){
            // 不清缓存
            console.log("不清缓存")
            showLoading('跑步加载中...',true)
            this.setData({
                showRunBreakDialog: false
            })
            // 跳转到跑步页面
            navigateTo("/run_packege/pages/run_page/index").then((res)=>{
                // console.log(res)
            })
        },
        // 获取缓存数据,读取缓存查看是否存在未完成的运动
        getRunDataCache(){
            try {
                let user_id = getStorageSync('user_id')
                let storageKey = 'run_data_' + user_id
                let cacheData = getStorageSync(storageKey)
                if(cacheData){
                    console.log(cacheData)
                    console.log("上次运动未完成")
                    this.setData({
                        showRunBreakDialog: true
                    })
                }else {
                    console.log("上次运动已完成")
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
                // console.log(this.data.mapStyle.subkey)
            } catch (e) { }
        },
        // 读取用户缓存，判断是否为新用户
        judgeNewUser(){
            let user_id = getStorageSync('user_id')
            let storageKey = 'isNewUser_' + user_id
            let res = getStorageSync(storageKey)
            if(res != 1){
                // 新用户，跳转到常见问题（引导）页
                navigateTo("/run_packege/pages/run_FAQ/index").then((res)=>{
                    // console.log(res)
                })
            }
        },
    },
    lifetimes: {
        created(){
            // 在组件实例刚刚被创建时执行
        },
        attached: function() {
            // 在组件实例进入页面节点树时执行
        },
        ready(){
            // 在组件在视图层布局完成后执行
        },
        detached: function() {
          // 在组件实例被从页面节点树移除时执行
        },
    },
})
