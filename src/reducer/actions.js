import ActionTypes from './actionTypes'

export function login(token){
	return {type: ActionTypes.LOGIN, token}
}