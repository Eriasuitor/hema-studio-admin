import ActionTypes from './actionTypes'

export function login(token){
	console.log(ActionTypes)
	return {type: ActionTypes.LOGIN, token}
}

export function unauthorized(from) {
	return {type: ActionTypes.UNAUTHORIZED, from}
}