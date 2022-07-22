Component({

    behaviors: [],
  
    properties: {
        newLongitude:{
            type:Number,
            value:0
        },
        newLatitude:{
            type:Number,
            value:0
        },
    },
    
    data: {
        mapCenterLocation:{}
    }, // 私有数据，可用于模板渲染
  
    lifetimes: {
      // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
      attached: function () {
        // this.setData({
        //     mapCenterLocation:{
        //         longitude: this.data.newLongitude,
        //         latitude: this.data.newLatitude,
        //     }
        // });
      },
      moved: function () { 
      },
      detached: function () { },
    },

    pageLifetimes: {
      // 组件所在页面的生命周期函数
      show: function () { },
      hide: function () { },
      resize: function () { },
    },
  
    methods: {
      hideMap(){
        this.triggerEvent('hideRunMap')
      },
      // 内部方法建议以下划线开头
      _toLocation(){
        let runMap = wx.createMapContext("run-map",this);
        runMap.moveToLocation();
      },
    }
  
  })