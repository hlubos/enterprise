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

/**
 *  wx.onLocationChange 
 *  监听实时地理位置变化事件，
 *  需结合 wx.startLocationUpdateBackground、wx.startLocationUpdate使用。
 */
export const onLocationChange = ()=>{
    return wx.onLocationChange
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
