import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import { Button, Drawer, Form, Input, Select, message, DatePicker, Checkbox } from 'antd';
import * as request from '../../request'
import { AccountStatus } from '../../common';
import { thisExpression } from '@babel/types';
import { ImageCard } from '../../components/imageCard'

const { TextArea } = Input

class App extends React.Component {
  state = {
    mode: 'create',
    body: {},
    submitting: false,
    entityDesc: '通知',
    statusDescription: '确定'
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        try {
          this.setState({ statusDescription: '创建中' })
          await request.addAnnouncement(values, this.props.history)
          message.success('创建成功')
          this.props.onSubmitted()
        } catch (error) {
          this.setState({ submitting: false, statusDescription: '确认' })
        } finally {
          this.setState({ show: false, submitting: false, statusDescription: '确认' })
        }
      }
    })
  }

  componentDidMount() {
    if (this.props.user) {
      this.setState({
        mode: this.props.mode || this.state.mode,
        user: {
          ...this.state.user,
          ...this.props.user,
        }
      })
    }
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
  }

  formItemList = [{
    label: '标题',
    key: 'title',
    rules: [
      { required: true, message: '请输入标题' },
      { max: 24, message: '昵称最长为24位' },
    ],
    input: <Input placeholder="如：假期来袭；需简短地指出通知的类型。" />
  }, {
    label: '概括',
    key: 'summary',
    rules: [
      { required: true, message: '请输入概括' },
      { max: 256, message: '昵称最长为256位' },
    ],
    input: <Input placeholder="如：端午节放假通知；需指出通知的大致主题。" />
  }, {
    label: '详情',
    key: 'more',
    rules: [
      { required: true, message: '请输入详情' },
      { max: 256, message: '详情最长为256位' },
    ],
    input: <TextArea autosize={{ minRows: 2 }} placeholder="如：2019年10月12日-2019年10月15日画室放假，课程暂停；需指出具体的通知内容。"/>
  }, {
    label: '开始时间',
    key: 'startedAt',
    rules: [
      { required: true, message: '请输入开始通知时间' },
    ],
    input: <DatePicker placeholder='此为开始向用户展示通知的开始时间' style={{ width: '100%' }} showTime />
  }, {
    label: '结束时间',
    key: 'endedAt',
    rules: [
      { required: true, message: '请输入结束通知时间' },
    ],
    input: <DatePicker placeholder='此为停止向用户展示通知的时间' style={{ width: '100%' }} showTime />
  }]

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Drawer
        title={`${this.state.mode === 'create' ? '创建' : '编辑'}${this.state.entityDesc}`}
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...this.formItemLayout} onSubmit={this.handleSubmit}>
          {
            this.formItemList.map(formItem =>
              <Form.Item label={formItem.label} extra={formItem.extra} >
                {
                  getFieldDecorator(formItem.key, {
                    initialValue: this.state.body[formItem.key],
                    rules: formItem.rules
                  })(formItem.input)
                }
              </Form.Item>
            )
          }
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
              zIndex: 2
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
              {this.state.statusDescription}
            </Button>
          </div>
          {/* </Form.Item> */}
        </Form>
      </Drawer>
    );
  }
}

export default Form.create({ name: 'register' })(App)