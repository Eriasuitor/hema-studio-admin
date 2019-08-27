import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import { Button, Drawer, Form, Input, Select, message } from 'antd';
import * as moment from 'moment'
import * as request from '../../request'

const { Option } = Select;

class NewCheckRecord extends React.Component {
  state = {
    submit: false,
    course: {},
    courses: [],
    enrollments: [],
    checkDesks: []
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
          const checkRecord = await request.addCheckRecord(values, this.props.history, { 428: () => '已使用该报名表在签到表上签到！' })
          message.info('添加签到成功')
          this.props.onSuccess(checkRecord)
        } catch (error) {

        } finally{
          this.setState({ submitting: false })
        }
      }
    });
  };

  handleClose = e => {
    e.preventDefault()
    this.props.onClose()
  }

  async queryCourses() {
    let coursesResult = await request.queryCourses({ pageSize: 10000 }, this.props.history)
    this.setState({ courses: coursesResult.rows })
  }

  async handleCourseChange(courseId) {
    let [enrollmentsResult, checkDesksResult] = await Promise.all([
      request.queryEnrollments({ userId: this.props.userInfo.id, courseId, status: 'confirmed' }),
      request.queryCheckDesks({ courseId })
    ])
    let enrollmentId = null
    let checkDeskId = null
    enrollmentsResult.count !== 0 && (enrollmentId = enrollmentsResult.rows[0].id)
    checkDesksResult.count !== 0 && (checkDeskId = checkDesksResult.rows[0].id)
    this.setState({ enrollments: enrollmentsResult.rows, checkDesks: checkDesksResult.rows, enrollmentId, checkDeskId })
  }

  async loadDate(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    switch (targetOption.type) {
      case 'enrollment':
        let enrollmentId
        let checkRecords
        break;

      default:
        let courseId = targetOption.value
        let enrollments = await request.queryEnrollments({ userId: this.props.userInfo.id, courseId, status: 'confirmed' })
        if (enrollments.count === 0) {
          targetOption.children = [{
            label: '无可用报名单',
            disabled: true
          }]
        }
        else {
          targetOption.children = enrollments.rows.map(enrollment => ({
            label: `${enrollment.name}-${enrollment.phone}-${enrollment.classBalance}`,
            value: enrollment.id,
            type: 'enrollment',
            isLeaf: false
          }))
        }
        break;
    }

    targetOption.loading = false
    this.setState({
      courseOptions: [...this.state.courseOptions],
    });
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
        title="新建签到表"
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="课程">
            {getFieldDecorator('userId', {
              initialValue: this.props.userInfo.id,
              rules: [
                { required: true, message: '请输入学号' },
                { type: 'number', min: 1000, max: 9999, message: '学号为4为数字' },
              ],
              getValueFromEvent: formatToInteger()
            })(<Input />)}
          </Form.Item>
          <Form.Item label="课程">
            {getFieldDecorator('courseId', {
              rules: [
                { required: true, message: '请选择课程' },
              ]
            })(<Select
              onChange={this.handleCourseChange.bind(this)}
            >{
                this.state.courses.map(course => (
                  <Option key={course.id} value={course.id}>{course.id} / {course.name}</Option>
                ))}</Select>)}
          </Form.Item>
          <Form.Item label="报名单">
            {getFieldDecorator('enrollmentId', {
              initialValue: this.state.enrollmentId,
              rules: [
                { required: true, message: '请选择报名单' },
              ]
            })(<Select>{
              this.state.enrollments.map(enrollment => (
                <Option key={enrollment.id} value={enrollment.id}>{enrollment.name}(余{enrollment.classBalance}课时)</Option>
              ))}</Select>)}
          </Form.Item>
          <Form.Item label="签到表">
            {getFieldDecorator('checkDeskId', {
              initialValue: this.state.checkDeskId,
              rules: [
                { required: true, message: '请选择签到表' },
              ]
            })(<Select>{
              this.state.checkDesks.map(checkDesk => (
                <Option key={checkDesk.id} value={checkDesk.id}>{moment(checkDesk.createdAt).format('YYYY-MM-DD HH:mm')} / {checkDesk.address}</Option>
              ))}</Select>)}
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
              onClick={() => { }}
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

export default Form.create({ name: 'register' })(NewCheckRecord)