
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webUrl: '', // webview地址
  },

  onLoad: function (options) {
    this.initWebview(options)
  },

  async initWebview(option) {
  
    // let baseUrl = "https://work.51yund.com/vapps/new_work/"
    // let baseUrl = "http://localhost:8082/vapps/new_work/"
    let baseUrl = "https://test-hd.51yund.com/vapps/new_work/"

    let url = ''
    //接收从其他小程序页面传过来的参数，判断后跳转到webview的具体页面
    switch (option.to) {
      case 'personCenter':
        url = baseUrl + "personCenter"
        break;
      case 'rankList':
        url = baseUrl + "rankList"
        break;
      case 'createCompany':
        url = baseUrl + 'createCompany?imgUrl=' + option.imgUrl
        break;
      case 'login':
        if (option.enterprise_id) {
          url = baseUrl + 'index?is_login=true&user_id=' + option.user_id + '&xyy=' + option.xyy + '&enterprise_id=' + option.enterprise_id + '&invitor_user_id=' + option.invitor_user_id
        } else {
          url = baseUrl + 'index?is_login=true&user_id=' + option.user_id + '&xyy=' + option.xyy
        }
        break;
      case 'chalOperate':
        url = baseUrl + 'chalOperate?enterprise_id=' + option.enterprise_id + '&chal_type=' + option.chal_type
        break;
      case 'chalMain':
        url = baseUrl + 'chalMain?enterprise_id=' + option.enterprise_id + '&activity_id=' + option.activity_id + "&weixinStep=" + option.weixinStep
        break;
      case "invite":
        url = baseUrl + 'shareJoin?invitor_user_id=' + option.invitor_user_id + '&enterprise_id=' + option.enterprise_id + '&user_id=' + option.user_id + '&xyy=' + option.xyy
        break;
      default:
        url = `${baseUrl}appHome?user_id=${user_id}&xyy=${xyy}&is_login=true`
    }
    this.setData({
      webUrl: url
    })
  }

})