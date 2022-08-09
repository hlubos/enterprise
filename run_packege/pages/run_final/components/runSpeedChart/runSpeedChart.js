// run_packege/pages/run_final/components/runSpeedChart/runSpeedChart.js
import * as echarts from '../../../../ec-canvas/echarts';
import {
    getStorageSync,
    removeStorageSync,
} from '../../../../utils/wxApi'
import myFormats from '../../../../utils/format'
let chart
let pace = {
    nowVal:"0'00''",
    flag: 1, 
    value: "0'00''"
}
function getOption(data) {
    let txt = ''
    if(pace.flag == 1){
        txt = `比上次 ↓ ${pace.value}`
    }else{
        txt = `比上次 ↑ ${pace.value}`
    }
    console.log('txt',txt)
    console.log('pace',pace)
    var option = {
        backgroundColor: '#ffffff',
        title: [
            {
                text: '配速',
                // left: 'center',
                textStyle: {
                    fontWeight: '600',
                    fontSize: '16',
                    color: '#333333',
                }
            },
        ],
        graphic: [{
            type: "text",
            left: "center",
            top: "40%",
            style: {
                // text: `平均配速11'12''`,
                text: pace.nowVal,
                textAlign: "center",
                fill: "#333",
                fontSize: 14,
            }
        }, {
            type: "text",
            left: "center",
            top: "50%",
            style: {
                // text: `比上次↓7'35''`,
                text: txt,
                textAlign: "center",
                fill: "#333",
                fontSize: 14,
            }
        },],
        series: [{
            label: {
                // alignTo: 'edge',
                normal: {
                    show: true,
                    // formatter: [
                    //     '{b}',
                    //     '{c}',
                    // ].join('\n'), //图形外文字上下显示
                    formatter:function (a) {
                        // console.log('a',a)
                        let arr = []
                        arr.push(a.data.name.title)
                        let formatVal = myFormats.formatShowAvg(a.data.name.cot)
                        arr.push(formatVal)
                        return arr.join('\n')
                    },
                    fontSize: 14
                },
                rich: {
                    b: {
                        padding: [20, -50, 0, -50],
                        left: 20,
                        fontSize: 14,
                        color: '#666666'
                    },
                    c: {
                        padding: [0, -50, 20, -50],
                        left: 20,
                        fontSize: 14,
                        color: '#333333'
                    }
                },

            },
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['50%', '60%'],
            data: data,
        }]
    };
    return option
}
function getCache(){
    // 获取缓存
    let user_id = getStorageSync('user_id')
    let key = 'run_kmiles_pace_arr_' + user_id
    let cacheData = getStorageSync(key)
    let newData = []
    for (let i = 0; i < cacheData.length; i++) {
        if (i < cacheData.length - 1) {
            newData.push({
                name: {
                    title: `第${cacheData[i]['kmiles_cut']}公里`,
                    cot:cacheData[i].avg_pace,
                },
                // value: myFormats.formatShowAvg(cacheData[i].avg_pace),
                // value: cacheData[i].avg_pace,
                value: 1000
            })
        } else {
            let m = Number(cacheData[i].outMiles).toFixed(2)
            newData.push({
                name: {
                    title:`最后${m}米`,
                    cot:cacheData[i].avg_pace,
                },
                // value: myFormats.formatShowAvg(cacheData[i].avg_pace),
                // value: cacheData[i].avg_pace,
                value: m
            })
        }
    }
    // let data = [{
    //     value: 55,
    //     name: '第1公里'
    //   }, {
    //     value: 20,
    //     name: '第2公里'
    //   }, {
    //     value: 10,
    //     name: '第3公里'
    //   }, {
    //     value: 20,
    //     name: '最后233米'
    //   }]
    // let data = newData
    
    return newData
}
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        paceCompare:{
            type:Object,
            value:{}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        ec: {
            // onInit: initChart
            lazyLoad: true // 延迟加载,手动初始化图表
        },
        chartImage:'',
    },
    observers: {
        paceCompare: function(paceCompare) {
            this.pieComponent = this.selectComponent("#mychart-dom-pie");
            pace = paceCompare
            console.log(pace)
            this.init_pie()
        }
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
        attached: function (data) {
            let that = this
            this.pieComponent = this.selectComponent("#mychart-dom-pie");
            // this.init_pie()
            // this.setData({
            //     'ec.onInit': this.init_pie
            // })
            // getCache()
            
        },
        moved: function () { 
            // chart.setOption(getOption(getCache()));
        },
        detached: function () { },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        init_pie(){
            let that = this
            this.pieComponent.init((canvas, width, height, dpr) =>{
                chart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr // new
                });
                // canvas.fillStyle = "#fff"
                // canvas.fillRect(0,0, canvas.width, canvas.width)
                canvas.setChart(chart);
                chart.setOption(getOption(getCache()));
                setTimeout(function () {
                    that.pieComponent.canvasToTempFilePath({
                       x: 0,
                       y: 0,
                    //    width: 375,
                    //    height: 375,
                    //    destWidth: 750,
                    //    destHeight: 750, //mychart1的option
                        fileType:'png',
                       success:res => {
                         console.log("temp path", res.tempFilePath)
                         that.setData({
                          chartImage:res.tempFilePath
                        })
                        //next todo
                        that.triggerEvent('getChartImage', {chartImage: that.data.chartImage})
                        // 需要等这边图片导出成功后再继续海报生成的方法  
                        
                       }
                    })
                }, 2000)
                return chart;
            }) 
        }
        // 
        
    }
})
