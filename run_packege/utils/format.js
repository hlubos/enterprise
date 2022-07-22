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
    var total_data = Math.floor((secs * 1000) / miles); 
    var total_m = Math.floor(total_data / 60) > 59 ? 59 : Math.floor(total_data / 60);
    var lest_sec = total_data % 60;
    return total_m+"'"+utils.add0(lest_sec)+"''";
}

export default {
    add0,
    format,
    secTranlateTime,
    formatAvg,
}