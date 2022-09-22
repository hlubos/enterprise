const wxFun = {
  // 以promise方式调用的
  promisify: (fnName) => {
    if (!wx[fnName]) {
      throw new Error('找不到wx.' + fnName)
    }
    return async function (args) {
      return new Promise((resolve, reject) => {
        wx[fnName]({
          ...(args || {}),
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        })
      })
    }
  },
  // 以普通方式调用的
  ordinary: (fnName) => {
    if (!wx[fnName]) {
      throw new Error('找不到wx.' + fnName)
    }
    return function (...params) {
      return wx[fnName](...params)
    }
  },
}
export default wxFun
