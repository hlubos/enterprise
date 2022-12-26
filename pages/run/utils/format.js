//两点距离
function calcDistance(lonA, latA, lonB, latB) {
  var earthR = 6371000
  const PI = 3.1415926535897932384626
  var x =
    Math.cos((latA * PI) / 180) *
    Math.cos((latB * PI) / 180) *
    Math.cos(((lonA - lonB) * PI) / 180)
  var y = Math.sin((latA * PI) / 180) * Math.sin((latB * PI) / 180)
  var s = x + y
  if (s > 1) s = 1
  if (s < -1) s = -1
  var alpha = Math.acos(s)
  var distance = alpha * earthR
  return distance
}

//时间计数器add_zero in front of
function add0(m) {
  return m < 10 ? '0' + m : m
}

//时间计数器
function format() {
  //shijianchuo是整数，否则要parseInt转换
  var time = new Date()
  var y = time.getFullYear()
  var m = time.getMonth() + 1
  var d = time.getDate()
  var h = time.getHours()
  var mm = time.getMinutes()
  var s = time.getSeconds()
  return h + ':' + add0(mm) + ':' + add0(s)
}

//秒转时间格式  4000s ->  1:12:36
function secTranlateTime(sec) {
  var h = Math.floor(sec / 3600)
  var m = Math.floor((sec % 3600) / 60)
  var s = (sec % 3600) % 60
  return h + ':' + add0(m) + ':' + add0(s)
}
//将秒格式化配速
function formatAvg(secs, miles) {
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
  return total_m + "'" + add0(lest_sec) + "''"
}

// 保留两位小数
var clip = (a) => Number(parseFloat(a).toFixed(3).slice(0, -1))

// 配速格式化（秒/公里->）
function formatShowAvg(avg_pace) {
  if (avg_pace == 0) {
    return "0'00''"
  }
  var total_m = Math.floor(avg_pace / 60) > 59 ? 59 : Math.floor(avg_pace / 60)
  var lest_sec = Math.round(avg_pace % 60)
  return total_m + "'" + add0(lest_sec) + "''"
}

// 日期格式化 日期格式重置   页面用法：{{formatDate(1646209697,'yyyy/MM/dd hh:mm')}}  返回值：'2017/08/22 18:30'
// yyyy-MM-dd hh:mm:ss
function formatDate(value, fmt) {
  if (!value) return value
  let timeSc = new Date(value * 1000)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (timeSc.getFullYear() + '').substr(4 - RegExp.$1.length),
    )
  }
  let o = {
    'M+': timeSc.getMonth() + 1,
    'd+': timeSc.getDate(),
    'h+': timeSc.getHours(),
    'm+': timeSc.getMinutes(),
    's+': timeSc.getSeconds(),
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str),
      )
    }
  }

  function padLeftZero(str) {
    return ('00' + str).substr(str.length)
  }

  return fmt
}
function processSpeedData(SpeedDate, distance, avg_pace, flag = false) {
  let obj = {}
  let maxspeedTimeArr = []
  let minspeedTimeArr = []
  let itemspeedTimeArr = []
  let maxKmIdx = SpeedDate[SpeedDate.length - 1].index
  obj.max = obj.min = SpeedDate[0]
  obj.max.speedTime = obj.min.speedTime = formatAvg(
    SpeedDate[0].avg_time,
    !SpeedDate[0].distance ? 1000 : SpeedDate[0].distance.toFixed(3),
  )
  try {
    SpeedDate.forEach((item, index) => {
      maxspeedTimeArr = obj.max.speedTime.split("'")
      minspeedTimeArr = obj.min.speedTime.split("'")
      obj.min.Progress =
        parseInt(minspeedTimeArr[0] * 60) + parseInt(minspeedTimeArr[1])
      obj.max.Progress =
        parseInt(maxspeedTimeArr[0] * 60) + parseInt(maxspeedTimeArr[1])

      if (item.avg_time < 0) {
        // 后端 返回数据 异常时 处理最后一公里配速
        item.avg_time = SpeedDate.reduce((ac, cu) => ac + cu.avg_time, 0)
      }
      // 配速计算
      item.speedTime = formatAvg(
        item.avg_time,
        !item.distance ? 1000 : item.distance.toFixed(3),
      )
      itemspeedTimeArr = item.speedTime.split("'")
      item.Progress =
        parseInt(itemspeedTimeArr[0] * 60) + parseInt(itemspeedTimeArr[1])
      // 获取最小值
      if (obj.min.Progress > item.Progress) {
        obj.min = item
      }
      // 获取最大值
      if (obj.max.Progress < item.Progress) {
        obj.max = item
      }
      if (item.index == maxKmIdx) throw Error()
    })
  } catch {}
  // 最佳配速
  if (distance < 1010) {
    if (flag) {
      obj.min.speedTime = avg_pace
    } else {
      obj.min.speedTime = formatShowAvg(avg_pace)
    }
  }
  obj.bestSpeed = obj.min.speedTime
  // 最后一公里是否超过或等于一公里
  if (distance % 1000 != 0) {
    obj.isOverKm = true
  }

  // 百分比计算
  SpeedDate.forEach((item) => {
    if (item.avg_time == obj.max.avg_time) {
      item.percentage = '100%'
    } else {
      item.percentage = `${(item.Progress / obj.max.Progress) * 100}%`
    }
  })
  obj.speedDetails = SpeedDate.filter((el) => el.speedTime)
  return obj
}

export default {
  calcDistance,
  add0,
  format,
  secTranlateTime,
  formatAvg,
  formatDate,
  formatShowAvg,
  clip,
  processSpeedData,
}
