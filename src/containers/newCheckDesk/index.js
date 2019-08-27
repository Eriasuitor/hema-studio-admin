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

class NewCheckDesk extends React.Component {
  state = {
    courses: [],
    checkDesk: {},
    submitting: false
  }

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        try {
          const checkDesk = await request.addCheckDesk(values, this.props.history)
          message.info('创建成功！', 3)
          this.props.onSuccess(checkDesk)
        } catch (error) {

        } finally {
          this.setState({ submitting: false })
        }
      }
    })
  }

  componentWillMount() {
    this.setState({
      checkDesk: {
        ...this.state.checkDesk,
        ...this.props.checkDesk
      }
    })
    this.queryCourses()
  }

  async queryCourses() {
    let coursesResult = await request.queryCourses({ pageSize: 10000 }, this.props.history)
    this.setState({ courses: coursesResult.rows })
  }

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

  getFieldDecorator = this.props.form.getFieldDecorator;


  render() {
    return (
      <Drawer
        title="新建签到表"
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...this.formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="课程">
            {this.getFieldDecorator('courseId', {
              initialValue: this.state.checkDesk.courseId,
              rules: [
                { required: true, message: '请选择课程' },
              ]
            })(<Select>{
                this.state.courses.map(course => (
                  <Option key={course.id} value={course.id}>{course.id} / {course.name}</Option>
                ))}</Select>)}
          </Form.Item>
          <Form.Item label="地址">
            {this.getFieldDecorator('address', {
              initialValue: this.state.checkDesk.enrollmentId,
              rules: [
                {max: 100, message: '地址最长为100字'}
              ]
            })(<Input placeholder='选填' />)}
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
              创建
            </Button>
          </div>
        </Form>
      </Drawer>
    );
  }
}

export default Form.create({ name: 'register' })(NewCheckDesk)