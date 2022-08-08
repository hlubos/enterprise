import url from './urls'
import $http from '../../common/http.js'

// // 获取用户跑步详情
// getRunnerInfo:'/sport/get_runner_info',
// // 上报跑步数据
// reportRunnerInfo:'/sport/report_runner_info',
// // 跑步结束页面详情
// runnerFinishDetail:'/sport_history/runner_finish_detail',
// // 用户历史数据总结
// userSportSummary:'/sport_history/user_sport_summary',

export default class LoginMember {
    static getRunnerInfo(params) {
        return $http.post(url.getRunnerInfo, params);
    }
    static reportRunnerInfo(params) {
        return $http.post(url.reportRunnerInfo, params);
    }
    static runnerFinishDetail(params) {
        return $http.post(url.runnerFinishDetail, params);
    }
    static userSportSummary(params) {
        return $http.post(url.userSportSummary, params);
    }
    static getDayPeakRecord(params) {
        return $http.post(url.getDayPeakRecord, params);
    }
    static AddTrackPic(params) {
        return $http.post(url.AddTrackPic, params);
    }
    static reportRunnerPathData(params) {
        return $http.post(url.reportRunnerPathData, params);
    }
}