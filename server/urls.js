export default {
  getsskey: '/sport/get_session_key', // 获取sskey

	//登录
  getPhoneCode: '/sport/send_phone_verify_code',
  checkPhoneCode: '/sport/check_phone_verify_code',
  authLogin: '/yd_auth/phone_connect_v2',
  register: '/wx_app/wxapp_register',            //注册新用户
  wxLogin: '/wx_app/wxapp_login',                //微信登录拿用户id
  getUserDayStep: '/wx_app/get_user_day_step',  // 同步步数
  
  getHomePage: '/match_burger_king/homepage', // 获取首页信息
  pushWxRemind: '/enterprise/push_wx_remind', // 提醒员工的接口
}