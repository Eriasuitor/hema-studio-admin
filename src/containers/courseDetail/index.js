import { Menu, Icon, Switch, Table, Input, Descriptions } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import store from '../../reducer/index'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';
import { withRouter } from 'react-router'
import NewCheckDesk from '../newCheckDesk'
import NewEnrollment from '../newEnrollment'
import * as moment from 'moment'
import * as request from '../../request'
import { EnrollmentStatus } from '../../common'

const { TabPane } = Tabs;

class App extends React.Component {

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
  }

  getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`检索${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          搜索
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          清空
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text = '') => {
      text || (text = '')
      return <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    },
  });


  state = {
    course: {
      presents: [],
      aims: [],
      for: [],
      pricePlans: []
    },
    enrollmentPagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    enrollments: [],
    loadingEnrollment: false,
    checkDeskPagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    checkDesks: [],
    loadingCheckDesk: false,
    queryCondition: {},
    loadingCourses: false,
    showNewCheckDesk: false,
    showNewEnrollment: false
  };

  enrollmentColumns = [
    {
      title: '编号',
      dataIndex: 'id',
      sorter: true,
      render: id => <a onClick={() => this.props.history.push(`/courses/${id}`)}>{id}</a>,
    },
    {
      title: '学号',
      sorter: true,
      key: 'userId',
      dataIndex: 'userId',
      // ...this.getColumnSearchProps('name', '课程'),
    },
    {
      title: '剩余课时',
      key: 'classBalance',
      dataIndex: 'classBalance',
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
      render: gender => gender ? (gender === 'male' ? '男' : '女') : '未知',
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: status => EnrollmentStatus[status]
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: createdAt => moment(createdAt).format('YYYY-MM-DD HH-mm')
    },
    {
      title: '价格',
      dataIndex: 'pricePlan',
      render: pricePlan => `￥${pricePlan.discountedPrice} / ${pricePlan.class}课时`
    }
  ];

  checkRecordColumns = [
    {
      title: '编号',
      dataIndex: 'id',
      sorter: true,
      render: id => <a onClick={() => this.props.history.push(`/check-desks/${id}`)}>{id}</a>,
    },
    {
      title: '序号',
      sorter: true,
      key: 'order',
      dataIndex: 'order',
      // ...this.getColumnSearchProps('name', '课程'),
    },
    {
      title: '创建人',
      sorter: true,
      key: 'userId',
      dataIndex: 'userId',
      render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a>,
    },
    {
      title: '地点',
      key: 'address',
      dataIndex: 'address',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: createdAt => moment(createdAt).format('YYYY-MM-DD HH-mm')
    }
  ];

  enrollmentStatusMap = {

  }

  statusMapping = {
    normal: '接受报名',
    disable: '不可报名'
  }

  componentDidMount() {
    this.getCourse();
    this.queryEnrollments()
    this.queryCheckDesks()
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({ pagination: pager });
    let queryCondition = {
      pageSize: pager.pageSize,
      page: pager.current,
      ...filters,
    }
    sorter.field && (queryCondition.orderBy = sorter.field)
    sorter.order && (queryCondition.isDesc = sorter.order === 'descend' ? true : false)
    this.setState({ queryCondition })
    this.queryCourses(queryCondition, this.props.history);
  };

  getCourse = async () => {
    try {
      let course = await request.getCourse(this.props.match.params.courseId, this.props.history)
      this.setState({
        course
      })
    } catch (error) { }
  };

  queryEnrollments = async () => {
    try {
      let enrollmentsResult = await request.queryEnrollments({
        courseId: this.props.match.params.courseId,
      }, this.props.history)
      this.setState({
        enrollments: enrollmentsResult.rows
      })
    } catch (error) {

    }
  };

  queryCheckDesks = async () => {
    try {
      let checkDeskResult = await request.queryCheckDesks({
        courseId: this.props.match.params.courseId
      }, this.props.history)
      this.setState({
        checkDesks: checkDeskResult.rows
      })
    } catch (error) {

    }
  };

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: undefined });
  };

  statusMapping = {
    normal: '接受报名',
    disable: '不可报名'
  }

  render() {
    return (
      <PageHeader
        onBack={() => this.props.history.goBack()}
        title={this.state.course.name}
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewCheckDesk: true })}>新建签到单</Button>,
          <Button key="2" onClick={() => this.setState({ showNewEnrollment: true })}>新增报名</Button>
        ]}
        footer={
          <Tabs defaultActiveKey="1">
            <TabPane tab="所有报名" key="1">
              <Table
                columns={this.enrollmentColumns}
                rowKey={_ => _.id}
                dataSource={this.state.enrollments}
                pagination={this.state.enrollmentPagination}
                loading={this.state.enrollmentLoading}
                onChange={this.handleTableChange}
                size="small"
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
            <TabPane tab="签到单" key="2">
              <Table
                columns={this.checkRecordColumns}
                rowKey={_ => _.id}
                dataSource={this.state.checkDesks}
                pagination={this.state.checkDeskPagination}
                loading={this.state.loadingCheckDesk}
                onChange={this.handleCheckRecordTableChange}
                scroll={{ x: 888 }}
                size="small"
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
          </Tabs>
        }
      >
        <Descriptions title='账户信息'>
          <Descriptions.Item label="赠品">{this.state.course.presents.map((present, index) => `${index + 1}: ${present.name} * ${present.amount}`).join('</br>')}</Descriptions.Item>
          <Descriptions.Item label="目标">{this.state.course.aims.map((aim, index) => `${index + 1}: ${aim}`).join('\n')}</Descriptions.Item>
          <Descriptions.Item label="适合人群">{this.state.course.for.map((_for, index) => `${index + 1}: ${_for}`).join('\n')}</Descriptions.Item>
          <Descriptions.Item label="支持试听">{this.state.course.supportAudition || '未知'}</Descriptions.Item>
          <Descriptions.Item label="报名方案">{this.state.course.pricePlans.map((pricePlan, index) => `${index + 1}: ${pricePlan.price} / ${pricePlan.discountedPrice} / ${pricePlan.class} / ${pricePlan.knockValue} / ${pricePlan.hitValue}`).join('\n')}</Descriptions.Item>
          <Descriptions.Item label="状态">{this.statusMapping[this.state.course.status]}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{moment(this.state.course.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="描述">{this.state.course.description}</Descriptions.Item>
        </Descriptions>
        <NewCheckDesk
          show={this.state.showNewCheckDesk}
          checkDesk={{ courseId: parseInt(this.props.match.params.courseId)}}
          mode="create"
          onClose={() => this.setState({ showNewCheckDesk: false })}
          onSuccess={() => {
            this.setState({ showNewCheckDesk: false })
            this.queryCheckDesks()
          }}>
        </NewCheckDesk>
        <NewEnrollment
          show={this.state.showNewEnrollment}
          enrollment={{courseId: parseInt(this.props.match.params.courseId) }}
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

export default withRouter(App)