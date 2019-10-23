import reqwest from 'reqwest'
import config from '../config/index'
import store from '../reducer/index'
import { logOut } from '../reducer/actions'
import { message } from 'antd'

const diffStatusAction = {
	500: () => {
		return '服务器出现意料之外的错误！'
	},
	403: () => {
		return '权限不足！'
	},
	401: (history) => {
		const storage = window.localStorage;
		storage.token = null;
		store.dispatch(logOut())
		history && history.push('/login')
		return '请登录！'
	},
	400: () => {
		return '提交的数据不合法！'
	},
	404: () => {
		return '功能已被迁移或永久移除！'
	}
}

export function responseNot2StatusHandle(res, history, statusHandler = {}) {
	if (res.status < 200 || res.status >= 300) {
		const handler = statusHandler[res.status] || diffStatusAction[res.status]
		res.handleMessage = handler ? handler(history) : ""
		const error = new Error(res.message)
		error.res = res
		throw error
	}
}

export function responseStatusHandle(res, history, statusHandler = {}) {
	responseNot2StatusHandle(res, history, statusHandler)
	if ([204, 205].includes(res.status)) {
		return null
	}
	return res.json()
}

export function handleError(err) {
	let { res } = err
	message.warning((res && res.handleMessage) || ((res && res.status && '出现未被预见的错误，请告知我们，我们将尽快修复') || '服务器失联，请稍后再试，如果此问题一直未能得到修复，请联系我们。'))
	throw err
}

export async function get(url, query = {}, history, statusHandler) {
	console.log(query)
	Object.keys(query).forEach(key => (query[key] === undefined || query[key].length === 0) && delete query[key])
	let body = await fetch(`${config.host}${url}?${Object.keys(query).map(key => {
		if( Array.isArray(query[key])) {
			return query[key].map(value => `${key}[]=${value}`).join('&')
		}
		return `${key}=${query[key]}`
	}).join('&')}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${store.getState().token}`
		}
	}).then(res => responseStatusHandle(res, history, statusHandler)).catch(handleError)
	return body
}

export async function put(url, data = {}, history, statusHandler) {
	let body = await fetch(`${config.host}${url}`, {
		body: JSON.stringify(data),
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${store.getState().token}`,
			'Content-Type': 'application/json',
		}
	}).then(res => responseStatusHandle(res, history, statusHandler)).catch(handleError)
	return body
}

export async function post(url, data = {}, history, statusHandler) {
	let body = await fetch(`${config.host}${url}`, {
		body: JSON.stringify(data),
		method: 'POST',
		headers: {
			Authorization: `Bearer ${store.getState().token}`,
			'Content-Type': 'application/json',
		}
	}).then(res => responseStatusHandle(res, history, statusHandler)).catch(handleError)
	return body
}

export function login(body, statusHandler) {
	return post('/users/admin-login', body, undefined, statusHandler)
}

export function getMembers(query, history) {
	return get('/users', query, history)
}

export function getUserInfo(userId, history) {
	return get(`/users/${userId}`, undefined, history)
}

export function getCourse(courseId, history) {
	return get(`/courses/${courseId}`, undefined, history)
}

export function queryEnrollments(query, history) {
	return get(`/enrollments`, query, history)
}

export function queryCheckRecords(query, history) {
	return get(`/check-records`, query, history)
}

export function queryCourses(query, history) {
	return get(`/courses`, query, history)
}

export function addEnrollment(data, history) {
	let { userId } = data
	delete data.userId
	return post(`/users/${userId}/enrollments`, data, history)
}

export function updateEnrollment(enrollmentId, data, history) {
	return put(`/enrollments/${enrollmentId}`, data, history)
}

export async function getEnrollment(enrollmentId, history) {
	const { rows } = await get(`/enrollments?id=${enrollmentId}`, undefined, history)
	return rows[0]
}

/**
 * 
 * @param {{courseId: number, address?: string}} data 
 * @param {*} history 
 * @param {*} statusHandler 
 */
export function addCheckDesk(data, history, statusHandler) {
	let { courseId } = data
	delete data.courseId
	return post(`/courses/${courseId}/check-desks`, data, history, statusHandler)
}

export function queryCheckDesks(query, history) {
	return get(`/check-desks`, query, history)
}

export function addCheckRecord(data, history, statusHandler) {
	let { checkDeskId } = data
	delete data.checkDeskId
	return post(`/check-desks/${checkDeskId}/check-records`, data, history, statusHandler)
}

export function updateCheckDesk(checkDeskId, data, history, statusHandler) {
	return put(`/check-desks/${checkDeskId}`, data, history, statusHandler)
}

export function addUser(data, history, statusHandler) {
	return post(`/users`, data, history, statusHandler)
}

export function updateUser(userId, data, history, statusHandler) {
	return put(`/users/${userId}`, data, history, statusHandler)
}

export function addCourse(data, history, statusHandler) {
	return post(`/courses`, data, history, statusHandler)
}

export function updateCourse(courseId, data, history, statusHandler) {
	return put(`/courses/${courseId}`, data, history, statusHandler)
}

export function getOssUrls(fileInfos, history, statusHandler) {
	return post(`/cloud/oss/bulk-url-generator`, fileInfos, history, statusHandler)
}

export async function postImage(url, file, history, statusHandler) {
	return fetch(url, {
		body: file,
		method: 'PUT',
		headers: {
			'Content-Type': 'application/octet-stream',
		},
		mode: 'cors'
	}).then(res => responseNot2StatusHandle(res, history, statusHandler)).catch(handleError)
}

export async function addHomework(checkDeskId, data, history, statusHandler) {
	return post(`/check-desks/${checkDeskId}/homeworks`, data, history, statusHandler)
}

export async function queryHomeworks( query, history, statusHandler) {
	return get('/homeworks', query, history, statusHandler)
}

export async function getBusinessStatistics(history, statusHandler) {
	return get('/systems/business/statistics', undefined, history, statusHandler)
}