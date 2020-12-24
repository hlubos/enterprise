import url from './urls'
import $http from '../common/http.js'

export default class LoginMember {
    static getHomePage(params) {
        return $http.post(url.getHomePage, params);
    }
}
