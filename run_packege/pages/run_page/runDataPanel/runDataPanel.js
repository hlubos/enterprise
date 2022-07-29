// plugin/pages/run_page/components/runDataPanel/runDataPanel.js
import {
    startLocationUpdate,
    startLocationUpdateBackground,
} from '../../../utils/wxApi'
Component({

    behaviors: [],

    properties: {
        runShowData: {
            type: Object
        },
        runStatus: {
            type: Number
        }
    },

    data: {
        // 是否锁定
        isLock: false,
    }, // 私有数据，可用于模板渲染

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
        attached: function () {
        },
        moved: function () { },
        detached: function () { },
    },

    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () { 
            // startLocationUpdate()
        },
        hide: function () { },
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
        }

        // 内部方法建议以下划线开头
    }
})