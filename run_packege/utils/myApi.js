const baseUrl = 'https://api.51yund.com'

function getRunnerInfoAPI(param){
    return new Promise((resolve, reject)=>{
        wx.request({
            url: baseUrl+'/sport/get_runner_info', 
            data: param,
            success (res) {
                resolve(result);
                console.log(res.data)
            },
            fail: (err) => {
                reject(err);
            }
        })
    })
}

export default {
    getRunnerInfoAPI
}