import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import NewCheckRecord from '../newCheckRecord'
import NewEnrollment from '../newEnrollment'
import { EnrollmentStatus } from '../../common'

import { PageHeader, Tabs, Button, Table, Icon, Descriptions, Form, Select, message, } from 'antd';
import { withRouter } from 'react-router'
import * as moment from 'moment'
import * as request from '../../request'

class Profile extends React.Component {
  state = {
    submitting: false,
    confirmDirty: false,
    autoCompleteResult: [],
    showNewEnrollment: false,
    showNewCheckRecord: false,
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

  columns = [
    {
      title: '单号',
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: '姓名',
      sorter: true,
      dataIndex: 'name',
    },
    {
      title: '性别',
      sorter: true,
      dataIndex: 'gender',
    },
    {
      title: '手机号',
      sorter: true,
      dataIndex: 'phone',
    },
    {
      title: '课程',
      dataIndex: 'course.name',
      render: name => <span className='ellipsis w2'>{name}</span>
    },
    {
      title: '原价',
      // sorter: true,
      dataIndex: 'pricePlan.price',
    },
    {
      title: '价格',
      // sorter: true,
      dataIndex: 'pricePlan.discountedPrice',
    },
    {
      title: '剩余课时',
      sorter: true,
      dataIndex: 'classBalance',
    },
    {
      title: '总课时',
      dataIndex: 'pricePlan.class',
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      sorter: true,
      dataIndex: 'status',
      render: status => EnrollmentStatus[status],
    },
    {
      title: '操作',
      render: enrollment => (<span><Icon type="stop" theme="twoTone" twoToneColor="red" title='标记为过期' /> {enrollment.status === 'paid' && <Icon theme="twoTone" type="check-circle" onClick={this.confirmEnrollment.bind(this, enrollment.id)} title='确认付款' />} </span>),
    }
  ];

  checkRecordColumns = [
    {
      title: '编号',
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: '课程',
      dataIndex: 'course.name',
      render: name => <span className='ellipsis w2'>{name}</span>
    },
    {
      title: '课程次序',
      dataIndex: 'checkDesk.order',
    },
    {
      title: '地点',
      // sorter: true,
      dataIndex: 'checkDesk.address',
    },
    {
      title: '时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

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
          let enrollment = { ...values }
          enrollment.pricePlanId = enrollment.courseAndPricePlanId[1]
          delete enrollment.courseAndPricePlanId
          await request.addEnrollment(enrollment)
          this.queryEnrollments()
          message('新建报名报成功')
        } catch (error) {

        } finally {
          this.setState({ submitting: false, showNewEnrollment: false })
        }
      }
    });
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  handleWebsiteChange = value => {
    let autoCompleteResult;
    if (!value) {
      autoCompleteResult = [];
    } else {
      autoCompleteResult = ['.com', '.org', '.net'].map(domain => `${value}${domain}`);
    }
    this.setState({ autoCompleteResult });
  };



  componentDidMount() {
    this.getProfile()
    this.queryEnrollments()
    this.queryCheckRecords()
  }

  async confirmEnrollment(enrollmentId) {
    console.log(enrollmentId)
  }

  async getProfile() {
    try {
      const userInfo = await request.getUserInfo(this.props.match.params.userId, this.props.history)
      this.setState({
        userInfo
      })
    } catch (error) {
    }

  }

  async queryCheckRecords(query) {
    try {
      this.setState({
        checkRecordLoading: true
      })
      let { count, rows: checkRecords } = await request.queryCheckRecords({ userId: this.props.match.params.userId, ...query }, this.props.history)
      const checkRecordPagination = { ...this.state.checkRecordPagination };
      checkRecordPagination.total = count;
      this.setState({
        checkRecords,
        checkRecordPagination,
        checkRecordLoading: false
      })
    } catch (error) {

    }
  }

  async queryEnrollments(query) {
    try {
      this.setState({
        loading: true
      })
      let { count, rows: enrollments } = await request.queryEnrollments({ userId: this.props.match.params.userId, ...query }, this.props.history)
      const pagination = { ...this.state.pagination };
      pagination.total = count;
      this.setState({
        enrollments,
        pagination,
        loading: false
      })
    } catch (error) {

    }
  }

  handleCheckRecordTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.checkRecordPagination };
    pager.current = pagination.current;
    this.setState({
      checkRecordPagination: pager,
    });
    this.queryCheckRecords({
      pageSize: pagination.pageSize,
      page: pagination.current,
      orderBy: sorter.field,
      isDesc: sorter.order === 'descend' ? true : false,
    })
  }

  async addCheckRecord(checkRecord) {
    try {
      delete checkRecord.courseId
      await request.addCheckRecord(checkRecord, this.props.history, { 428: () => '该用户已使用指定报名表在此签到表签到' })
      this.setState({ showNewCheckRecord: false })
      message('添加签到表成功')
      this.queryCheckRecords()
    } catch (error) {

    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.queryEnrollments({
      pageSize: pagination.pageSize,
      page: pagination.current,
      orderBy: sorter.field,
      isDesc: sorter.order === 'descend' ? true : false,
    }, this.props.history);
  };

  changeMode = value => {
    this.setState({
      mode: value ? 'vertical' : 'inline',
    });
  };

  changeTheme = value => {
    this.setState({
      theme: value ? 'dark' : 'light',
    });
  };

  render() {
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
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    const { TabPane } = Tabs;
    return (
      <PageHeader
        onBack={() => this.props.history.goBack()}
        title="个人信息"
        subTitle={this.props.match.params.userId}
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewEnrollment: true })}>新增报名单</Button>,
          <Button key="2" onClick={() => this.setState({ showNewCheckRecord: true })}>新增签到</Button>
        ]}
        footer={
          <Tabs defaultActiveKey="1">
            <TabPane tab="报名单" key="1">
              <Table
                columns={this.columns}
                rowKey={record => record.id}
                dataSource={this.state.enrollments}
                pagination={this.state.pagination}
                loading={this.state.loading}
                onChange={this.handleTableChange}
                size="small"
                scroll={{ x: 888 }}
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
            <TabPane tab="签到表" key="2">
              <Table
                columns={this.checkRecordColumns}
                rowKey={record => record.id}
                dataSource={this.state.checkRecords}
                pagination={this.state.checkRecordPagination}
                loading={this.state.checkRecordLoading}
                onChange={this.handleCheckRecordTableChange}
                size="small"
                scroll={{ x: 888 }}
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
          </Tabs>
        }
      >
        <Descriptions title='账户信息'>
          <Descriptions.Item label="学号">{this.state.userInfo.id}</Descriptions.Item>
          <Descriptions.Item label="昵称">{this.state.userInfo.nickname || '未知'}</Descriptions.Item>
          <Descriptions.Item label="手机">{this.state.userInfo.phone || '未知'}</Descriptions.Item>
          <Descriptions.Item label="性别">{this.state.userInfo.gender ? this.state.userInfo.gender === 'male' ? '男' : '女' : '未知'}</Descriptions.Item>
          <Descriptions.Item label="区域">{this.state.userInfo.country ? `${this.state.userInfo.country}, ${this.state.userInfo.province}, ${this.state.userInfo.city}` : '未知'}</Descriptions.Item>
          <Descriptions.Item label="状态">{this.state.userInfo.status === 'normal' ? '正常' : '禁用'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{moment(this.state.userInfo.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>

        <NewCheckRecord
          userInfo={this.state.userInfo}
          show={this.state.showNewCheckRecord}
          onClose={() => this.setState({ showNewCheckRecord: false })}
          onSuccess={() => {
            this.setState({ showNewCheckRecord: false })
            this.queryCheckRecords()
          }}
        >

        </NewCheckRecord>
        <NewEnrollment
          show={this.state.showNewEnrollment}
          enrollment={{
            userId: this.state.userInfo.id,
            phone: this.state.userInfo.phone,
            name: this.state.userInfo.nickname,
            gender: this.state.userInfo.gender,
          }}
          onClose={() => this.setState({ showNewEnrollment: false })}
          onSuccess={() => {
            this.setState({ showNewEnrollment: false })
            this.queryEnrollments()
          }}
       />
      </PageHeader>
    );
  }
}

export default withRouter(Form.create({ name: 'register' })(Profile))