import { Menu, Icon, Switch, Table, Input, Descriptions } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import store from '../../reducer/index'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';
import { withRouter } from 'react-router'
import NewCheckRecord from '../newCheckRecord'
import NewHomework from '../newHomework'
import * as moment from 'moment'
import * as request from '../../request'
import * as tool from '../../util'
import { from } from 'rxjs';

const { TabPane } = Tabs;

class App extends React.Component {

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
  }

  state = {
    checkDeskPagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    homeworksPagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    showNewHomework: false,
    checkDesk: {
      course: {},
      user: {}
    },
    loadingCheckRecords: false,
    loadingHomeworks: false,
    queryCondition: {},
    checkRecords: [],
    homeworks: []
  };

  checkRecordColumns = [
    { title: 'ID', dataIndex: 'id', sorter: true },
    { title: '签到单ID', dataIndex: 'checkDeskId', sorter: true },
    { title: '报名单ID', dataIndex: 'enrollmentId', sorter: true, render: id => <a onClick={() => this.props.history.push(`/enrollments/${id}`)}>{id}</a> },
    { title: '用户ID', dataIndex: 'userId', sorter: true, render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a> },
    { title: '用户', dataIndex: 'user.nickname', render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a> },
  ]

  homeworkColumns = [
    { title: 'ID', dataIndex: 'id', sorter: true },
    { title: '描述', dataIndex: 'description' },
    { title: '课程', dataIndex: 'course', sorter: true, render: course => <a onClick={() => this.props.history.push(`/courses/${course.id}`)}>{course.name}</a> },
    { title: '状态', dataIndex: 'status', sorter: true },
  ];

  componentWillMount() {
    this.getCheckDesk()
    this.queryCheckRecords()
    this.queryHomeworks()
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
  }

  handleHomeworksTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.homeworksPagination };
    pager.current = pagination.current;
    let queryCondition = {
      pageSize: pager.pageSize,
      page: pager.current,
      ...filters,
    }
    sorter.field && (queryCondition.orderBy = sorter.field)
    sorter.order && (queryCondition.isDesc = sorter.order === 'descend' ? true : false)
    this.queryHomeworks(queryCondition);
  };

  async getCheckDesk() {
    try {
      const { rows: checkDesks } = await request.queryCheckDesks({ id: this.props.match.params.checkDeskId }, this.props.history)
      this.setState({ checkDesk: checkDesks[0] })
    } catch (error) {

    }
  }

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
  }

  queryHomeworks = async (queryCondition = {}) => {
    this.setState({ loadingHomeworks: true })
    try {
      queryCondition.checkDeskId = this.props.match.params.checkDeskId
      const { count, rows } = await request.queryHomeworks(queryCondition, this.props.history)
      const pagination = { ...this.state.homeworksPagination };
      pagination.total = count;
      this.setState({
        homeworks: rows,
        homeworksPagination: pagination
      })
    } catch (error) {

    } finally {
      this.setState({ loadingHomeworks: false })
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
        title={this.state.checkDesk.name}
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewHomework: true })}>布置作业</Button>,
          <Button key="2" onClick={() => this.setState({ showNewCheckRecord: true })}>添加签到记录</Button>
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
            <TabPane tab="作业" key="2">
              <Table
                columns={this.homeworkColumns}
                rowKey={_ => _.id}
                dataSource={this.state.homeworks}
                pagination={this.state.homeworksPagination}
                loading={this.state.loadingHomeworks}
                onChange={this.handleCheckRecordsTableChange}
                size="small"
                style={{ backgroundColor: 'white', padding: '24px' }}
              />
            </TabPane>
          </Tabs>
        }
      >
        <Descriptions title='签到单信息'>
          <Descriptions.Item label="ID">{this.state.checkDesk.id}</Descriptions.Item>
          <Descriptions.Item label="用户ID">{this.state.checkDesk.userId}</Descriptions.Item>
          <Descriptions.Item label="课程">{this.state.checkDesk.course.name}</Descriptions.Item>
          <Descriptions.Item label="序号">{this.state.checkDesk.order}</Descriptions.Item>
          <Descriptions.Item label="地点">{this.state.checkDesk.address}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{tool.formatDate(this.state.checkDesk.createdAt)}</Descriptions.Item>
        </Descriptions>
        <NewCheckRecord
          show={this.state.showNewCheckRecord}
          checkDesk={{ checkDeskId: this.props.match.params.checkDeskId }}
          onClose={() => this.setState({ showNewCheckRecord: false })}
          onSuccess={() => {
            this.setState({ showNewCheckRecord: false })
            this.queryCheckRecords()
          }}></NewCheckRecord>
        <NewHomework
          show={this.state.showNewHomework}
          onClose={() => this.setState({ showNewHomework: false })}
          onSuccess={() => {
            this.setState({ showNewHomework: false })
            this.queryHomeworks()
          }}
          homework={{ checkDeskId: this.props.match.params.checkDeskId }}
        ></NewHomework>
      </PageHeader>
    );
  }
}

export default withRouter(App)