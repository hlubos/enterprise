import wxFun from '../../../utils/wxFun'
let createMapContext = wxFun.ordinary('createMapContext')
Component({
  behaviors: [],

  properties: {
    newLongitude: {
      type: Number,
      value: 0,
    },
    newLatitude: {
      type: Number,
      value: 0,
    },
    locaDotArr: {
      type: Array,
      value: [],
    },
    runShowData: {
      type: Object,
      value: {},
    },
    mapStyle: {
      type: Object,
      value: {},
    },
  },

  data: {
    mapCenterLocation: {},
    polylines: [
      {
        points: [], //是一个数组形式的坐标点[{lat,log}]
        color: '#4CDDB4', //线条的颜色
        width: 5, //宽度
        arrowLine: true, //是否带箭头
        borderWidth: 0, //线的边框宽度，还有很多参数，请看文档
      },
    ],
    pointArr: [],
  }, // 私有数据，可用于模板渲染
  // 数据监听器observers
  observers: {
    locaDotArr: function (data) {
      let pointArr = []
      data.forEach((item) => {
        if (item.length > 0) {
          pointArr = [...pointArr, ...item]
        }
      })
      this.setData({
        'polylines[0].points': pointArr,
        pointArr,
      })
      // this._toLocation()
    },
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
    attached: function () {
      // this.setData({
      //     mapCenterLocation:{
      //         longitude: this.data.newLongitude,
      //         latitude: this.data.newLatitude,
      //     }
      // });
      // this._toLocation()
      // startLocationUpdateBackground()
    },
    ready() {
      this._toLocation()
    },
    moved: function () {},
    detached: function () {},
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      // startLocationUpdate()
      // this.getRunSetCache()
      setTimeout(() => {
        this._toLocation()
      }, 1500)
    },
    hide: function () {},
    resize: function () {
      this._toLocation()
    },
  },

  methods: {
    hideMap() {
      this.triggerEvent('hideRunMap')
    },
    // 内部方法建议以下划线开头
    _toLocation() {
      var runMap = createMapContext('run-map', this)
      runMap.moveToLocation()
    },
    _includePots() {
      var runMap = createMapContext('run-map', this)
      runMap.includePoints({
        padding: [70, 70, 70, 70], // padding类似我们css中的padding，可以有四个值
        points: this.data.pointArr,
      })
    },
  },
})
