export default {
  getsskey: '/sport/get_session_key', // 获取sskey

	//登录
  getPhoneCode: '/sport/send_phone_verify_code',
  checkPhoneCode: '/sport/check_phone_verify_code',
  authLogin: '/yd_auth/phone_connect_v2',
  register: '/wx_app/wxapp_register',            //注册新用户
  wxLogin: '/wx_app/wxapp_login',                //微信登录拿用户id
  
  getHomePage: '/match_burger_king/homepage', // 获取首页信息
}