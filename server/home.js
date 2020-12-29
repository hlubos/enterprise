import url from './urls'
import $http from '../common/http.js'

export default class Home {
    static getHomePage (params) {
        return $http.post(url.getHomePage, params);
    }

    static reportUserAISportData (params) {
        return $http.post(url.reportUserAISportData, params);
    }

    static getAISportActionList (params) {
        return $http.post(url.getAISportActionList, params);
    }

}
