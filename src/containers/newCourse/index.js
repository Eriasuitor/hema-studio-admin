import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import * as lodash from 'lodash'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { formatToInteger } from '../../util'
import { Button, Drawer, Form, Input, Select, Switch, message } from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import * as moment from 'moment'
import * as request from '../../request'
import { EnrollmentStatus } from '../../common';
import { thisExpression } from '@babel/types';
import { InputList } from '../../components/form'
import { ImageCard } from '../../components/imageCard'

const { Option } = Select;
const { TextArea } = Input

class NewCourse extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    course: {
      name: '',
      description: '',
      presents: [],
      classSchedules: [],
      images: [],
      aims: [],
      for: [],
      pricePlans: [],
      supportAudition: true,
      status: 'normal'
    },
    statusDescription: '创建',
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
    showPricePlanPanel: false,
  };

  actionDescription = '创建'
  buttonDescription = '创建'

  componentWillMount() {
    this.handleClose = this.handleClose.bind(this)
    if (this.props.course) {
      this.actionDescription = '编辑'
      this.buttonDescription = '保存'
      this.setState({ course: this.props.course, statusDescription: '编辑' })
    }
    this.setState({ statusDescription: this.buttonDescription })
  }

  handleClose = e => {
    e.preventDefault()
    this.props.onClose()
  }

  componentDidMount() {
    this.state.course.pricePlans.forEach(_ => _.hitValue = parseFloat(_.hitValue) * 10)
    this.setState({ show: this.props.show, course: this.state.course })
  }

  getFieldDecorator = this.props.form.getFieldDecorator

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        try {
          this.setState({ submitting: true });
          ['aims', 'for', 'presents', 'pricePlans', 'classSchedules'].forEach(field => {
            const counter = `${field}Counter`
            values[field] = values[counter].map(index => values[field][index])
            delete values[counter]
          })
          values.classSchedules.forEach(schedule => {
            schedule.from = `${schedule.from}`
            schedule.to = `${schedule.to}`
          })
          this.setState({ statusDescription: '获取上传链接' })
          const originFileObjList = []
          const fileInfos = []
          if (values.images[0] instanceof Object) {
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
          }
          this.setState({ statusDescription: '保存课程' })
          values.pricePlans.forEach(pricePlan => pricePlan.hitValue = pricePlan.hitValue / 10)
          let course = null
          console.log(values)
          if (!this.props.course) {
            course = await request.addCourse(values, this.props.history)
            message.success('创建成功！', 3)
          } else {
            course = await request.updateCourse(this.props.course.id, values, this.props.history, { 404: () => "" })
            message.success('保存成功！', 3)
          }
          this.props.onSuccess(course)
        } catch (error) {

        } finally {
          this.setState({ submitting: false, statusDescription: this.buttonDescription });
        }
      }
    });
  };

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await this.getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

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
        title={`${this.actionDescription}课程`}
        width={552}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...formItemLayout} onSubmit={this.handleSubmit.bind(this)}
          style={{ marginBottom: '40px' }}
        >
          <Form.Item label="名称">
            {getFieldDecorator('name', {
              initialValue: this.state.course.name,
              rules: [
                { required: true, message: '请输入课程名称' },
                { max: 36, message: '课程名称最长为36字' },
              ],
            })(<Input placeholder='课程名称' />)}
          </Form.Item>
          <Form.Item label="描述">
            {getFieldDecorator('description', {
              initialValue: this.state.course.description,
              rules: [
                { required: true, message: '请填写课程描述' },
                { max: 255, message: '课程描述最长为255字' },
              ]
            })(<TextArea placeholder='课程描述'
              autosize={{ minRows: 2 }}
            />)}
          </Form.Item>
          <Form.Item label="介绍图片" extra="请添加一张图片作为封面图片。当存在多张图片时，图片会成倒序展示，即最后一张会展示在最前面（封面）。建议使用4:3高宽比的图片。">
            {getFieldDecorator('images', {
              initialValue: this.state.course.images,
              rules: [
                { required: true, message: '请添加一张封面图片' },
              ]
            })(
              <ImageCard initialValue={this.state.course.images}></ImageCard>
            )}
          </Form.Item>
          {/* <Form.Item label="封面图片">
            {getFieldDecorator('cover', {
              rules: [
                { required: true, message: '请选择封面图片' },
              ]
            })(
              <Select placeholder="请选择封面图片" style={{ width: '90%' }} notFoundContent="清先添加介绍图片">
                {
                  getFieldValue('images').map((image, index) => <Option key={`cover${index}`} value={index}>{`图${index + 1}: ${image.name}`}</Option>)
                }
              </Select>,
            )}
          </Form.Item> */}
          {
            this.props.course ? <div><Form.Item label="支持试听">
              {getFieldDecorator('supportAudition', {
                valuePropName: 'checked',
                initialValue: this.state.course.supportAudition,
              })(<Switch disabled />)}
            </Form.Item>
            </div> : <Form.Item label="支持试听">
                {getFieldDecorator('supportAudition', {
                  valuePropName: 'checked',
                  initialValue: this.state.course.supportAudition,
                })(<Switch />)}
              </Form.Item>
          }
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: this.state.course.status,
            })(
              <Select placeholder="课程状态" style={{ width: '90%' }}>
                <Option value="normal">接受报名</Option>
                <Option value="disable">不可报名</Option>
              </Select>,
            )}
          </Form.Item>

          <InputList note={`正式价格 = (原价 - 立减) × 折扣 / 10 `} min={1} initialValue={this.state.course.pricePlans} id="pricePlans" placeholder="方案" mode="numbers" label="价格方案" required={true} form={this.props.form} multipleInputs={[
            { id: 'price', precision: 2, min: 0, placeholder: '原价', prefix: '原价', suffix: '元', width: '44%', rules: [] },
            { id: 'class', precision: 0, min: 0, placeholder: '课时', rules: [], prefix: '包含', suffix: '课时', width: '44%' },
            { id: 'knockValue', precision: 2, min: 0, initialValue: 0, placeholder: '立减', rules: [], prefix: '立减', suffix: '元', width: '44%' },
            { id: 'hitValue', precision: 1, min: 0, max: 10, initialValue: 10, placeholder: '折扣', rules: [], prefix: '折扣', suffix: '折', width: '44%' },
          ]}>
          </InputList>
          <InputList min={1} initialValue={this.state.course.classSchedules} id="classSchedules" placeholder="上课时间" mode="numbers" label="上课时间" note="" required={true} form={this.props.form} multipleInputs={[
            {
              id: 'dayOfWeek', type: 'select', options: [
                { title: '周一', value: '1' },
                { title: '周二', value: '2' },
                { title: '周三', value: '3' },
                { title: '周四', value: '4' },
                { title: '周五', value: '5' },
                { title: '周六', value: '6' },
                { title: '周日', value: '0' },
              ], min: 0, placeholder: '每', prefix: '每', width: '90%', rules: []
            },
            { id: 'from', initialValue: '', type: 'date', placeholder: '自', rules: [], prefix: '自', width: '43%' },
            { id: 'to', initialValue: '', type: 'date', placeholder: '到', rules: [], prefix: '到', width: '43%' },
          ]}>
          </InputList>
          <InputList initialValue={this.state.course.aims} id="aims" label="课程目标" form={this.props.form} placeholder="课程目标" rules={[{ max: 1024, message: '课程目标最长为1024字' }]}></InputList>
          <InputList initialValue={this.state.course.for} id="for" label="适合对象" form={this.props.form} placeholder="目标用户" rules={[{ max: 1024, message: '目标用户最长为1024字' }]}></InputList>
          <InputList initialValue={this.state.course.presents} id="presents" label="赠品" form={this.props.form} multipleInputs={[{ placeholder: '赠品名称', rules: [{ max: 32, message: '课程目标最长为32字' }] }, { placeholder: '数量', rules: [] }]} initialValue={this.state.course.presents}></InputList>

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
              {this.state.statusDescription}
            </Button>
          </div>
          {/* </Form.Item> */}
        </Form>
      </Drawer>
    );
  }
}

export default Form.create({ name: 'register' })(NewCourse)