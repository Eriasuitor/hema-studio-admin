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
  Radio,
  List
} from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import * as moment from 'moment'
import * as request from '../../request'
import { EnrollmentStatus } from '../../common';
import { thisExpression } from '@babel/types';

const { Option } = Select;
const { TextArea } = Input

class NewCourse extends React.Component {
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
    checkRecordLoading: false,
    showNewCourse: true,
    showPricePlanPanel: true
  };

  constructor(props) {
    super(props)
    console.log('member: ' + window.localStorage.token)
    store.dispatch(login(window.localStorage.token))
    this.handleClose = this.handleClose.bind(this)
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        delete values.courseId
        let { success } = await request.addCheckRecord(values, this.props.history, { 428: () => '该用户已使用指定报名表在此签到表签到' })
        this.setState({ submitting: false })
        if (success) {
          this.setState({ showNewCheckRecordPanel: false })
          alert('添加签到表成功')
          this.queryCheckRecords()
        }
      }
    });
  };

  handleClose = e => {
    e.preventDefault()
    this.props.onClose()
  }

  async queryCourses() {
    let courses = await request.queryCourses({ pageSize: 10000 }, this.props.history)
    this.setState({ courses })
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
        title="新建课程"
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Drawer
          title="Two-level Drawer"
          width={320}
          closable={true}
          onClose={() => this.setState({ showPricePlanPanel: false })}
          visible={this.state.showPricePlanPanel}
        >
          <List
            itemLayout="vertical"
            size="large"
            dataSource={[{ price: 100.11 }]}
            footer={
              <div>
                <b>ant design</b> footer part
      </div>
            }
            renderItem={item => (
              <List.Item
                key={item.title}
              >
                <List.Item.Meta
                  title={<a href={item.price}>{item.title}</a>}
                  description={item.description}
                />
                {item.content}
              </List.Item>
            )}
          />
        </Drawer>
        {/* <WrappedNewEnrollment></WrappedNewEnrollment> */}
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="名称">
            {getFieldDecorator('name', {
              // initialValue: this.props.userInfo.id,
              rules: [
                { required: true, message: '请输入课程名称' },
                { max: 36, message: '课程名称最长为36字' },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="描述">
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: '请填写课程描述' },
              ]
            })(<TextArea
              autosize={{ minRows: 2 }}
            />)}
          </Form.Item>
          <Form.Item label="礼物">
            {getFieldDecorator('p', {
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

export default Form.create({ name: 'register' })(NewCourse)