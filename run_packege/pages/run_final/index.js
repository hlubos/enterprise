// run_packege/pages/run_final/index.js
import QRCode from '../../utils/weapp.qrcode.esm.js'
import api from '../../server/run'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pointsList:[
            {latitude: 39.92082670727589, longitude: 116.45972113140078},
            {latitude: 39.91969152455693, longitude: 116.45824098264075},
            {latitude: 39.918815446766494, longitude: 116.45906686269245},
            {latitude: 39.918819559649585, longitude: 116.46201643477343},
            {latitude: 39.91888536875896, longitude: 116.46379690325648},
            {latitude: 39.92053468755771, longitude: 116.46533852409834},
            {latitude: 39.92178501759332, longitude: 116.46510255838098},
            {latitude: 39.92094598280662, longitude: 116.46653980413635},
        ],
        polylines:[
            {
                points: [
                    {latitude: 39.92082670727589, longitude: 116.45972113140078},
                    {latitude: 39.91969152455693, longitude: 116.45824098264075},
                    {latitude: 39.918815446766494, longitude: 116.45906686269245},
                    {latitude: 39.918819559649585, longitude: 116.46201643477343},
                    {latitude: 39.91888536875896, longitude: 116.46379690325648},
                    {latitude: 39.92053468755771, longitude: 116.46533852409834},
                    {latitude: 39.92178501759332, longitude: 116.46510255838098},
                    {latitude: 39.92094598280662, longitude: 116.46653980413635},
                ],//是一个数组形式的坐标点[{lat,log}]
                color:"#4CDDB4",//线条的颜色
                width: 5,//宽度
                arrowLine: true,//是否带箭头
                borderWidth:0//线的边框宽度，还有很多参数，请看文档 
            }
        ]
    },
    handleMap(e){
        console.log(e.detail)
    },
    // 生成二维码
    createQrcode() {
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        api.runnerFinishDetail({
            sport_type: 0
        }).then(res=>{
            console.log(res)
            if(res.code == 0){
                
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let mapFinalCtx = wx.createMapContext('run-final-map',this) // mapId对应地图id属性
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