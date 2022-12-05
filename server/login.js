import url from './urls'
import $http from '../common/http.js'

export default class LoginMember {
  static getPhoneCode(params) {
    return $http.post(url.getPhoneCode, params)
  }

  static checkPhoneCode(params) {
    return $http.post(url.checkPhoneCode, params)
  }

  static authLogin(params) {
    return $http.post(url.authLogin, params)
  }

  static wxLogin(params) {
    return $http.post(url.wxLogin, params)
  }

  static register(params) {
    return $http.post(url.register, params)
  }

  static getUserDayStep(params) {
    return $http.post(url.getUserDayStep, params)
  }
}
