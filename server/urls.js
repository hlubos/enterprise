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
  getUserHistory: '/yd_ai_coach/get_user_history_data', // 获取历史记录
  reportUserAISportData: '/yd_ai_coach/report_user_sport_data',  // 上报AI训练运动数据
  getAISportActionList: '/yd_ai_coach/action_list',  // AI动作数据列表


  // 跑步相关接口  
  // 获取用户跑步详情
  getRunnerInfo:'https://api20.51yund.com/sport/get_runner_info',
  // getRunnerInfo:'/sport/get_runner_info',
  // 上报跑步数据
  reportRunnerInfo:'/sport/report_runner_info',
  // 跑步结束页面详情
  runnerFinishDetail:'/sport_history/runner_finish_detail',
  // 用户历史数据总结
  userSportSummary:'/sport_history/user_sport_summary',
  // 运动轨迹缩略图 
  getDayPeakRecord:'/yd_runner/get_day_peak_record',
  // 上传运动轨迹缩略图
  AddTrackPic:'/yd_runner/add_track_pic',
  // 上传运动轨迹点集合
  reportRunnerPathData:'/sport/report_runner_path_data',
  // 获取轨迹点集合
  getRunnerPathData:'/sport/get_runner_path_data',
}