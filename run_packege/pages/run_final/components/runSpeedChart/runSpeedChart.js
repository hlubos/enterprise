// run_packege/pages/run_final/components/runSpeedChart/runSpeedChart.js
import * as echarts from '../../../../ec-canvas/echarts';
// function 
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
      ec: {
        // onInit: initChart
      }
    },
    lifetimes: {
      // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
      attached: function () {
        this.setData({
          'ec.onInit':this.initChart
        })
      },
      moved: function () { },
      detached: function () { },
    },
    /**
     * 组件的方法列表
     */
    methods: {
      initChart(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(chart);
        var option = {
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
          graphic:[{
            type:"text",
            left:"center",
            top:"40%",
            style:{
              text:`平均配速11'12''`,
              textAlign:"center",
              fill:"#333",
              fontSize:14,
            }
          },{
            type:"text",
            left:"center",
            top:"50%",
            style:{
              text:`比上次↓7'35''`,
              textAlign:"center",
              fill:"#333",
              fontSize:14,
            }
          },],
          series: [{
            label: {
              // alignTo: 'edge',
              normal: {
                show:true,
                formatter: [
                  '{b}',
                  '{c}',
                ].join('\n'), //图形外文字上下显示
                fontSize: 14
              },
              rich: {
                b:{
                  padding:[20,-50,0,-50],
                  left:20,
                  fontSize: 14,
                  color: '#666666'
                },
                c:{
                  padding:[0,-50,20,-50],
                  left:20,
                  fontSize: 14,
                  color: '#333333'
                }
              },
              
            },
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['50%', '60%'],
            data: [{
              value: 55,
              name: '第1公里'
            }, {
              value: 20,
              name: '第2公里'
            }, {
              value: 10,
              name: '第3公里'
            }, {
              value: 20,
              name: '最后233米'
            }]
          }]
        };
        chart.setOption(option);
        return chart;
      }
    }
})
