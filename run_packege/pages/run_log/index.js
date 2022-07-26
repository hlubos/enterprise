// plugin/pages/run_log/index.js
import api from '../../server/run'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total_cnt: 1113,
        total_cost_time: '0:00:00',
        total_distance: '0.00',
        begin_cnt: 0,
        end_cnt: 20,
        runLogList:[1,2,3,4]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // const baseUrl = 'https://api.51yund.com'
        // wx.request({
        //     url: baseUrl+'/sport/get_runner_info', 
        //     data: {
        //         user_id: 286796971
        //     },
        //     success (res) {
        //         console.log(res.data)
        //     },
        // })
        let params = {
            user_id:13368385,
            begin_cnt: this.data.begin_cnt,
            end_cnt: this.data.end_cnt,
        }
        api.getRunnerInfo(params).then(res=>{
            if(res.code == 0){
                console.log(res)
                this.setData({
                    total_cnt: res.total_cnt,
                    total_cost_time: res.total_cost_time,
                    total_distance: (res.total_distance/1000).toFixed(2),
                    runLogList: res.infos,
                })
            }
        })
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