import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import { Button, Drawer, Form, Input, Cascader, Select, InputNumber, Radio, message } from 'antd';
import * as request from '../../request'
import { EnrollmentStatus } from '../../common';

const { Option } = Select;

class NewEnrollment extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
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
    checkRecordLoading: false,
    show: false
  };

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
  }

  componentDidMount() {
    this.queryCourses()
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        try {
          this.setState({ submitting: true })
          values.pricePlanId = values.courseAndPricePlanId[1]
          delete values.courseAndPricePlanId
          const enrollment = await request.addEnrollment(values)
          message.success('新建报名表成功')
          this.props.onSuccess(enrollment)
        } catch (error) {

        } finally {
          this.setState({ submitting: false })
        }
      }
    });
  }

  async queryCourses() {
    let courses = await request.queryCourses(undefined, this.props.history)
    this.setState({
      courseOptions: courses.rows.map(course => ({
        label: course.name,
        value: course.id,
        children: course.pricePlans.map(pricePlan => ({
          label: `${pricePlan.class}课时(¥${pricePlan.price})`,
          class: pricePlan.class,
          value: pricePlan.id
        }))
      }))
    })
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
          <Form.Item label="学号">
            {getFieldDecorator('userId', {
              initialValue: this.state.userInfo.id,
              rules: [
                { required: true, message: '请输入学号' },
                { type: 'number', min: 1000, max: 9999, message: '学号为4为数字' },
              ],
              getValueFromEvent: formatToInteger()
            })(<Input />)}
          </Form.Item>
          <Form.Item label="姓名">
            {getFieldDecorator('name', {
              initialValue: this.state.userInfo.nickname,
              rules: [
                { required: true, message: '请输入报名人姓名' },
                { max: 32, message: '用户姓名最长为32位' }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="性别">
            {getFieldDecorator('gender', {
              initialValue: 'female',
              rules: [
                { required: true, message: '请选择性别' },
              ],
            })(<Radio.Group >
              <Radio value='male'>男</Radio>
              <Radio value='female'>女</Radio>
            </Radio.Group>)}
          </Form.Item>
          <Form.Item
            label="手机号" >
            {getFieldDecorator('phone', {
              initialValue: this.state.userInfo.phone,
              rules: [
                { required: true, message: '请输入手机号' },
                { pattern: /^\d{6,15}$/, message: '手机号均为数字且准许长度为6-15位' }
              ],
              getValueFromEvent: (event) => {
                return event.target.value.replace(/\D/g, '')
              }
            })(<Input />)}
          </Form.Item>
          <Form.Item label="课程及方案">
            {getFieldDecorator('courseAndPricePlanId', {
              rules: [
                { type: 'array', required: true, message: '请选择课程及付费方案' },
              ],
            })(<Cascader placeholder='' onChange={(value, object) => {
              this.setState({ maxClassBalance: object[1].class })
            }} options={this.state.courseOptions} />)}
          </Form.Item>
          <Form.Item label="剩余课时">
            {getFieldDecorator('classBalance', {
              initialValue: this.state.maxClassBalance,
              rules: [
                { required: true, message: '请设置剩余课时' },
                {
                  type: 'number', min: 0, max: this.state.maxClassBalance, message: `此字段需为自然数(0或正整数)${this.state.maxClassBalance ? `且不得大于${this.state.maxClassBalance}` : ''}`
                }
              ],
            })(<InputNumber min={0} />)}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: 'created',
              rules: [
                { required: true, message: '请选择报名报状态' }
              ],
            })(<Radio.Group initialValue={EnrollmentStatus.created}>
              {Object.keys(EnrollmentStatus).map(status => <Radio.Button key={status} value={status}>{EnrollmentStatus[status]}</Radio.Button>)}
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
        </Form>
      </Drawer>
    );
  }
}

export default Form.create({ name: 'register' })(NewEnrollment)