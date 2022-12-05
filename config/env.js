// 环境配置
let logFlag = {
  dev: false, // 开发和测试环境是否上报log
  from: false, // 是否上传页面来源
  packageName: 'com.yuedong.mp.ydenterprise',
}
let basePath = 'https://api.51yund.com' // api请求地址
let jumpPath = 'https://d.51yund.com' // 跳转登录地址
let localPath = 'https://51yund.com' // 获取定位地址
let logPath = 'https://api.51yund.com' // 上传日志地址
let filterErr = ['sskey过期'] //过滤掉某些错不上报

export { basePath, jumpPath, localPath, logPath, logFlag, filterErr }
