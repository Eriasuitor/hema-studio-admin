import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Table, Icon, Col, Descriptions, Drawer } from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import * as moment from 'moment'
import * as request from '../../request'

const Description = ({ term, children, span = 12 }) => (
  <Col span={span}>
    <div className="description">
      <div className="term">{term}</div>
      <div className="detail">{children}</div>
    </div>
  </Col>
);

class Profile extends React.Component {
  state = {
    newEnrollment:{
      visible: true,
    },
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

  enrollmentStatus = {
    created: '待付款',
    paid: '待确认',
    confirmed: '已生效',
    expired: '已过期'
  }

  columns = [
    {
      title: '单号',
      dataIndex: 'id',
      sorter: true,
      width: '5%'
    },
    {
      title: '姓名',
      sorter: true,
      dataIndex: 'name',
      width: '7%',
    },
    {
      title: '性别',
      sorter: true,
      dataIndex: 'gender',
      width: '4%'
    },
    {
      title: '手机号',
      sorter: true,
      dataIndex: 'phone',
      width: '7%'
    },
    {
      title: '课程',
      // sorter: true,
      dataIndex: 'course.name',
      width: '10%'
    },
    {
      title: '原价',
      // sorter: true,
      dataIndex: 'pricePlan.price',
      width: '5%'
    },
    {
      title: '价格',
      // sorter: true,
      dataIndex: 'pricePlan.discountedPrice',
      width: '5%'
    },
    {
      title: '剩余课时',
      sorter: true,
      dataIndex: 'classBalance',
      width: '7%'
    },
    {
      title: '总课时',
      dataIndex: 'pricePlan.class',
      width: '5%'
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
      width: '10%',
    },
    {
      title: '状态',
      sorter: true,
      dataIndex: 'status',
      render: status => this.enrollmentStatus[status],
      width: '5%'
    },
    {
      title: '操作',
      render: enrollment => (<span><Icon type="stop" theme="twoTone" twoToneColor="red" title='标记为过期' /> {enrollment.status === 'paid' && <Icon theme="twoTone" type="check-circle" onClick={this.confirmEnrollment.bind(this, enrollment.id)} title='确认付款' />} </span>),
      width: '7%'
    }
  ];

  checkRecordColumns = [
    {
      title: '编号',
      dataIndex: 'id',
      sorter: true,
      width: '5%'
    },
    {
      title: '课程',
      // sorter: true,
      dataIndex: 'course.name',
      width: '10%'
    },
    {
      title: '课程次序',
      // sorter: true,
      dataIndex: 'checkDesk.order',
      width: '5%'
    },
    {
      title: '地点',
      // sorter: true,
      dataIndex: 'checkDesk.address',
      width: '10%'
    },
    {
      title: '时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
      width: '10%'
    },
  ];

  constructor(props) {
    super(props)
    console.log('member: ' + window.localStorage.token)
    store.dispatch(login(window.localStorage.token))
  }

  componentDidMount() {
    this.getProfile()
    this.queryEnrollments()
    this.queryCheckRecords()
  }

  async confirmEnrollment(enrollmentId) {
    console.log(enrollmentId)
  }

  async getProfile() {
    let userInfo = await request.getUserInfo(this.props.match.params.userId, this.props.history)
    this.setState({
      userInfo
    })
  }

  async queryCheckRecords(query) {
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
  }

  async queryEnrollments(query) {
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
  }

  showNewEnrollmentPanel(visible){
    this.setState({
      newEnrollment: {
        visible
      }
    })
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
    const { TabPane } = Tabs;
    return (
      <PageHeader
        onBack={() => this.props.history.goBack()}
        title="个人信息"
        subTitle={this.props.match.params.userId}
        extra={[
          <Button key="1" type='primary' onClick={this.showNewEnrollmentPanel.bind(this, true)}>新增报名单</Button>
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
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
          </Tabs>
        }
      >
        <Descriptions title="账户信息">
          <Descriptions.Item label="学号">{this.state.userInfo.id}</Descriptions.Item>
          <Descriptions.Item label="昵称">{this.state.userInfo.nickname || '未知'}</Descriptions.Item>
          <Descriptions.Item label="手机">{this.state.userInfo.phone || '未知'}</Descriptions.Item>
          <Descriptions.Item label="性别">{this.state.userInfo.gender ? this.state.userInfo.gender === 'male' ? '男' : '女' : '未知'}</Descriptions.Item>
          <Descriptions.Item label="区域">{this.state.userInfo.country ? `${this.state.userInfo.country}, ${this.state.userInfo.province}, ${this.state.userInfo.city}` : '未知'}</Descriptions.Item>
          <Descriptions.Item label="状态">{this.state.userInfo.status === 'normal' ? '正常' : '禁用'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{moment(this.state.userInfo.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
        <Drawer
          title="新建报名单"
          width={520}
          closable={false}
          onClose={this.showNewEnrollmentPanel.bind(this, false)}
          visible={this.state.newEnrollment.visible}
        >
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
              onClick={this.showNewEnrollmentPanel.bind(this, false)}
            >
              取消
            </Button>
            <Button onClick={this.showNewEnrollmentPanel.bind(this, false)} type="primary">
              确认
            </Button>
          </div>
        </Drawer>
      </PageHeader>
    );
  }
}

export default withRouter(Profile)