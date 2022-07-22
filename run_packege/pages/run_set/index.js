// plugin/pages/run_set/index.js
import { getNetworkType } from '../../utils/wxApi'
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
        netType:''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 检查网络类型
        checkNet(){
            getNetworkType().then(res=>{
                console.log(res)
                this.setData({
                    netType:res.networkType
                })
            })
        }
    }
})
