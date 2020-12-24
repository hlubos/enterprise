import urls from '../server/urls'
import $http from './http'
import * as config from '../config/env'
const tool = {
  timeSpace: 0, //本地和服务器的时间间隔
  fetchSKtime:0, //获取sessionkey超时的重试次数
  promisify: (fnName) => {
    if (!wx[fnName]) {
      throw new Error('找不到wx.' + fnName)
    }
    return async function(args) {
      return new Promise((resolve, reject) => {
          wx[fnName]({
              ...(args || {}),
              success: res => resolve(res),
              fail: err => reject(err)
          })
      })
    }
  },

  // 去登录
  toLogin: () => {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  
  getYdStorage: async (key) => {
    let getStorage = tool.promisify('getStorage')
    try {
      let value = await getStorage({
        key: key
      })
      return value.data 
    } catch (err) {
      return ''
    }
  },

  setYdStorage: async (key, value) => {
    let setStorage = tool.promisify('setStorage')
    await setStorage({
      key: key,
      data: value
    })
  },

  isIosWeb: () => {
    const systemInfo = wx.getSystemInfoSync()
    return /ios/i.test(systemInfo.system);
  },

  $throwJS(data){ //抛出js异常
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const systemInfo = wx.getSystemInfoSync()

    let obj = {  //公共部分
       platform: "web",
       app_source: tool.isIosWeb() ? 'IOS' : 'android',
       app_type: 'wx_mini',
       local_url: currentPage.route,    
       package_name: config.logFlag.packageName,
       system_version: systemInfo.system
   }
   Object.assign(obj, data);
   let filterJsErr = [];
   if(config.filterErr && config.filterErr.length > 0){
       filterJsErr.push(...config.filterErr);
   }
   if(filterJsErr.indexOf(obj.err_msg) > -1) return;
   let cmd_name = 'vue_jserr';
   if(obj.err_msg && obj.err_msg.indexOf('http') > -1){
       cmd_name = 'vue_reserr';  //reserr表示资源加载异常（resource error）
   }
   tool.postErrLog(obj, cmd_name);
  },
  // 抛出请求异常
  $throw: (err, info, uri, response) => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    let obj = {
        local_url: currentPage.route,
        err_msg: err + '',
        package_name: config.logFlag.packageName,
        req_params: info,
        req_uri: uri
    }
    if(response){ //返回值结构体异常
        obj.response = response
    }
    let filterErr = config.filterErr;
    if(filterErr && filterErr.indexOf(obj.err_msg) > -1) return;
    tool.postErrLog(obj, 'vue_reqerr');
},

  //记录上报（访问来源上报、错误上报）
  reportCmd: function (data) {
    $http.postOnly(config.logPath + '/sport/report', data)
  },

  // 上报错误信息
  async postErrLog (data, cmdName) {
      const systemInfo = wx.getSystemInfoSync()
      if(systemInfo.platform === 'devtools' && !config.logFlag.dev){
          return
      }
      let param = {
          user_id: await tool.getYdStorage('user_id') || 0,
          cmd: cmdName,
          device_id: 'yuedongweb',
          data: JSON.stringify(data)
      }
      tool.reportCmd(param);
  },
  
  getSessionKey: (userId, xyy, cb) => {
    var param = {"user_id":userId, "xyy":xyy};
    return $http.post(urls.getsskey, param, true).then(async function(res){
        if(res.code === 0){
            let sessionkey = res.session_key;
            if(sessionkey){
                tool.fetchSKtime = 0; //获取成功之后把fetchSKtime还原
                await tool.setYdStorage('user_id', userId)
                await tool.setYdStorage('xyy', xyy)
                await tool.setYdStorage('session_key', sessionkey)
            }
            let hasLogin = userId == 0? false : true;
            if(cb) cb(hasLogin);
            return sessionkey;
        } else if(res.code !== 7007) { //userId和xyy不匹配或其它异常情况，最常见的场景是首次进来时，用户之前本地存储的xyy过期，7007的情况在http层统一处理
            tool.toLogin();
        }
    })
  }
}

const injectTool = async () => {
  try {
    let timeSpace = await tool.getYdStorage('timeSpace');
    if (timeSpace) {
      tool.timeSpace = parseInt(timeSpace);
    }
  } catch (err) {
  }
}

injectTool()

export default tool