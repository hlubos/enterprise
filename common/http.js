import CryptoJS from 'crypto-js'
import tool from './tool'
import { basePath, logFlag } from '../config/env'
import errStorage from './errStorage'

let onGetSession = false //是否正在请求sessionkey
const post = async (url, parms = {}, isfromGetsskey) => {
  //这里是防止sessionkey接口很慢的情况下，其它正在排队的请求继续发送，导致短时间内多个重复请求（100ms一次）
  if (onGetSession && !isfromGetsskey) {
    await _sleep(200)
    return post(url, parms)
  }
  let defaultConfig = {
    timeout: 1000 * 30,
    header: {
      contentType: 'application/x-www-form-urlencoded',
    },
  }
  let sskey = await tool.getYdStorage('session_key')
  let userId = (await tool.getYdStorage('user_id')) || 0
  let xyy = (await tool.getYdStorage('xyy')) || 'zachhe'
  if (!sskey && !isfromGetsskey) {
    sskey = await tool.getSessionKey(userId, xyy)
  }
  parms = Object.assign(
    {
      user_id: userId,
      xyy: xyy,
      package_name: logFlag.packageName,
      platform: 'web',
      app_type: 'wx_mini',
      session_key: sskey,
      session_from: 1,
      timestamp: Date.parse(new Date()) / 1000 + tool.timeSpace + '',
    },
    parms,
  )
  parms.sign = _hamcSha(url, parms, sskey)
  let qs = require('qs')
  let reqUrl = url.indexOf('http') > -1 ? url : basePath + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: reqUrl,
      method: 'post',
      data: qs.stringify(parms),
      timeout: defaultConfig.timeout,
      header: {
        'content-type': defaultConfig.header.contentType,
      },
      success: function (res) {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      },
    })
  })
    .then(async function (res) {
      if (!res.data || res.data.code === undefined || !res.data.msg) {
        tool.$throw('结构体异常', parms, url, res.data)
      }
      let data = Object.assign(
        {
          code: -1001,
          msg: '网络出问题了~',
        },
        res.data,
      )
      if (data.code === 7007) {
        //sessionkey过期
        tool.$throw('sskey过期', parms, url)
        if (isfromGetsskey) {
          _dealSessionExpire()
        } else {
          delete parms.session_key
          if (!onGetSession) {
            //前面没有正在请求的sessionkey
            onGetSession = true
            let returnSskey = await tool.getSessionKey(parms.user_id, parms.xyy)
            onGetSession = false
            if (!returnSskey) return {} //没有获取到sesskey时，停止后面的请求，常见的场景是xyy过期
            return post(url, parms, true)
          } else {
            //前面有在请求的sessionkey
            await _sleep(100) //排队等100毫秒再去请求
            return post(url, parms)
          }
        }
      }
      if (
        data.code !== 0 &&
        data.code !== 4004 &&
        data.code !== 7007 &&
        data.msg !== 'ok'
      ) {
        if (data.code === 1 && data.msg === '参数不合法') {
          //将参数不合法的请求上报
          let timeSpace = 0
          if (res.header.server_time) {
            timeSpace =
              parseInt(res.header.server_time) - Date.parse(new Date()) / 1000
          }
          if (Math.abs(timeSpace) > 300) {
            //本地和服务器时间超过五分钟导致的参数不合法
            tool.$throw('时间戳异常', parms, url)
            tool.timeSpace = timeSpace
            wx.setStorage({
              key: 'timeSpace',
              data: timeSpace,
            })
            delete parms.timestamp
            return post(url, parms)
          }
          tool.$throw('参数不合法', parms, url)
          wx.showToast({
            title: '服务异常，请稍后重试',
            icon: 'none',
          })
        } else if (!parms.hijack) {
          //参数hijack，如果存在且为true,则弹框信息业务处理
          wx.showToast({
            title: data.msg,
            icon: 'none',
          })
        }
      }
      if (data.code === 4004) {
        //user_id和xyy不匹配，最常见的是用户被设置成了广告用户，xyy发生变化
        let reportData = JSON.parse(JSON.stringify(parms))
        reportData.cookie_data = {
          user_id: tool.getCookieValue('user_id'),
          xyy: tool.getCookieValue('xyy'),
          sid: tool.getCookieValue('sid'),
        }
        tool.$throw('登录过期', reportData, url)
        tool.toLogin()
      }
      Object.assign(data, {
        _header: res.header,
      })
      return data
    })
    .catch((res) => {
      tool.$throw(res, parms, reqUrl)
      if (isfromGetsskey) {
        //获取sessionkey超时
        tool.fetchSKtime++
        if (tool.fetchSKtime < 3) {
          //最多请求三次，不行就出提示弹窗，常见场景有：1获取sessionkey超时，2按钮跳转时的事件上报（弱网下事件上报没完成页面就直接跳转走了，导致请求abort）
          return post(url, parms, true)
        } else {
          _dealSessionExpire()
        }
      } else {
        //弱网下按钮跳转的事件上报被cancel时，不用出toast弹窗
        wx.showToast({
          title: '当前网络不给力，请稍后重试',
          icon: 'none',
        })
      }
      return {
        code: -1002,
        msg: '网络出问题了~',
      }
    })
}

//不带默认参数的请求，主要用于错误上报等
const postOnly = async (url, parms = {}, headers = {}) => {
  let defaultConfig = {
    timeout: 1000 * 10,
    header: {
      contentType: 'application/x-www-form-urlencoded',
    },
  }
  let qs = require('qs')
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'post',
      data: qs.stringify(parms),
      timeout: defaultConfig.timeout,
      header: {
        'content-type': defaultConfig.header.contentType,
      },
      success: function (res) {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      },
    })
  })
    .then(function (res) {
      return res.data
    })
    .catch((res) => {
      let errObj = JSON.parse(parms.data)
      if (errObj.err_msg) {
        errStorage.setItem(errObj.err_msg, errObj, 3600 * 24 * 7, true)
      }
    })
}

const get = (url, parms = {}, headers = {}) => {
  url += '?'
  for (let key in parms) {
    url += key + '=' + parms[key] + '&'
  }
  let option = Object.assign({}, headers)

  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'get',
      timeout: 1000 * 10,
      header: option,
      success: function (res) {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      },
    })
  })
    .then(function (res) {
      return res.data
    })
    .catch((res) => {})
}

export default {
  post: post,
  postOnly: postOnly,
  get: get,
}

function _sortArgs(data) {
  var args
  var argsArr = []
  for (args in data) {
    if (data[args] == null || data[args] == undefined) {
      data[args] = ''
    }
    if (
      args != 'xyy' &&
      args != 'sign' &&
      args != 'content' &&
      args != 'feeling' &&
      args != 'nick' &&
      args != 'alipay_name'
    ) {
      argsArr.push(args)
    }
  }
  argsArr.sort()
  var argStr = ''
  for (var i = 0; i < argsArr.length; i++) {
    var item = argsArr[i]
    argStr = argStr + item + '=' + data[item] + '&'
  }
  argStr = argStr.substring(0, argStr.length - 1)
  argStr = encodeURIComponent(argStr)
  argStr = argStr
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/!/g, '%21')
    .replace(/~/g, '%7E')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
  return argStr
}

function _hamcSha(uri, data, sectionKoken) {
  var url = uri.replace(/https:\/\/api\d*\.51yund.com/, '')
  url = encodeURIComponent(url)
  var paramsStr = _sortArgs(data)
  var args = 'POST&' + url + '&' + paramsStr
  var hash = CryptoJS.HmacSHA1(args, sectionKoken)
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash)
  return hashInBase64
}

function _dealSessionExpire() {
  wx.showModal({
    title: '提示',
    content: '很抱歉，访问出现错误',
    confirmText: '重新登录',
    cancelText: '取消',
    success(res) {
      if (res.confirm) {
        tool.toLogin()
      }
    },
  })
}

function _sleep(interval) {
  return new Promise((resolve) => {
    setTimeout(resolve, interval)
  })
}
