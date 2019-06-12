import ActionTypes from './actionTypes'

const initialState = {
	token: null,
	redirect: { from: null }
};

const diffAction = {
	[ActionTypes.LOGIN]: (state, action) => {
		return {
			...state,
			...{ token: action.token }
		}
	},
	[ActionTypes.UNAUTHORIZED]: (state, action) => {
		return {
			...state,
			...{ redirect: { from: action.from } }
		}
	},
	default: () => initialState
}

export function app(state = initialState, action) {
	return (diffAction[action.type] || diffAction.default)(state, action)
}