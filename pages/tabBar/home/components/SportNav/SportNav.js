// pages/tabBar/home/components/SportNav/SportNav.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        sportList:Object,
        activeIndex:Number,
    },

    /**
     * 组件的初始数据
     */
    data: {
        
    },

    /**
     * 组件的方法列表
     */
    methods: {
        changeActive(e){
            // console.log(e)
            let i = e.currentTarget.dataset.key
            this.triggerEvent('checkActiveItem',i)
        }
    }
})
