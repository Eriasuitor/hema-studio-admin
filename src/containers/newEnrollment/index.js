import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import {
  PageHeader, Tag, Tabs, Button, Statistic, Table, Icon, Col, Descriptions, Drawer, Form,
  Input,
  Tooltip,
  Cascader,
  Select,
  Row,
  Checkbox,
  InputNumber,
  Radio
} from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import * as moment from 'moment'
import * as request from '../../request'

class NewEnrollmentPanel extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    newEnrollment: {
      visible: true,
    },
    mode: 'inline',
    theme: 'light',
    userInfo: {},
    enrollments: [],
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
    console.log('member: ' + window.localStorage.token)
    store.dispatch(login(window.localStorage.token))
    console.log(this.props)
    this.setState({
      show: this.props.show
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(JSON.stringify(values))
        this.props.onSubmit(values)
      }
    });
  };

  async queryCourses() {
    let courses = await request.queryCourses(undefined, this.props.history)
    this.setState({
      courseOptions: courses.map(course => ({
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

  componentDidMount() {
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
        onClose={() => { }}
        visible={this.props.show}
      >
        {/* <WrappedNewEnrollment></WrappedNewEnrollment> */}
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="学号">
            {getFieldDecorator('userId', {
              rules: [
                { required: true, message: '请输入学号' },
                { type: 'number', min: 1000, max: 9999, message: '学号为4为数字' },
              ],
              getValueFromEvent: formatToInteger()
            })(<Input />)}
          </Form.Item>
          <Form.Item label="姓名">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入报名人姓名' },
                { max: 32, message: '用户姓名最长为32位' }
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="性别">
            {getFieldDecorator('gender', {
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
            <Row gutter={8}>
              <Col span={12}>
                {getFieldDecorator('ballance', {
                  rules: [
                    { required: true, message: '请设置剩余课时' },
                    { type: 'number', max: this.state.maxClassBalance, message: `剩余课时不得大于${this.state.maxClassBalance}` },
                  ],
                  getValueFromEvent: (event) => {
                    let value = parseInt(event.target.value.replace(/\D/g, ''))
                    if (isNaN(value)) return null
                    return value
                  }
                })(<Input />)}
              </Col>
              <Col span={12}>
                <Button>Get captcha</Button>
              </Col>
            </Row>
          </Form.Item>
          {/* <Form.Item> */}

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
              onClick={() => { }}
            >
              取消
            </Button>
            <Button style={{ marginRight: 8 }} onClick={() => this.props.form.resetFields()}>
              重置
            </Button>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </div>
          {/* </Form.Item> */}
        </Form>
      </Drawer>
    );
  }
}

export default withRouter(Form.create({ name: 'register' })(NewEnrollmentPanel))