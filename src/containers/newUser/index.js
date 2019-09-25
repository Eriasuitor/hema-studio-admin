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
import { ImageCard } from '../../components/imageCard'

const { Option } = Select;

class NewUser extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    newEnrollment: {
      visible: true,
    },
    courses: [],
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
    user: {
      status: 'normal'
    },
    mode: 'create',
    statusDescription: '确认'
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        try {
          this.setState({ statusDescription: '获取上传链接' })
          const originFileObjList = []
          const fileInfos = []
          if(values.avatars) {
            if (values.avatars.length > 1) {
              return message.warn('头像只能上传一张图片')
            }
            values.avatars.filter(image => !image.url).forEach(image => {
              originFileObjList.push(image.originFileObj)
              fileInfos.push({
                fileName: image.name,
                fileType: image.type,
                size: image.size,
                lastModified: image.lastModified,
              })
            })
            if(fileInfos.length !== 0) {
              const urls = await request.getOssUrls({ type: 'cover', fileInfos }, this.props.history)
              this.setState({ statusDescription: '上传图片' })
              for (let i = 0; i < urls.length; i++) {
                await request.postImage(urls[i], originFileObjList[i], this.props.history)
              }
              let counter = 0
              values.avatars = values.avatars.map(image => image.url || `${urls[counter++].match(/(^.*?)\?/)[1]}!saver`)
            }
            values.avatar = values.avatars[0]
            delete values.avatars
          }
          this.setState({ statusDescription: '保存数据' })
          if (this.state.mode === 'create') {
            await request.addUser(values, this.props.history)
            message.success('创建成功')
          } else {
            await request.updateUser(this.props.user.id, values, this.props.history)
            message.success('保存成功')
          }
          this.props.onSubmitted()
        } catch (error) {
          console.log(error)
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
        title={`${this.state.mode === 'create' ? '创建' : '编辑'}学员`}
        width={520}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="昵称">
            {getFieldDecorator('nickname', {
              initialValue: this.state.user.nickname,
              rules: [
                { required: true, message: '请输入昵称' },
                { max: 32, message: '昵称最长为32位' },
              ]
            })(<Input></Input>)}
          </Form.Item>
          <Form.Item label="性别">
            {getFieldDecorator('gender', {
              initialValue: this.state.user.gender,
              rules: [
                // { required: true, message: '请选择性别' },
              ]
            })(<Radio.Group >
              <Radio value='male'>男</Radio>
              <Radio value='female'>女</Radio>
            </Radio.Group>)}
          </Form.Item>
          <Form.Item label="手机号">
            {getFieldDecorator('phone', {
              initialValue: this.state.user.phone,
              rules: [
                // { required: true, message: '请输入手机号' },
                { pattern: /^\d{6,15}$/, message: '手机号均为数字且准许长度为6-15位' }
              ]
            })(<Input></Input>)}
          </Form.Item>
          <Form.Item label="密码">
            {getFieldDecorator('password', {
              initialValue: this.state.user.password,
              rules: [
                // { required: true, message: '请输入密码' },
                { max: 32, message: '密码最长为32位' },
              ]
            })(<Input></Input>)}
          </Form.Item>
          <Form.Item label="头像" extra="上传一张图片作为该用户的头像">
            {getFieldDecorator('avatars', {
              rules: [
              ]
            })(
              <ImageCard initialValue={[this.state.user.avatar]} />
            )}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: this.state.user.status,
              rules: [
                // { required: true, message: '请选择状态' },
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

export default Form.create({ name: 'register' })(NewUser)