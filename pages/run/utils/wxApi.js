/**
 *  wx.getLocation 获取位置信息
 */
export const getLocation = (params) => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.startLocationUpdateBackground
 *  开启小程序进入前后台时均接收位置消息，
 *  需引导用户开启授权。授权以后，小程序在运行中或进入后台均可接受位置消息变化。
 */
export const startLocationUpdateBackground = (params) => {
  return new Promise((resolve, reject) => {
    wx.startLocationUpdateBackground({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

export const startLocationUpdate = (params) => {
  return new Promise((resolve, reject) => {
    wx.startLocationUpdate({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

export const stopLocationUpdate = (params) => {
  return new Promise((resolve, reject) => {
    wx.stopLocationUpdate({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.onLocationChange
 *  监听实时地理位置变化事件，
 *  需结合 wx.startLocationUpdateBackground、wx.startLocationUpdate使用。
 */
export const onLocationChange = (fn) => {
  return wx.onLocationChange(fn)
}

export const offLocationChange = (fn) => {
  return wx.offLocationChange(fn)
}

/**
 *  wx.authorize 用户授权
 */
export const authorize = (params) => {
  return new Promise((resolve, reject) => {
    wx.authorize({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.getSetting 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
 */
export const getSetting = (params) => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.openSetting 调起客户端小程序设置界面，返回用户设置的操作结果。设置界面只会出现小程序已经向用户请求过的权限。
 */
export const openSetting = (params) => {
  return new Promise((resolve, reject) => {
    wx.openSetting({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.getNetworkType 获取网络类型
 */
export const getNetworkType = (params) => {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.navigateTo 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。
 *  使用 wx.navigateBack 可以返回到原页面。小程序中页面栈最多十层。
 */
export const navigateTo = (params) => {
  return new Promise((resolve, reject) => {
    wx.navigateTo({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.setStorage 将数据存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。
 * 除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。
 * 单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。
 */
export const setStorage = (params) => {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
/**
 *  wx.getStorage 从本地缓存中异步获取指定 key 的内容。
 */
export const getStorage = (params) => {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
// 同步缓存
export const setStorageSync = (key, data) => {
  return wx.setStorageSync(key, data)
}
export const getStorageSync = (key) => {
  return wx.getStorageSync(key)
}
/**
 *  wx.removeStorage 从本地缓存中移除指定 key。
 *  wx.removeStorageSync(string key) wx.removeStorage 的同步版本
 */
export const removeStorage = (params) => {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
export const removeStorageSync = (key) => {
  return wx.removeStorageSync(key)
}

/**
 *  wx.redirectTo
 */
export const redirectTo = (params) => {
  return new Promise((resolve, reject) => {
    wx.redirectTo({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
/**
 *  wx.navigateBack
 *  关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
 */
export const navigateBack = (parmas = {}) => {
  return new Promise((resolve, reject) => {
    wx.navigateBack({
      ...parmas,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
/**
 *  wx.saveImageToPhotosAlbum
 *  保存图片到系统相册
 */
export const saveImageToPhotosAlbum = (params) => {
  //保存图片到相册
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.showToast 显示消息提示框
 */
export const showToast = (params) => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.showModal 显示模态对话框
 */
export const showModal = (params) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.showLoading 显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
 */
export const showLoading = (params) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
/**
 *  wx.hideLoading 关闭模态对话框
 */
export const hideLoading = () => {
  return new Promise((resolve, reject) => {
    wx.hideLoading({
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.previewImage 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
 */
export const previewImage = (params) => {
  return new Promise((resolve, reject) => {
    wx.previewImage({
      ...params,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.createInnerAudioContext 创建内部 audio 上下文 InnerAudioContext 对象。
 *  parmas:
 *  属性:useWebAudioImplement
 *  类型:boolean
 *  默认值:false
 *  必填:否
 * 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项
 */
export const createInnerAudioContext = (params) => {
  return wx.createInnerAudioContext(params)
}

/**
 *  返回一个 SelectorQuery 对象实例。在自定义组件或包含自定义组件的页面中，应使用 this.createSelectorQuery() 来代替。
 */
export const createSelectorQuery = () => {
  return wx.createSelectorQuery()
}

/**
 * wx.createMapContext
 *  创建 map 上下文 MapContext 对象。
 */
export const createMapContext = (mapId, obj) => {
  return wx.createMapContext(mapId, obj)
}

//
/**
 *  wx.startAccelerometer 开始监听加速度数据。
 */
export const startAccelerometer = (parmas = {}) => {
  return new Promise((resolve, reject) => {
    wx.startAccelerometer({
      ...parmas,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 *  wx.stopAccelerometer 停止监听加速度数据
 */
export const stopAccelerometer = () => {
  return new Promise((resolve, reject) => {
    wx.stopAccelerometer({
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 * wx.onAccelerometerChange
 *  监听加速度数据事件。频率根据 wx.startAccelerometer() 的 interval 参数, 接口调用后会自动开始监听。
 */
export const onAccelerometerChange = (fn) => {
  return wx.onAccelerometerChange(fn)
}

/**
 * wx.offAccelerometerChange
 *  取消监听加速度数据事件，参数为空，则取消所有的事件监听。
 */
export const offAccelerometerChange = (fn) => {
  return wx.offAccelerometerChange(fn)
}
