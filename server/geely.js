import url from './urls'
import $http from '../common/http.js'

export default class Geely {
  static getShareInfos(params) {
    return $http.post(url.getShareInfos, params)
  }
}
