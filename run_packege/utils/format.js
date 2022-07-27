//两点距离
function calcDistance(lonA, latA, lonB, latB) {
    var earthR = 6371000;
    const PI = 3.1415926535897932384626
    var x = Math.cos(latA * PI / 180.) * Math.cos(latB * PI / 180.) * Math.cos((lonA - lonB) * PI / 180);
    var y = Math.sin(latA * PI / 180.) * Math.sin(latB * PI / 180.);
    var s = x + y;
    if (s > 1) s = 1;
    if (s < -1) s = -1;
    var alpha = Math.acos(s);
    var distance = alpha * earthR;
    return distance;
}

//时间计数器add_zero in front of
function add0(m) { return m < 10 ? '0' + m : m }

//时间计数器
function format() {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date();
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return h + ':' + add0(mm) + ':' + add0(s);
}

//秒转时间格式  4000s ->  1:12:36
function secTranlateTime(sec){
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = (sec % 3600) % 60;
    return h+':'+add0(m)+':'+add0(s);
}
//将秒格式化配速
function formatAvg(secs,miles){
    // 走路  5km/h
    // 配速  12min/km
    // 走路大概 6min/km
    if(miles == 0){
        return "0'00''"
    }
    var total_data = Math.floor((secs * 1000) / miles); 
    var total_m = Math.floor(total_data / 60) > 59 ? 59 : Math.floor(total_data / 60);
    var lest_sec = total_data % 60;
    return total_m+"'"+add0(lest_sec)+"''";
}

// 日期格式化 日期格式重置   页面用法：{{formatDate(1646209697,'yyyy/MM/dd hh:mm')}}  返回值：'2017/08/22 18:30'
function formatDate(value, fmt){
    if (!value) return value;
    let timeSc = new Date(value * 1000);
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
        RegExp.$1,
        (timeSc.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    let o = {
        "M+": timeSc.getMonth() + 1,
        "d+": timeSc.getDate(),
        "h+": timeSc.getHours(),
        "m+": timeSc.getMinutes(),
        "s+": timeSc.getSeconds(),
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
        let str = o[k] + "";
        fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length === 1 ? str : padLeftZero(str)
        );
        }
    }

    function padLeftZero(str) {
        return ("00" + str).substr(str.length);
    }

    return fmt;
}

export default {
    calcDistance,
    add0,
    format,
    secTranlateTime,
    formatAvg,
    formatDate,
}