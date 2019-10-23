import ActionTypes from './actionTypes'

export function login(token){
	return {type: ActionTypes.LOGIN, token}
}

export function unauthorized(from) {
	return {type: ActionTypes.UNAUTHORIZED, from}
}

export function logOut() {
	return {type: ActionTypes.LOG_OUT}
}