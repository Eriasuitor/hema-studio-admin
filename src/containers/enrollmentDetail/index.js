import { Icon, Table, Input, Descriptions } from 'antd';
import React from 'react';
import store from '../../reducer/index'
import Highlighter from 'react-highlight-words';
import { login } from '../../reducer/actions'
import { PageHeader, Tabs, Button } from 'antd';
import { withRouter } from 'react-router'
import NewCheckRecord from '../newCheckRecord'
import * as moment from 'moment'
import * as request from '../../request'
import * as tool from '../../util'

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
          style={{ width: 188, marginBottom: 8, display: 'block' }}
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
    enrollment: {
      user: {},
      course: {}
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
    loadingCheckRecords: false,
    queryCondition: {},
    loadingCourses: false,
    showNewCheckRecord: false
  };

  checkRecordColumns = [
    { title: 'ID', dataIndex: 'id', sorter: true, width: '5%' },
    { title: '签到单ID', dataIndex: 'checkDeskId', sorter: true, width: '5%' },
    { title: '课程ID', dataIndex: 'courseId', sorter: true, width: '5%', render: id => <a onClick={() => this.props.history.push(`/courses/${id}`)}>{id}</a> },
    { title: '用户ID', dataIndex: 'userId', sorter: true, width: '5%', render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a> },
  ];

  enrollmentStatusMap = {

  }

  componentWillMount() {
    this.getEnrollment();
    this.queryCheckRecords()
  }

  handleCheckRecordsTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    let queryCondition = {
      pageSize: pager.pageSize,
      page: pager.current,
      ...filters,
    }
    sorter.field && (queryCondition.orderBy = sorter.field)
    sorter.order && (queryCondition.isDesc = sorter.order === 'descend' ? true : false)
    this.queryCheckRecords(queryCondition);
  };

  async getEnrollment() {
    try {
      const enrollment = await request.getEnrollment(this.props.match.params.enrollmentId, null, this.props.history)
      this.setState({ enrollment })
    } catch (error) {

    }
  };

  queryCheckRecords = async (queryCondition) => {
    this.setState({ loadingCheckRecords: true })
    try {
      const { count, rows } = await request.queryCheckRecords(queryCondition, this.props.history)
      const pagination = { ...this.state.pagination };
      pagination.total = count;
      this.setState({
        checkRecords: rows,
        pagination
      })
    } catch (error) {

    } finally {
      this.setState({ loadingCheckRecords: false })
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

  render() {
    return (
      <PageHeader
        onBack={() => this.props.history.goBack()}
        title={this.state.enrollment.name}
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewCheckRecord: true })}>添加签到记录</Button>
        ]}
        footer={
          <Tabs defaultActiveKey="1">
            <TabPane tab="签到记录" key="1">
              <Table
                columns={this.checkRecordColumns}
                rowKey={_ => _.id}
                dataSource={this.state.checkRecords}
                pagination={this.state.checkRecords}
                loading={this.state.loadingCheckRecords}
                onChange={this.handleCheckRecordsTableChange}
                size="small"
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
          </Tabs>
        }
      >
        <Descriptions title='报名单信息'>
          <Descriptions.Item label="单号">{this.state.enrollment.id}</Descriptions.Item>
          <Descriptions.Item label="学号">{this.state.enrollment.userId}</Descriptions.Item>
          <Descriptions.Item label="昵称">{this.state.enrollment.user.nickname}</Descriptions.Item>
          <Descriptions.Item label="课程">{this.state.enrollment.course.name}</Descriptions.Item>
          <Descriptions.Item label="姓名">{this.state.enrollment.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{this.state.enrollment.phone}</Descriptions.Item>
          <Descriptions.Item label="性别">{tool.resolveGender(this.state.enrollment.gender)}</Descriptions.Item>
          <Descriptions.Item label="状态">{tool.resolveEnrollmentStatus(this.state.enrollment.status)}</Descriptions.Item>
          <Descriptions.Item label="剩余课时">{this.state.enrollment.classBalance}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{moment(this.state.enrollment.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
        <NewCheckRecord show={this.state.showNewCheckRecord} checkDesk={{ enrollmentId: this.props.match.params.enrollmentId }} onClose={() => this.setState({ showNewCheckRecord: false })} onSuccess={() => {
          this.setState({ showNewCheckRecord: false })
          this.queryCheckRecords()
        }} />
      </PageHeader>
    );
  }
}

export default withRouter(App)