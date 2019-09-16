import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import { Button, Drawer, Form, Input, Select, message } from 'antd';
import * as moment from 'moment'
import * as request from '../../request'
import { ImageCard } from '../../components/imageCard'

const { Option } = Select;
const { TextArea } = Input

class App extends React.Component {
  state = {
    submit: false,
    homework: {
      images: []
    },
    statusDescription: '确认',
    courses: [],
    enrollments: [],
    checkDesks: [],
    checkRecord: {}
  };

  componentDidMount() {
    this.handleClose = this.handleClose.bind(this)
    if (this.props.homework) {
      this.setState({ homework: this.props.homework})
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true })
        try {
          const originFileObjList = []
          const fileInfos = []
          const {checkDeskId} = values
          delete values.checkDeskId
          values.images.filter(image => !image.url).forEach(image => {
            originFileObjList.push(image.originFileObj)
            fileInfos.push({
              fileName: image.name,
              fileType: image.type,
              size: image.size,
              lastModified: image.lastModified,
            })
          })
          const urls = await request.getOssUrls({ type: 'cover', fileInfos }, this.props.history)
          this.setState({ statusDescription: '上传图片' })
          for (let i = 0; i < urls.length; i++) {
            await request.postImage(urls[i], originFileObjList[i], this.props.history)
          }
          let counter = 0
          values.images = values.images.map(image => image.url || `${urls[counter++].match(/(^.*?)\?/)[1]}!saver`)
          this.setState({ statusDescription: '创建作业' })
          const homework = await request.addHomework(checkDeskId, values, this.props.history)
          message.success('创建作业成功')
          this.props.onSuccess(homework)
        } catch (error) {

        } finally {
          this.setState({ submitting: false })
          this.setState({ statusDescription: '确认' })
        }
      }
    })
  }

  handleClose = e => {
    e.preventDefault()
    this.props.onClose()
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
        title="新建作业"
        width={552}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="签到单ID">
            {getFieldDecorator('checkDeskId', {
              initialValue: this.state.homework.checkDeskId,
              rules: [
                { required: true, message: '请输入签到单ID' }
              ],
              getValueFromEvent: formatToInteger(0)
            })(<Input />)}
          </Form.Item>
          <Form.Item label="描述">
            {getFieldDecorator('description', {
              initialValue: this.state.homework.description,
              rules: [
                { required: true, message: '请填写课程描述' },
                { max: 255, message: '课程描述最长为255字' },
              ]
            })(<TextArea placeholder='课程描述'
              autosize={{ minRows: 2 }}
            />)}
          </Form.Item>
          <Form.Item label="范例图片">
            {getFieldDecorator('images', {
              initialValue: this.state.homework.images,
              rules: [ ]
            })(
              <ImageCard initialValue={this.state.homework.images}></ImageCard>
            )}
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

export default Form.create({ name: 'register' })(App)