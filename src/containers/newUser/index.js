import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import { Button, Drawer, Form, Input, Select, message, Radio } from 'antd';
import * as request from '../../request'
import { AccountStatus } from '../../common';
import { thisExpression } from '@babel/types';

const { Option } = Select;

class NewUser extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    newEnrollment: {
      visible: true,
    },
    courses: [],
    mode: 'inline',
    theme: 'light',
    userInfo: {},
    enrollments: [],
    checkDesks: [],
    enrollmentId: null,
    checkDeskId: null,
    pagination: {
      pageSize: 10
    },
    checkRecordPagination: {
      pageSize: 10
    },
    loading: false,
    checkRecordLoading: false
  };

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
    this.handleClose = this.handleClose.bind(this)
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        try {
          delete values.courseId
          await request.addUser(values, this.props.history, { 428: () => '该用户已使用指定报名表在此签到表签到' })
          message.success('新增用户成功')
          this.props.onSubmitted()
        } catch (error) {

        } finally {
          this.setState({ show: false, submitting: false })
        }
      }
    })
  }

  handleClose = e => {
    e.preventDefault()
    this.props.onClose()
  }

  async queryCourses() {
    try {
      let courses = await request.queryCourses({ pageSize: 10000 }, this.props.history)
      this.setState({ courses })
    } catch (error) {

    }
  }

  async handleCourseChange(courseId) {
    try {
      let [enrollmentsResult, checkDesksResult] = await Promise.all([
        request.queryCheckDesks({ courseId })
      ])
      let enrollmentId = null
      let checkDeskId = null
      enrollmentsResult.count !== 0 && (enrollmentId = enrollmentsResult.rows[0].id)
      checkDesksResult.count !== 0 && (checkDeskId = checkDesksResult.rows[0].id)
      this.setState({ enrollments: enrollmentsResult.rows, checkDesks: checkDesksResult.rows, enrollmentId, checkDeskId })
    } catch (error) {

    }
  }

  componentDidMount() {
    this.setState({ show: this.props.show })
    this.queryCourses()
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 20 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <Drawer
        title="新建报名单"
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="昵称">
            {getFieldDecorator('nickname', {
              rules: [
                { required: true, message: '请输入昵称' },
                { max: 32, message: '昵称最长为32位' },
              ]
            })(<Input></Input>)}
          </Form.Item>
          <Form.Item label="性别">
            {getFieldDecorator('gender', {
              initialValue: 'female',
              rules: [
                { required: true, message: '请选择性别' },
              ]
            })(<Radio.Group >
              <Radio value='male'>男</Radio>
              <Radio value='female'>女</Radio>
            </Radio.Group>)}
          </Form.Item>
          <Form.Item label="手机号">
            {getFieldDecorator('phone', {
              rules: [
                { required: true, message: '请输入手机号' },
                { pattern: /^\d{6,15}$/, message: '手机号均为数字且准许长度为6-15位' }
              ]
            })(<Input></Input>)}
          </Form.Item>
          <Form.Item label="密码">
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: '请输入密码' },
                { max: 32, message: '密码最长为32位' },
              ]
            })(<Input></Input>)}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: 'normal',
              rules: [
                { required: true, message: '请选择状态' },
              ]
            })(<Radio.Group>
              {Object.keys(AccountStatus).map(status => <Radio.Button value={status}>{AccountStatus[status]}</Radio.Button>)}
            </Radio.Group>)}
          </Form.Item>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.props.onClose}
            >
              取消
            </Button>
            <Button style={{ marginRight: 8 }} onClick={() => this.props.form.resetFields()}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" loading={this.state.submitting}>
              确认
            </Button>
          </div>
          {/* </Form.Item> */}
        </Form>
      </Drawer>
    );
  }
}

export default Form.create({ name: 'register' })(NewUser)