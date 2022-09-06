// plugin/pages/run_page/components/runDataPanel/runDataPanel.js
var breakUnlockTimer
var startUnlockTimer
var startStopRunTimer
var breakStopRunTimer
Component({

    behaviors: [],

    properties: {
        runShowData: {
            type: Object
        },
        runStatus: {
            type: Number
        },
        runTime: {
            type: Number
        },
        runMiles: {
            type: Number
        },
        mapPanelShow: {
            type: Boolean
        },
        stopBtnShow: {
            type: Boolean
        }
    },
    observers: {
        runTime: function() {
        },
        runMiles: function(runMiles) {
        },
    },
    data: {
        // 是否锁定
        isLock: false,
        // 解锁进度
        unlockVal: 0,
        // 结束进度
        stopRunVal: 0,
    }, // 私有数据，可用于模板渲染

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
        attached: function () {
            // var that = this;
            // that.canvasRing = that.selectComponent("#canvasRing");
            // that.canvasRing.showCanvasRing();
        },
        moved: function () { },
        detached: function () { },
    },

    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () { 
            // startLocationUpdate()
            this.setData({
                stopRunVal:0,
                unlockVal:0,
            })
        },
        hide: function () {
            this.setData({
                stopRunVal:0,
                unlockVal:0,
            })
        },
        resize: function () { },
    },

    methods: {
        // 显示地图
        showMap() {
            this.triggerEvent('showRunMap')
        },
        //跑步暂停
        runPause() {
            this.triggerEvent('runPause')
        },
        //跑步继续
        runContinue() {
            this.triggerEvent('runContinue')
        },
        // 跑步结束  
        runStop() {
            this.triggerEvent('runStop')
        },
        // 按下结束按钮
        stopRunStart(){
            clearInterval(breakStopRunTimer)
            startStopRunTimer = setInterval(()=>{
                if(this.data.stopRunVal >= 100){
                    clearInterval(startStopRunTimer)
                    this.runStop()
                }else {
                    this.setData({
                        stopRunVal:this.data.stopRunVal + 1
                    })
                }
            },10)
        },
        // 中断结束
        stopRunBreak(){
            clearInterval(startStopRunTimer)
            if(this.data.stopRunVal < 100){
                breakStopRunTimer = setInterval(()=>{
                    if(this.data.stopRunVal <= 0){
                        clearInterval(breakStopRunTimer)
                    }else {
                        this.setData({
                            stopRunVal:this.data.stopRunVal - 1
                        })
                    }
                },10)
            }else {
                this.setData({
                    stopRunVal:0
                })
            }
            
        },
        // 锁定跑步面板
        lockRunPanel() {
            this.setData({
                isLock: true
            })
        },
        // 解锁跑步面板
        unlockRunPanel() {
            this.setData({
                isLock: false
            })
        },
        // 开始解锁（按下解锁按钮时）
        unlockStart(){
            clearInterval(breakUnlockTimer)
            // let t = 0
            startUnlockTimer = setInterval(()=>{
                if(this.data.unlockVal >= 100){
                    clearInterval(startUnlockTimer)
                    this.unlockRunPanel()
                }else {
                    this.setData({
                        unlockVal:this.data.unlockVal + 1
                    })
                }
            },10)
        },
        // 中断解锁
        unlockBreak(){
            clearInterval(startUnlockTimer)
            breakUnlockTimer = setInterval(()=>{
                if(this.data.unlockVal <= 0){
                    clearInterval(breakUnlockTimer)
                }else {
                    this.setData({
                        unlockVal:this.data.unlockVal - 1
                    })
                }
            })
        },
        // 内部方法建议以下划线开头
    }
})