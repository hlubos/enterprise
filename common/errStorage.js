import { stringify } from 'qs';
// 缓存error，方便及时上传
import tool from './tool'

function YdStorage() {
  this.initClear() //去除过期缓存
}

YdStorage.prototype = {
  constructor: function() {
      this.name = 'storage';
  },
  initClear: function(){
      let { keys } = wx.getStorageInfoSync()
      keys.forEach((key, index) => {
        let value = wx.getStorageSync(key)
        if (typeof value === 'string' && value.indexOf('_expires_') !== -1) {
            let data = JSON.parse(value)
            if (Date.now() > data._expires_) {
                this.remove(key)
            }
        }
      })
  },
  setItem: function(name, value, expires, needPost){ //expires是秒, needPost标记是否需要发送到服务器
      if(expires){
          var obj = {
              value: value,
              _expires_: Date.now() + expires * 1000,
          }
          if(needPost){
              obj._needPost_ = true; //这个用来标记是否需要发送
          }
          wx.setStorage({
            key: name,
            data: JSON.stringify(obj)
          })
      } else {
          var type = Object.prototype.toString.call(value).slice(8, -1);
          if(type == 'Object' || type == 'Array'){
              value = JSON.stringify(value);
          }
          wx.setStorage({
            key: name,
            data: value
          })
      }
  },
  getItem: function(name){
      var item = localStorage.getItem(name);
      if(!item) return '';
      try{ //先将拿到的试着进行json转为对象的形式
          item = JSON.parse(item);
      }catch(error){ //如果不行就不是json的字符串，就直接返回
          item = item;
      }
      if(!item._expires_) return item;
      if(Date.now() > item._expires_){
          this.remove(name);
          return '';
      } else {
          return item.value;
      }
  },
  remove: function(name){
    wx.removeStorageSync(name)
  },
  postItem: function(){
      let { keys } = wx.getStorageInfoSync()
      keys.forEach((key) => {
        let value = wx.getStorageSync(key)
        if (typeof value === 'string' && value.indexOf('_needPost_') !== -1) {
            let data = JSON.parse(value)
            tool.$throwJS(data.value);
            this.remove(key);
        }
      })
  }
}

const errStorage = new YdStorage()

export default errStorage