import * as actions from './actions'
import {app} from './reducers'
import {createStore}  from 'redux'

let store = createStore(app)

store.actions = actions
// 打印初始状态
console.log(store.getState())

// 每次 state 更新时，打印日志
// 注意 subscribe() 返回一个函数用来注销监听器
const unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

// 发起一系列 action
// store.dispatch(login('Learn about actions'))

// 停止监听 state 更新
unsubscribe();

export default store