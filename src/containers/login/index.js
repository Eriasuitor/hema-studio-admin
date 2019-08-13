import React from 'react';
import { Form, Icon, Input, Button, Checkbox, PageHeader, Tag, Tabs, Statistic, Row, Col } from 'antd';
import './index.css'
import { Redirect } from 'react-router'
import store from '../../reducer/index'
import {withRouter} from 'react-router'

class Login extends React.Component {
  constructor(props) {
    super(props)
    var storage = window.localStorage;
    if (storage.token)
      store.dispatch(store.actions.login(storage.token))
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        fetch('http://localhost:10086/users/admin-login', { method: 'POST', body: JSON.stringify(values), headers: { 'content-type': 'application/json' } })
          .then(res => {
            switch (res.status) {
              case 400:
                alert('请输入正确的账户格式')
                break;
              case 401:
                alert('账户或密码错误')
                break;
              case 200:
                res.json().then(body => {
                  store.dispatch(store.actions.login(body.token))
                  const storage = window.localStorage;
                  storage.token = body.token;
                  console.log(storage.toke)
                  this.props.history.goBack()
                })
                break;
              default:
                alert('服务器失联')
                break;
            }
          })

        console.log('Received values of form: ', values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    console.log(store.getState().token)
    // if (store.getState().token) return (<Redirect to='/index' />)
    return (
      <div className='wholeBk'>
        <div className='loginPad'>
          <div className='title'>登录</div>
          {store.getState().token || 1}
          {store.getState().redirect.from || 1}
          <Form onSubmit={this.handleSubmit}>
            <Form.Item className='item'>
              {getFieldDecorator('userId', {
                rules: [
                  { required: true, message: '请输入账号' }
                ],
                getValueFromEvent: (event) => {
                  let value = parseInt(event.target.value.replace(/\D/g, ''))
                  if (isNaN(value)) return null
                  return value
                },
              })(
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="账号"
                />,
              )}
            </Form.Item>
            <Form.Item className='item'>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入密码' }],
              })(
                <Input.Password
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="码"
                />,
              )}
            </Form.Item>
            <Form.Item className='item'>
              <Button type="primary" htmlType="submit" className="login-form-button">
                登录
        </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

    );
  }
}

const WrappedLogin = Form.create({ name: 'normal_login' })(withRouter(Login));

export default WrappedLogin