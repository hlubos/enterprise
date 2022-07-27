// plugin/pages/run_set/index.js
import { getNetworkType,setStorage,getStorage,setStorageSync,getStorageSync } from '../../utils/wxApi'
Page({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        // 是否开启语音播报
        openVoice: true,
        // 网络状态
        netType:'',
        // 当前语音类型索引
        voiceIndex: 1,
        // 当前播报频率索引
        freIndex: [0,1],
        // 语音类型列表
        voiceList: ['国语女声', '国语男声', '英语女声', '英语男声'],
        // 播报频率 ['10分钟', '20分钟', '30分钟', '40分钟']
        frequencyArray: [['按距离播报', '按时间播报'], ['0.5公里', '1公里', '2公里', '3公里']],
        // 地图样式列表
        mapStyleList:[
            {
                title:"经典",
                icon:"https://ssl-pubpic.51yund.com/1223520672.png",
                mapStyInfo:{
                    "subkey":"L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2",
                    "layer-style":"1",
                }
            },
            {
                title:"白浅",
                icon:"https://ssl-pubpic.51yund.com/1223520701.png",
                mapStyInfo:{
                    "subkey":"L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2",
                    "layer-style":"2",
                }
            },
            {
                title:"玉露",
                icon:"https://ssl-pubpic.51yund.com/1223520743.png",
                mapStyInfo:{
                    "subkey":"L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2",
                    "layer-style":"3",
                }
            },
            {
                title:"烟翠",
                icon:"https://ssl-pubpic.51yund.com/1223520762.png",
                mapStyInfo:{
                    // subkey:'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
                    "subkey":"V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J",
                    "layer-style":"1",
                }
            },
            {
                title:"澹月",
                icon:"https://ssl-pubpic.51yund.com/1223520780.png",
                mapStyInfo:{
                    // subkey:'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
                    "subkey":"V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J",
                    "layer-style":"2",
                }
            },
            {
                title:"墨渊",
                icon:"https://ssl-pubpic.51yund.com/1223520834.png",
                mapStyInfo:{
                    // subkey:'L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2',
                    "subkey":"V5JBZ-RY5EJ-Z7AFP-FP7OM-YXSFE-P7F4J",
                    "layer-style":"3",
                }
            },
        ],
        // 当前地图样式
        nowMapStyInfo:{
            "subkey":"L4JBZ-YJ56D-GAO47-P6UQY-ODB46-M2FD2",
            "layer-style":"2",
        }
    },
    // 缓存设置的数据
    cacheSetData(){
        try {
            setStorageSync('run_set_infos',{
                openVoice:this.data.openVoice,
                voiceIndex:this.data.voiceIndex,
                freIndex:this.data.freIndex,
                nowMapStyInfo:this.data.nowMapStyInfo,
            })
        } catch (e) { }
    },
    // 语音播报开关
    switchVoice(e){
        // console.log(e.detail)
        this.setData({
            openVoice: e.detail.value
        })
        this.cacheSetData()
    },
    // 检查网络类型
    checkNet(){
        getNetworkType().then(res=>{
            console.log(res)
            this.setData({
                netType:res.networkType
            })
        })
    },
    // 设置地图样式
    selectMapSty(e){
        // console.log(e.currentTarget.dataset.key)
        let mapStyInfo = e.currentTarget.dataset.key.mapStyInfo
        this.setData({
            nowMapStyInfo: mapStyInfo
        })
        this.cacheSetData()
    },
    // 播报类型改变
    voiceChange(e){
        this.setData({
            voiceIndex: e.detail.value
        })
        this.cacheSetData()
    },
    // 播报频率改变
    freChange(e){
        this.setData({
            freIndex: e.detail.value
        })
        this.cacheSetData()
    },
    // 选择播报频率列改变时触发
    freColumnChange(e){
        if(e.detail.column == 0){
            if(e.detail.value == 0){
                this.setData({
                    "frequencyArray[1]":['0.5公里', '1公里', '2公里', '3公里']
                })
            }else if(e.detail.value == 1){
                this.setData({
                    "frequencyArray[1]":['10分钟', '20分钟', '30分钟', '40分钟']
                })
            }
        }
    },
    // 选择播报频率取消时
    freCancel(e){
        this.setData({
            freIndex:this.data.freIndex
        })
        if(this.data.freIndex[0] == 0){
            this.setData({
                "frequencyArray[1]":['0.5公里', '1公里', '2公里', '3公里']
            })
        }else if(this.data.freIndex[0] == 1){
            this.setData({
                "frequencyArray[1]":['10分钟', '20分钟', '30分钟', '40分钟']
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        try {
            let value = getStorageSync('run_set_infos')
            console.log(value)
        } catch (e) { }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        
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
