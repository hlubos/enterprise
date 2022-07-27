// plugin/pages/run_log/index.js
import api from '../../server/run'
import myFormats from '../../utils/format'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total_cnt: 0,
        total_cost_time: '0:00:00',
        total_distance: '0.00',
        total_caloric: '0.0',
        begin_cnt: 0,
        end_cnt: 20,
        runLogList:[],
        // 节流阀
        canLoadData:true,
    },
    // 加载数据
    loadData(){
        if(!this.data.canLoadData){
            return false
        }
        this.setData({
            canLoadData: false
        })
        console.log("加载数据")
        let params = {
            user_id:284209535,
            begin_cnt: this.data.begin_cnt,
            end_cnt: this.data.end_cnt,
        }
        api.getRunnerInfo(params).then(res=>{
            if(res.code == 0){
                console.log(res)
                let infosLen = res.infos.length
                let newInfos = res.infos
                for(let i = 0;i<newInfos.length;i++){
                    newInfos[i].time = myFormats.formatDate(newInfos[i].time,'yyyy/MM/dd hh:mm:ss')
                }
                this.setData({
                    total_cnt: res.total_cnt,
                    total_cost_time: myFormats.secTranlateTime(res.total_cost_time),
                    // total_cost_time: res.total_cost_time,
                    total_distance: (res.total_distance/1000).toFixed(2),
                    total_caloric: (55 * 1.036 * (res.total_distance / 1000)).toFixed(1),
                    begin_cnt: this.data.begin_cnt + infosLen,
                    end_cnt: this.data.end_cnt + infosLen,
                })
                if(this.data.runLogList.length == 0){
                    this.setData({
                        runLogList: newInfos,
                    })
                }else if(this.data.runLogList.length > 0){
                    this.setData({
                        runLogList: [...this.data.runLogList,...newInfos],
                    })
                }
                this.setData({
                    canLoadData: true
                })
            }
        })
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
        this.loadData()
        // myFormats.formatDate(1646209697,'yyyy/MM/dd hh:mm:ss')
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