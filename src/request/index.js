import reqwest from 'reqwest'
import config from '../config/index'
import store from '../reducer/index'
import {logOut} from '../reducer/actions'

const diffStatusAction = {
	500: () => {
		alert('服务器出现意料之外的错误')
	},
	403: () => {
		alert('权限不足')
	},
	401: (history) => {
		alert('请登录')
		const storage = window.localStorage;
		storage.token = null;
		store.dispatch(logOut())
		history.push('/login')
	},
	400: () => {
		alert('请求数据不合法')
	}
}

export function responseStatusHandle(error, history){
	console.log(error.status)
	if(error.status){
		diffStatusAction[error.status](history)
	}
	else{
		alert('服务器失联，请稍后再试，如果此问题一直未能得到修复，请联系我们。')
	}
}

export async function get(url, query = {}, history){
	let res = await reqwest({
		url: `${config.host}${url}?${Object.keys(query).map(key => query[key] === undefined? '' : `${key}=${query[key]}`).join('&')}`,
		method: 'GET',
		type: 'json',
		headers: {
			Authorization: `Bearer ${store.getState().token}`
		}
	}).catch(err => responseStatusHandle(err, history))
	return res
}


export function getMembers(query, history) {
	return get('/users', query, history)
}

export function getUserInfo(userId, history) {
	return get(`/users/${userId}`, undefined, history)
}

export function queryEnrollments(query, history) {
	return get(`/enrollments`, query, history)
}

export function queryCheckRecords(query, history) {
	return get(`/check-records`, query, history)
}