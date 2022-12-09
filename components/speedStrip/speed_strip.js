// pages/run/pages/run_detail/components/speed_strip.js
// import myFormats from '../../pages/run/utils/format'
// import myFormats from '../../utils/format'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    speedDetail: Object,
    min:Number,
    max:Number
  },
  attached(){
    this.setData({
      avg_speed:this.formatAvg(this.data.speedDetail.avg_time,1000)
    })

  },
  /**
   * 组件的初始数据
   */
  data: {
    avg_speed:`0'00''`
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formatAvg(secs, miles) {
      // 走路  5km/h
      // 配速  12min/km
      // 走路大概 6min/km
      if (miles == 0) {
        return "0'00''"
      }
      
      var total_data = Math.floor((secs * 1000) / miles)
      var total_m =
        Math.floor(total_data / 60) > 59 ? 59 : Math.floor(total_data / 60)
      var lest_sec = total_data % 60
      return total_m + "'" + this.add0(lest_sec) + "''"
    },
    add0(m) {
      return m < 10 ? '0' + m : m
    }
  }
  
})
