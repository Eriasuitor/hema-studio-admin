const initialState = {
	token: null
  };

export function app(state = initialState, action) {
	return {
		...state,
		...{token: action.token}
	}
}