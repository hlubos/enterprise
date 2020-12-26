// created by zach He on 2019/12/25
import $http from './http'
import tool from './tool'

(function() {
	let config = {
		source: '', //上传图片来源, 必填项
		file: '',   //上传文件, 必填项
		success: null, //成功回调
		fail: null,    //失败回调
		progress: null //上传进度
	};
	let upToken = ''; //七牛token
	let photoId = 0;  //图片id
	
	function upload(obj){
		Object.assign(config, obj);
		getQiNiuToken();
	}
	// 拿到七牛上传token
	function getQiNiuToken(){
		let param = {qiniu_source: config.source}
		$http.post('/sport/qiniu_uptoken', param).then((res)=>{
		    if(res.code === 0){
		        upToken = res.up_token;
		        photoId = res.photo_id;
		        let obj = {
		            key: photoId + '.jpg',
		            token: upToken
		        }
		        uploadFile(obj);
		    } else {
				tool.eventBiz('225:6:1:1');
				config.fail && config.fail('获取token失败,请重试')
			}
		})
	}
	// 开始上传
	function uploadFile(obj){
		let uploadTask = wx.uploadFile({
			url: 'https://upload-z0.qiniup.com', //华南区
			filePath: config.file,
			name: 'file',
			formData: obj,
			success: function(res) {
				let data = res.data;
				try {
          if(typeof(data) != 'object'){ //微信小程序中会返回一个json字符串
              data = JSON.parse(data);
          }
					if(data.code == 0){
						getFileUrl();
					} else {
						config.fail && config.fail(data.msg);
						let errObj = {
							filePath: config.file,
							formData: obj,
							err_msg: '微信图片解析失败',
							err_tip: data.msg
						}
						tool.postErrLog(errObj, 'vue_reqerr'); //图片上传解析失败
					}
				} catch (e) {
					config.fail && config.fail('数据解析失败:' + e);
					let errObj = {
						filePath: config.file,
						formData: obj,
						err_msg: '微信上传失败',
						err_tip: e
					}
					// tool.postErrLog(errObj, 'vue_reqerr'); //图片上传解析失败
				}
			},
			fail: function(error) {
				config.fail && config.fail('上传失败,' + error);
				let errObj = {
					filePath: config.file,
					formData: obj,
					err_msg: '微信直接失败',
					err_tip: error
				}
				tool.postErrLog(errObj, 'vue_reqerr'); //图片上传解析失败
			}
		})
		
		uploadTask.onProgressUpdate((res) => {
			config.progress && config.progress(res)
		})
	}
	// 上传完成后获取链接
	function getFileUrl(){
	    let param = {
	        "filename": photoId + '.jpg',
	        "source": config.source
	    };
	    $http.post('/sport/get_qiniu_url', param).then((res)=>{
        if (res.code === 0) {
          let obj = {
            orig_url: res.orig_url,
            thumb_url: res.thumb_url,
            photoId: photoId,
          }
          config.success && config.success(obj)
        } else {
          config.fail && config.fail('获取图片链接失败,请重试');
          let errObj = {
            req_params: param,
            err_msg: '获取图片链接失败',
            err_tip: res.msg
          }
          tool.postErrLog(errObj, 'vue_reqerr'); //图片上传解析失败
			  }
	    })
	}
	
	module.exports = {
		upload: upload
	}
})()