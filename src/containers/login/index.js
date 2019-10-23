import React from 'react';
import { Form, Icon, Input, Button, Checkbox, PageHeader, Tag, Tabs, Statistic, Row, Col } from 'antd';
import './index.css'
import { Redirect } from 'react-router'
import { login } from '../../request'
import store from '../../reducer/index'
import { withRouter } from 'react-router'

class Login extends React.Component {
  constructor(props) {
    super(props)
    var storage = window.localStorage;
    if (storage.token)
      store.dispatch(store.actions.login(storage.token))
  }

  componentDidMount() {
    // fetch(`http://18.162.46.127:3801/campaign/5ozl0egzep/report-render?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzLCJyaWdodHMiOnsia29sIjp0cnVlLCJidXNpbmVzcyI6dHJ1ZX0sImlhdCI6MTU2Mzc3ODg1NH0.4cI2NPxtCpqLK8wMRF2vVYFdLLbsIkb2U6xzdH5udN8`,
    //   {
    //     method: 'POST'
    //   }
    // ).then(async res => {
    //   const blob = await res.blob()
    //   const a = window.document.createElement('a');
    //   const downUrl = window.URL.createObjectURL(blob);// 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
    //   const filename = res.headers.get('Content-Disposition').split('filename=')[1].split('.');
    //   a.href = downUrl;
    //   a.download = `${decodeURI(filename[0])}.${filename[1]}`;
    //   a.click();
    // })
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          const body = await login(values, {
            400: () => "请输入正确的账户格式",
            401: () => "账户或密码错误"
          })
          store.dispatch(store.actions.login(body.token))
          const storage = window.localStorage;
          storage.token = body.token;
          this.props.history.goBack()
        } catch (error) {

        }
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <div className='wholeBk'>
        <div className='loginPad'>
          <div className='title'>登录</div>
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
                />
              )}
            </Form.Item>
            <Form.Item className='item'>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入密码' }],
              })(
                <Input.Password
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="密码"
                />
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
    )
  }
}

const WrappedLogin = Form.create({ name: 'normal_login' })(withRouter(Login));

export default WrappedLogin