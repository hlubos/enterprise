// plugin/pages/run_page/index.js
import { 
    getLocation , 
    onLocationChange , 
    offLocationChange,
    startLocationUpdate,
    redirectTo,
    navigateBack,
    stopLocationUpdate,
    startLocationUpdateBackground,
    createInnerAudioContext,
    setStorage,
    setStorageSync,
    getStorageSync,
    removeStorageSync,
    removeStorage,
    showModal,
    hideLoading,
    startAccelerometer,
    stopAccelerometer,
    onAccelerometerChange,
    offAccelerometerChange,
} from '../../utils/wxApi'
import myFormats from '../../utils/format'
import api from '../../server/run'
// const backgroundAudioManager = wx.getBackgroundAudioManager()
let innerAudioContext = createInnerAudioContext(true)
innerAudioContext.autoplay = true
let runGuideCountTimer
Page({
    data: {
        setInfo:{
            // 是否语音播报
            openVoice:true,
            // 播报类型(暂时只有一种)
            voiceIndex:0,
            // 语音播报频率
            freIndex:[0,0],
            // 地图样式
            mapStyle: {
                subkey: 'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
                // 'subkey':'V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J',
                'layer-style': '1',
            }
        },
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
        // 跑步类型 类型id(0:室外跑; 1:室内跑; 2:自动记步; 3: 骑行)
        kind_id:0,
        // 跑步开始时间(时间戳)
        runStartTime: 0,
        // 跑步结束时间(时间戳)
        runEndTime: 0,
        // 跑步持续时间(秒)
        runTime:0,
        // 跑步距离(米m)
        runMiles:0,
        // 消耗卡路里
        calorie: 0,
        // 跑步计时器
        runTimer:null,
        // 位置获取计时器
        locaTimer:null,
        // 跑步显示的数据
        runShowData:{
            // 公里数
            runKmiles:'0.00',
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
        canGetLocation:false,
        // 超出一公里的距离
        outMiles: 0,
        // 超出一公里的时间
        outTime: 0,
        // 当前是第几公里
        kmilesCount: 1,
        // 播报：
        reportData:{
            // 时间频率（秒）
            audiotime: 600,
            // 距离频率（米）
            audioDistance: 500,
            // 下次播报的时间（秒）
            nextTime:600,
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
    runAudioReport(){
        if(this.data.setInfo.openVoice == true){
            let auidos = []
            // 播报频率 ['按距离播报', '按时间播报'] ['10分钟', '20分钟', '30分钟', '40分钟'] ['0.5公里', '1公里', '2公里', '3公里']
            if(this.data.setInfo.freIndex[0] == 0){
                // 按距离播报
                if(this.data.runMiles >= this.data.reportData.nextDistance){
                    auidos.push('ninyijingpaole')
                    let kMiles = this.data.reportData.nextDistance/1000
                    if(kMiles % 1 != 0){
                        let karr = String(kMiles).split('.')
                        auidos = [...auidos,...[karr[0],'dian',karr[1]]]
                    }else {
                        auidos = [...auidos,...[kMiles]]
                    }
                    auidos.push('gongli')
                    this.setData({
                        'reportData.nextDistance': this.data.reportData.nextDistance + this.data.reportData.audioDistance
                    })
                }
            }else if(this.data.setInfo.freIndex[0] == 1){
                // 按时间播报
                if(this.data.runTime >= this.data.reportData.nextTime ){
                    auidos.push('ninyijingpaole')
                    let h = parseInt(this.data.reportData.nextTime/3600)
                    let m = this.data.reportData.nextTime/60 - h*60
                    let timeArr = [h,m]
                    timeArr.forEach((item,index)=>{
                        if(item % 10 == 0){
                            if(item == 0){
                                auidos = [...auidos,...[0]]
                            }else if(item == 10){
                                auidos = [...auidos,...[10]]
                            }else if (item > 10){
                                let f = item/10
                                auidos = [...auidos,...[f,10]]
                            }
                        }else if(item % 10 != 0){
                            if(item < 10){
                                auidos = [...auidos,...[item]]
                            }else if(item > 10 && item < 20){
                                let l = item%10
                                auidos = [...auidos,...[10,l]]
                            }else if(item > 20){
                                let f = parseInt(item/10)
                                let l = item%10
                                auidos = [...auidos,...[f,10,l]]
                            }
                        }
                        if(index == 0){
                            auidos.push('xiaoshi')
                        }else if (index == 1){
                            auidos.push('fenzhong')
                        }
                    })
                    this.setData({
                        'reportData.nextTime': this.data.reportData.nextTime + this.data.reportData.audiotime
                    })
                    // 播放语音
                }
            }
            const play = createInnerAudioContext(true)
            let index = 0
            play.src = `pages/run/assets/voice/hiking/${auidos[index]}.mp3`
            play.autoplay = true
            play.onEnded(()=>{
                index++
                play.src = `pages/run/assets/voice/hiking/${auidos[index]}.mp3`
            })
        }
    },
    // 获取跑步数据可视化信息
    getRunShowData(){
        // 跑步公里数
        let runKmiles = myFormats.clip(this._calculateRunMiles(this.data.locaDotArr)/1000)
        if(runKmiles == 0){
            runKmiles == '0.00'
        }
        let runMiles = this._calculateRunMiles(this.data.locaDotArr)
        this.setData({
            runMiles:runMiles,
        })
        // 每公里缓存一次配速(秒/公里)
        let cut = parseInt(runMiles / 1000) + 1
        let outMiles = runMiles % 1000
        if( cut > this.data.kmilesCount){
            this.setKmilesCache()
            this.setData({
                kmilesCount: this.data.kmilesCount+1,
                outTime:0,
            })
        }
        // 跑步时长
        let sumTime = myFormats.secTranlateTime(this.data.runTime)
        // 平均配速
        let avePace = myFormats.formatAvg(this.data.runTime,runMiles)
        // 消耗千卡
        let kiloCalorie = (55 * 1.036 * (runMiles / 1000)).toFixed(1);
        // 消耗卡路里
        let calorie = 55 * 1.036 * runMiles
        this.setData({
            "runShowData.runKmiles":runKmiles,
            "runShowData.sumTime":sumTime,
            "runShowData.avePace":avePace,
            "runShowData.kiloCalorie":kiloCalorie,
            calorie:calorie,
            outMiles:outMiles,
        })
        // 语音播报
        this.runAudioReport()
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
        startAccelerometer().then(res=>{
            this.setData({
                runStatus:0
            })
        })
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
                runTime:second,
                outTime:this.data.outTime+1,
            })
            // 跑步时长+1
            // let sumTime = myFormats.secTranlateTime(this.data.runTime)
            // this.setData({
            //     "runShowData.sumTime":sumTime,
            // })
            // 更新跑步信息
            that.getRunShowData()
            // 缓存跑步数据
            that.setRunDataCache()
        },1000)
        that.setData({
            runTimer:runTimer
        })
        // 监听加速度数据事件
        onAccelerometerChange((absObj)=>{
            // if(this.data.accFlag  == true){
            //     return false
            // }
            // console.log("开始监听加速度")
            // this.setData({
            //     accFlag:true
            // })
            // 判断离上一次获取位置的时间是否超过5s    //判断手机是否移动
            // if((Math.abs(absObj.x) > 0.07 && Math.abs(absObj.y) > 0.02)){
            //     console.log("手机抖动")
            //     console.log(absObj)
            // }
            this.setData({
                x:absObj.x,
                y:absObj.y,
            })
        })
        // 开启监听位置变化，5秒返回一次结果
        // stopLocationUpdate()
        startLocationUpdateBackground().then(res=>{
            // console.log(res)
            onLocationChange(this._mylocationChangeFn)
        })
    },
    // 监听位置变化的操作
    _mylocationChangeFn(res){
        if(!(Math.abs(this.data.x) > 0.07 && Math.abs(this.data.y) > 0.02)){
            return false
        }
        // 判断离上一次获取位置的时间是否超过5s    //判断手机是否移动
        if(!this.data.canGetLocation){
            return false
        }
        // 判断当前点位与上个点位的距离是否超过10m 小于75m
        if(this.data.locaDotArr.length > 0){
            let finalDoc = this.data.locaDotArr[this.data.locaDotArr.length-1]
            let dic = myFormats.calcDistance(res.longitude,res.latitude,finalDoc.longitude,finalDoc.latitude)
            if(dic<=10 || dic>=75){
                return false
            }
            // 判断速度是否异常
            if(res.speed == 0){
                return false
            }
            // console.log('dic',dic)
            // console.log('horizontalAccuracy',res.horizontalAccuracy)
        }
        // console.log('speed',res.speed)
        // 时间5s,移动距离超过10m,可以获取点位信息
        this.setData({
            canGetLocation: false
        })
        // console.log(res)
        let locaDotArr = this.data.locaDotArr
        let pointObj = {
            runner_id: '',
            point_id: '',
            longitude: res.longitude,
            latitude: res.latitude,
            time: new Date().getTime(),
        }
        locaDotArr.push(pointObj)
        this.setData({
            locaDotArr:locaDotArr
        })
        var locaTimer = setTimeout(()=>{
            // 5秒才能获取一次当前位置
            this.setData({
                canGetLocation: true
            })
            // this.getRunShowData()
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
        innerAudioContext.src = "pages/run/assets/voice/hiking/yundongyizanting.mp3"
        this.setData({
            runStatus:1
        })
        // 关闭定位追踪
        offLocationChange(this._mylocationChangeFn)
        stopLocationUpdate().then(res=>{
            // console.log("停止追踪", res);
        })
        stopAccelerometer()
        offAccelerometerChange()
        // this.setData({
        //     accFlag:false
        // })
    },
    // 继续跑步
    runContinue(){
        this.setData({
            runStatus:0
        })
        this.runStart()
        innerAudioContext.src = "pages/run/assets/voice/hiking/yundongyihuifu.mp3"
    },
    // 结束跑步
    async runStop(){
        // 读取缓存的轨迹数组，没有移动则不允许结算
        let user_id = getStorageSync('user_id')
        let key = 'run_data_'+user_id
        let kMilesCacheData = getStorageSync(key)
        if(!kMilesCacheData.locaDotArr || kMilesCacheData.locaDotArr.length < 2 || this.data.runMiles <= 10){
            showModal('您的移动距离过短，数据将不会被保存','是否退出跑步？').then(async res=>{
                if(res.confirm){
                    // 清除运动数据缓存
                    let user_id = getStorageSync('user_id')
                    let storageKey = 'run_kmiles_pace_arr_' + user_id
                    // await removeStorage(storageKey)
                    // await removeStorage(key)
                    setStorageSync(storageKey,[])
                    setStorageSync(key,{})
                    // removeStorageSync(storageKey)
                    // removeStorageSync(key)
                    // 清除定时器
                    clearInterval(this.data.runTimer)
                    innerAudioContext.src = "pages/run/assets/voice/paobujieshu.mp3"
                    this.setData({
                        runTime:0,
                        runStatus:2,
                    })
                    // 关闭定位追踪
                    offLocationChange(this._mylocationChangeFn)
                    stopLocationUpdate().then(res=>{
                        // console.log("停止追踪", res);
                    })
                    stopAccelerometer()
                    offAccelerometerChange()
                    // this.setData({
                    //     accFlag:false
                    // })
                    navigateBack()
                }else{
                    return false
                }
            })
            return false
        }
        // 缓存最后一公里的配速
        this.setKmilesCache(false)
        // 跑步结束时间
        let runEndTime = parseInt(new Date().getTime()/1000)
        this.setData({
            runEndTime,
        })
        this.setRunDataCache()
        // 上报跑步数据
        let params = {
            kind_id:0,
            distance:this.data.runMiles,
            cost_time:this.data.runTime,
            // time:this.data.runStartTime,
            time:runEndTime,
            caloric:this.data.calorie,
            run_source:"wx_mini_program",
            // 步数(可不传)
            // u_steps:100,
        }
        if(this.data.runTime == 0 || this.data.runMiles == 0){
            params.avg_pace = 0
            params.avg_speed = 0
        }else {
            // 配速(秒/公里)
            params.avg_pace = (this.data.runTime/(this.data.runMiles/1000)).toFixed(2)
            // 均速(公里/小时)
            params.avg_speed = ((this.data.runMiles/1000)/(this.data.runTime/3600)).toFixed(2)
        }
        // console.log('avg_pace',params.avg_pace)
        // console.log('avg_speed',params.avg_speed)
        api.reportRunnerInfo(params).then(res=>{
            // console.log(res)
            // 获取runner_id
            let runId = res.runner_id
            // 上传轨迹点信息
            api.reportRunnerPathData({
                runner_id: runId.toString(),
                detail: JSON.stringify(this.data.locaDotArr),
            }).then(res=>{})
            if(res.code == 0){
                // 清除定位，时间置零
                clearInterval(this.data.runTimer)
                // innerAudioContext.src = "run_packege/assets/voice/paobujieshu.mp3"
                this.setData({
                    runTime:0,
                    runStatus:1,
                })
                // 关闭定位追踪
                offLocationChange(this._mylocationChangeFn)
                stopLocationUpdate().then(res=>{
                    // console.log("停止追踪", res);
                })
                stopAccelerometer()
                offAccelerometerChange()
                // 跳转到跑步结算页
                let runner_id = res.runner_id
                redirectTo(`../run_final/index?runner_id=${runner_id}`)
            }
        })
        // redirectTo('../run_final/index')
    },
    // 缓存运动数据
    setRunDataCache(){
        let user_id = getStorageSync('user_id')
        let storageKey = 'run_data_' + user_id
        setStorage(storageKey,{
            kind_id:this.data.kind_id,
            // 跑步持续时间(秒)
            runTime:this.data.runTime,
            // 跑步轨迹点数组
            locaDotArr:this.data.locaDotArr,
            // 跑步开始时间(时间戳)
            runStartTime: this.data.runStartTime,
            // 跑步结束时间(时间戳)
            runEndTime: this.data.runEndTime,
            // 跑步距离(米m)
            runMiles:this.data.runMiles,
            // 消耗卡路里
            calorie: this.data.calorie,
            // 最新一公里的跑步时间
            outTime: this.data.outTime,
        })
    },
    // 缓存每公里配速
    setKmilesCache(flag = true){
        let user_id = getStorageSync('user_id')
        let key = 'run_kmiles_pace_arr_'+user_id
        let oldArr = []
        if(getStorageSync(key)){
            oldArr = getStorageSync(key)
            // console.log(oldArr)
        }
        let newData = {
            kmiles_cut: this.data.kmilesCount,
            usetime: this.data.outTime,
            outMiles: this.data.outMiles,
        }
        if(flag == true){
            // 最后结束时的缓存
            newData.avg_pace = this.data.outTime
        }else if(flag == false){
            // 正常每公里缓存
            newData.avg_pace = this.data.outTime/this.data.outMiles*1000
        }
        let newArr = [...oldArr,newData]
        setStorage(key,newArr)
    },
    // 读取每公里配速缓存
    getKmilesCache(){
        let user_id = getStorageSync('user_id')
        let key = 'run_kmiles_pace_arr_'+user_id
        let kMilesCacheData = getStorageSync(key)
        return kMilesCacheData
    },
    // 获取缓存数据
    getRunDataCache(){
        let user_id = getStorageSync('user_id')
        let storageKey = 'run_data_' + user_id
        try {
            let cacheData = getStorageSync(storageKey)
            if(cacheData){
                // console.log(cacheData)
                // console.log("上次运动未完成")
            }else {
                // console.log("上次运动已完成")
            }
            return cacheData
        } catch (e) { }
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
                    'setInfo.voiceIndex':res.voiceIndex,
                    'setInfo.freIndex':res.freIndex,
                })
                // 根据缓存的播报频率，设置播报频率和下一次播报的时间
                if(res.freIndex[0] == 0){
                    let audioDistance = 500
                    let nextDistance = 500
                    switch (res.freIndex[1]) {
                        case 0:
                            audioDistance = 500
                            break;
                        case 1:
                            audioDistance = 1000
                            break;
                        case 2:
                            audioDistance = 2000
                            break;
                        case 3:
                            audioDistance = 3000
                            break;
                        default:
                            audioDistance = 500
                            break;
                    }
                    nextDistance = (parseInt(this.data.runMiles/audioDistance)+1)*audioDistance
                    this.setData({
                        'reportData.audioDistance':audioDistance,
                        'reportData.nextDistance':nextDistance,
                    })
                }else if(res.freIndex[0] == 1){
                    let audiotime = 600
                    let nextTime = 600
                    switch (res.freIndex[1]) {
                        case 0:
                            audiotime = 600
                            break;
                        case 1:
                            audiotime = 1200
                            break;
                        case 2:
                            audiotime = 1800
                            break;
                        case 3:
                            audiotime = 2400
                            break;
                        default:
                            audiotime = 600
                            break;
                    }
                    nextTime = (parseInt(this.data.runTime/audiotime)+1)*audiotime
                    this.setData({
                        'reportData.audiotime':audiotime,
                        'reportData.nextTime':nextTime,
                    })
                }
            }else {
                let audioDistance = 500
                let nextDistance = (parseInt(this.data.runMiles/audioDistance)+1)*audioDistance
                this.setData({
                    'reportData.audioDistance':audioDistance,
                    'reportData.nextDistance':nextDistance,
                })
            }
            // console.log(this.data.mapStyle.subkey)
        } catch (e) { }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this
        // 获取初始位置信息
        getLocation('gcj02').then(res=>{
            // console.log(res)
            const latitude = res.latitude
            const longitude = res.longitude
            // console.log(latitude,longitude)
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
        // 查看缓存，是否有上次未完成的运动
        let cacheData = this.getRunDataCache()
        // 有残留的运动记录时
        if(cacheData && JSON.stringify(cacheData)!='{}'){
            // console.log(cacheData)
            // console.log("上次运动未完成")
            let { calorie,kind_id,locaDotArr,runMiles,runStartTime,runTime,outTime } = cacheData
            this.setData({
                calorie,
                kind_id,
                locaDotArr,
                runMiles,
                runStartTime,
                runTime,
                outTime,
            })
            // 查看每公里配速缓存
            let kMilesCache = this.getKmilesCache()
            if(kMilesCache && JSON.stringify(kMilesCache)!='[]'){
                this.setData({
                    kmilesCount: kMilesCache[kMilesCache.length-1].kmiles_cut + 1
                })
            }
            // 读取跑步设置缓存
            this.getRunSetCache()
            // 
            this.runStart()
            // innerAudioContext.src = "run_packege/assets/voice/kaishipaobu.mp3"
            innerAudioContext.src = "pages/run/assets/voice/kaishipaobu.mp3"
        }else {
            // 没有残留的运动记录时
            // console.log("上次运动已完成")
            this.setData({
                guidePageShow:false
            })
            // 开启跑步引导页
            this.setData({
                guidePageShow:true,
                runGuideCount: 3,
            })
            // if(this.data.runGuideCount == 3){
            //     innerAudioContext.src = "pages/run/assets/voice/3.mp3"
            // }
            // 开始倒计时
            let c = 0
            runGuideCountTimer = setInterval(()=>{
                this.setData({
                    runGuideCountTimer:runGuideCountTimer
                })
                if( c % 1000 == 0 && c > 0 && c < 3000 ){
                    this.setData({
                        runGuideCount: this.data.runGuideCount - 1
                    })
                }
                if(c == 0){
                    innerAudioContext.src = "pages/run/assets/voice/3.mp3"
                }else if( c == 1000 ){
                    innerAudioContext.src = "pages/run/assets/voice/2.mp3"
                }else if(c == 2000){
                    innerAudioContext.src = "pages/run/assets/voice/1.mp3"
                }else if(c == 3000){
                    this.setData({
                        guidePageShow:false,
                        runStartTime: parseInt(new Date().getTime()/1000)
                    })
                    clearInterval(this.data.runGuideCountTimer)
                    this.runStart()
                    innerAudioContext.src = "pages/run/assets/voice/kaishipaobu.mp3"
                }
                c += 10
                // if(this.data.runGuideCount == 2){
                //     innerAudioContext.src = "pages/run/assets/voice/2.mp3"
                // }else if(this.data.runGuideCount == 1){
                //     innerAudioContext.src = "pages/run/assets/voice/1.mp3"
                // }
                // 倒计时结束后隐藏引导页，设置跑步开始时间,清除定时器，开始跑步计时
                // if(this.data.runGuideCount == 0){
                //     this.setData({
                //         guidePageShow:false,
                //         runStartTime: parseInt(new Date().getTime()/1000)
                //     })
                //     clearInterval(this.data.runGuideCountTimer)
                //     this.runStart()
                //     innerAudioContext.src = "pages/run/assets/voice/kaishipaobu.mp3"
                // }
            },10)
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        innerAudioContext = createInnerAudioContext(true)
        innerAudioContext.autoplay = true
        // 读取跑步设置缓存
        this.getRunSetCache()
        hideLoading()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        // console.log('跑步页面隐藏')
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        // showModal('您的运动记录将不会被保存','是否退出跑步？').then(res=>{
        //     if(res.confirm){
        //         // 清除运动数据缓存
        //         let user_id = getStorageSync('user_id')
        //         let storageKey = 'run_data_' + user_id
        //         removeStorageSync(storageKey)
        //         console.log('跑步页面卸载')
        //         // 清除定时器
        //     }else{
        //         return false
        //     }
        // })
        innerAudioContext.destroy() 
        clearInterval(runGuideCountTimer)
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