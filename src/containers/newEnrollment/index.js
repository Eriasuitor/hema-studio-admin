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
    courses: [],
    enrollment: {
      gender: 'female',
      status: 'confirmed'
    },
    submitting: false,
    type: 'create',
    courseOptions: []
  };

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
  }

  componentWillMount() {
    this.queryCourses()
    if (this.props.enrollment) {
      this.setState({
        enrollment: {
          ...this.state.enrollment,
          ...this.props.enrollment
        },
        type: this.props.type || this.state.type
      })
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        try {
          values.pricePlanId = values.courseAndPricePlanId[1]
          delete values.courseAndPricePlanId
          let enrollment = null
          if (this.state.type === 'create') {
            enrollment = await request.addEnrollment(values)
            message.success('新建报名表成功')
          } else {
            enrollment = await request.updateEnrollment(this.props.enrollment.id, values)
            message.success('保存报名表成功')
          }
          this.props.onSuccess(enrollment)
        } catch (error) {

        } finally {
          this.setState({ submitting: false })
        }
      }
    });
  }

  async queryCourses() {
    try {
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
    } catch (error) {

    }
  }

  getFieldDecorator = this.props.form.getFieldDecorator;

  formItemLayout = {
    labelCol: {
      xs: { span: 20 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  render() {
    if(this.props.enrollment) {
      this.props.enrollment.courseAndPricePlanId = [this.props.enrollment.courseId, this.props.enrollment.pricePlanId]
    }
    console.log(this.props.enrollment.courseAndPricePlanId)
    const initialEnrollment = {
      ...this.state.enrollment,
      ...this.props.enrollment
    }
    return (
      <Drawer
        title={`${this.state.type==='edit'? '编辑': '新建'}报名单`}
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...this.formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="学号">
            {this.getFieldDecorator('userId', {
              initialValue: initialEnrollment.userId,
              rules: [
                { required: true, message: '请输入学号' },
                { type: 'number', min: 1000, max: 9999, message: '学号为4位数字' },
              ],
              getValueFromEvent: formatToInteger()
            })(<Input />)}
          </Form.Item>
          <Form.Item label="姓名">
            {this.getFieldDecorator('name', {
              initialValue: initialEnrollment.name,
              rules: [
                { required: true, message: '请输入报名人姓名' },
                { max: 32, message: '用户姓名最长为32位' }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="性别">
            {this.getFieldDecorator('gender', {
              initialValue: initialEnrollment.gender,
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
            {this.getFieldDecorator('phone', {
              initialValue: initialEnrollment.phone,
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
            {this.getFieldDecorator('courseAndPricePlanId', {
              initialValue: initialEnrollment.courseAndPricePlanId,
              rules: [
                { type: 'array', required: true, message: '请选择课程及付费方案' },
              ],
            })(<Cascader placeholder='' onChange={(value, object) => {
              this.setState({ maxClassBalance: object[1].class })
            }} options={this.state.courseOptions} />)}
          </Form.Item>
          <Form.Item label="剩余课时">
            {this.getFieldDecorator('classBalance', {
              initialValue: initialEnrollment.classBalance === undefined? this.state.maxClassBalance : initialEnrollment.classBalance,
              rules: [
                { required: true, message: '请设置剩余课时' },
                {
                  type: 'number', min: 0, max: this.state.maxClassBalance, message: `此字段需为自然数(0或正整数)${this.state.maxClassBalance ? `且不得大于${this.state.maxClassBalance}` : ''}`
                }
              ],
            })(<InputNumber min={0} />)}
          </Form.Item>
          <Form.Item label="状态">
            {this.getFieldDecorator('status', {
              initialValue: initialEnrollment.status,
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
              zIndex: 100
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
    )
  }
}

export default Form.create({ name: 'register' })(NewEnrollment)