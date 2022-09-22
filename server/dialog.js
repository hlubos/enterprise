import url from './urls'
import $http from '../common/http.js'

export default class LoginMember {
  static pushWxRemind(params) {
    return $http.post(url.pushWxRemind, params)
  }
  static getUserDayStep(params) {
    return $http.post(url.getUserDayStep, params)
  }
}
