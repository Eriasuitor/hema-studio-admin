import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import './index.css'
import { connect } from 'react-redux'
import {login} from '../../reducer/actions'
import store from '../../reducer/index'

class Login extends React.Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        store.dispatch(store.actions.login('You are mt sunshine'))
        console.log('Received values of form: ', values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className='wholeBk'>
        <div className='loginPad'>
          <div className='title'>登录</div>
          {}
          <Form onSubmit={this.handleSubmit}>
            <Form.Item className='item'>
              {getFieldDecorator('userId', {
                rules: [{ required: true, message: '请输入账号' }],
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
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="密码"
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

const WrappedLogin = Form.create({ name: 'normal_login' })(Login);

export default WrappedLogin