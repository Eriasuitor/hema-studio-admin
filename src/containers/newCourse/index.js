import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import * as lodash from 'lodash'
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
  List,
  Upload, Modal,
  Typography,
  Switch
} from 'antd';
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
const { Paragraph } = Typography;

class NewCourse extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    newEnrollment: {
      visible: true,
    },
    courses: [],
    course: {
      name: 'this is the name',
      description: 'this is the desc',
      presents: [{
        name: 'iPhone X',
        amount: 0
      }],
      aims: ['add one', 'to be a better man'],
      for: ['you'],
      supportAudition: false
    },
    statusDescription: '确认',
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
    showPricePlanPanel: false
  };

  constructor(props) {
    super(props)
    console.log('member: ' + window.localStorage.token)
    store.dispatch(login(window.localStorage.token))
    this.handleClose = this.handleClose.bind(this)
  }

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

  getFieldDecorator = this.props.form.getFieldDecorator

  createCourse(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({ submitting: true });
        ['aims', 'for', 'presents', 'pricePlans'].forEach(field => {
          const counter = `${field}Counter`
          values[field] = values[counter].map(index => values[field][index])
          delete values[counter]
        })
        values.status = 'normal'
        values.supportAudition = true
        this.setState({ statusDescription: '获取上传链接' })
        const originFileObjList = []
        const fileInfos = []
        // const coverImage = values.images[values.cover]
        // lodash.pullAt(values.images, values.cover)
        // delete values.cover
        // values.images.unshift(coverImage)
        values.images.forEach(image => {
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
        for(let i = 0; i < urls.length; i++) {
          await request.postImage(urls[i].match(''), originFileObjList[i], this.props.history)
        }
        values.images = urls.map(url => url.match(/(^.*?)\?/)[1])
        this.setState({ statusDescription: '创建课程' })
        let course = await request.addCourse(values, this.props.history)
        this.setState({ submitting: false, statusDescription: '确认' });
        // this.setState({submitting: false})
        // if(success !== false) {
        //   alert('新增用户成功')
        //   this.setState({show: false})
        //   this.props.onSubmitted()
        // }
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
        title="新建课程"
        width={540}
        closable={false}
        onClose={this.props.onClose}
        visible={this.props.show}
      >
        <Form {...formItemLayout} onSubmit={this.createCourse.bind(this)}
          style={{ marginBottom: '40px' }}
        >
          <Form.Item label="名称" hasFeedback>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入课程名称' },
                { max: 36, message: '课程名称最长为36字' },
              ],
            })(<Input placeholder='课程名称' />)}
          </Form.Item>
          <Form.Item label="描述">
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: '请填写课程描述' },
                { max: 255, message: '课程描述最长为255字' },
              ]
            })(<TextArea placeholder='课程描述'
              autosize={{ minRows: 2 }}
            />)}
          </Form.Item>
          <Form.Item label="介绍图片" extra="请至少添加一张图片作为封面图片。当存在多张图片时，图片会成倒序展示，即最后一张会展示在最前面（封面）。建议使用4:3高宽比的图片。">
            {getFieldDecorator('images', {
              initialValue: [],
              rules: [
                { required: true, message: '请至少添加一张封面图片' },
              ]
            })(
              <ImageCard onChange={(fileList) => { console.log(fileList.length !== 0 && fileList[0].status) }}></ImageCard>
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
          {/* <Form.Item label="支持试听">
            {getFieldDecorator('supportAudition', {
              valuePropName: 'checked',
              initialValue: true
            })(<Switch />)}
          </Form.Item> */}
          {/* <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: "normal",
            })(
              <Select placeholder="课程状态" style={{ width: '90%' }}>
                <Option value="normal">接受报名</Option>
                <Option value="disable">不可报名</Option>
              </Select>,
            )}
          </Form.Item> */}
          <InputList id="aims" label="课程目标" form={this.props.form} placeholder="课程目标" initialValue={this.state.course.aims} rules={[{ max: 1024, message: '课程目标最长为1024字' }]}></InputList>
          <InputList id="for" label="适合对象" form={this.props.form} placeholder="目标用户" initialValue={this.state.course.for} rules={[{ max: 1024, message: '目标用户最长为1024字' }]}></InputList>
          <InputList id="presents" label="赠品" form={this.props.form} multipleInputs={[{ placeholder: '赠品名称', rules: [{ max: 32, message: '课程目标最长为32字' }] }, { placeholder: '数量', rules: [] }]} initialValue={this.state.course.presents}></InputList>
          <InputList id="pricePlans" placeholder="方案" mode="numbers" label="价格方案" required={true} form={this.props.form} multipleInputs={[
            { id: 'price', precision: 2, min: 0, placeholder: '原价', prefix: '原价', suffix: '元', width: '44%', rules: [] },
            { id: 'class', precision: 0, min: 0, placeholder: '课时', rules: [], prefix: '包含', suffix: '课时', width: '44%' },
            { id: 'knockValue', precision: 2, min: 0, initialValue: 0, placeholder: '立减', rules: [], prefix: '立减', suffix: '元', width: '44%' },
            { id: 'hitValue', precision: 1, min: 0, max: 10, initialValue: 0, placeholder: '折扣', rules: [], prefix: '折扣', suffix: '折', width: '44%' },
          ]} initialValue={this.state.course.presents}></InputList>
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