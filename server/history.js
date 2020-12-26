import url from './urls'
import $http from '../common/http.js'

export default class History {
    static getUserHistory(params) {
        return $http.post(url.getUserHistory, params);
    }
}
