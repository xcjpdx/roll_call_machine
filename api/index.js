import $http from '../js_sdk/zhouWei-request/requestConfig';
//**
//*{load:false} 是否出现加载框
// */
/**
 * @param {string} name 隐私政策:privacy 用户协议:user_agreement 关于我们:about_our
 */
export const $accord = (name) => $http.post('/accord', {
	name
});

/**
 * 登录
 */
export const $login = (code) => $http.get('/merchant/login', {
	code
}, {
	load: true
});