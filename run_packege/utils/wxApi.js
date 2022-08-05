/**
 *  wx.getLocation 获取位置信息
 */
export const getLocation = () => {
    return new Promise((resolve, reject) => {
        wx.getLocation({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  wx.startLocationUpdateBackground 
 *  开启小程序进入前后台时均接收位置消息，
 *  需引导用户开启授权。授权以后，小程序在运行中或进入后台均可接受位置消息变化。
 */
export const startLocationUpdateBackground = () => {
    return new Promise((resolve, reject) => {
        wx.startLocationUpdateBackground({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

export const startLocationUpdate= () => {
    return new Promise((resolve, reject) => {
        wx.startLocationUpdate({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

export const stopLocationUpdate= () => {
    return new Promise((resolve, reject) => {
        wx.stopLocationUpdate({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  wx.onLocationChange 
 *  监听实时地理位置变化事件，
 *  需结合 wx.startLocationUpdateBackground、wx.startLocationUpdate使用。
 */
export const onLocationChange = (fn)=>{
    return wx.onLocationChange(fn)
}

export const offLocationChange = (fn)=>{
    return wx.offLocationChange(fn)
}

/**
 *  wx.authorize 用户授权
 */
export const authorize = (scope) => {
    return new Promise((resolve, reject) => {
        wx.authorize({
            scope,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}


/**
 *  wx.getSetting 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
 */
export const getSetting = () => {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}


 /**
 *  wx.openSetting 调起客户端小程序设置界面，返回用户设置的操作结果。设置界面只会出现小程序已经向用户请求过的权限。
 */
export const openSetting = () => {
    return new Promise((resolve, reject) => {
        wx.openSetting({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

 /**
 *  wx.getNetworkType 获取网络类型
 */
export const getNetworkType = () => {
    return new Promise((resolve, reject) => {
        wx.getNetworkType({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

 /**
 *  wx.navigateTo 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。
 *  使用 wx.navigateBack 可以返回到原页面。小程序中页面栈最多十层。
 */
export const navigateTo = (url) => {
    return new Promise((resolve, reject) => {
        wx.navigateTo({
            url,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

 /**
 *  wx.setStorage 将数据存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。
 * 除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。
 * 单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。
 */
export const setStorage = (key,data) => {
    return new Promise((resolve, reject) => {
        wx.setStorage({
            key,
            data,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}
/**
 *  wx.getStorage 从本地缓存中异步获取指定 key 的内容。
 */
export const getStorage = (key) => {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}
// 同步缓存
export const setStorageSync = (key,data) =>{
    return wx.setStorageSync(key,data)
}
export const getStorageSync = (key) =>{
    return wx.getStorageSync(key)
}
/**
 *  wx.removeStorage 从本地缓存中移除指定 key。
 *  wx.removeStorageSync(string key) wx.removeStorage 的同步版本
 */
export const removeStorage = (key) => {
    return new Promise((resolve, reject) => {
        wx.removeStorage({
            key,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}
export const removeStorageSync = (key) =>{
    return wx.removeStorageSync(key)
}

/**
 *  wx.redirectTo
 */
export const redirectTo = (url) => {
    return new Promise((resolve, reject) => {
        wx.redirectTo({
            url,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}
/**
 *  wx.navigateBack
 *  关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
 */
export const navigateBack = (delta = 1) => {
    return new Promise((resolve, reject) => {
        wx.navigateBack({
            delta,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  wx.showToast 显示消息提示框
 */
export const showToast = (title,icon) => {
    return new Promise((resolve, reject) => {
        wx.showToast({
            title,
            icon,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  wx.showModal 显示模态对话框
 */
export const showModal = (title,content) => {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title,
            content,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  wx.showLoading 显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
 */
export const showLoading = (title,mask) => {
    return new Promise((resolve, reject) => {
        wx.showLoading({
            title,
            mask,
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}
/**
 *  wx.hideLoading 关闭模态对话框
 */
export const hideLoading = () => {
    return new Promise((resolve, reject) => {
        wx.hideLoading({
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  wx.createInnerAudioContext 创建内部 audio 上下文 InnerAudioContext 对象。
 */
export const createInnerAudioContext = (useWebAudioImplement) => {
    return wx.createInnerAudioContext({
        useWebAudioImplement,
    })
}