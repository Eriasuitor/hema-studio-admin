import { Menu, Icon, Switch, Table, Input, Descriptions } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import store from '../../reducer/index'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';
import { withRouter } from 'react-router'
import NewCheckRecord from '../newCheckRecord'
import * as moment from 'moment'
import * as request from '../../request'
import { EnrollmentStatus } from '../../common'
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
    checkDesk: {},
    loadingCheckRecords: false,
    queryCondition: {},
    checkRecords: []
  };

  checkRecordColumns = [
    { title: 'ID', dataIndex: 'id', sorter: true, width: '5%' },
    { title: '签到单ID', dataIndex: 'checkDeskId', sorter: true, width: '5%' },
    { title: '课程ID', dataIndex: 'courseId', sorter: true, width: '5%', render: id => <a onClick={() => this.props.history.push(`/courses/${id}`)}>{id}</a> },
    { title: '用户ID', dataIndex: 'userId', sorter: true, width: '5%', render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a> },
  ];

  componentWillMount() {
    this.getCheckDesk();
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

  async getCheckDesk() {
    try {
      const { rows: checkDesks } = await request.queryCheckDesks({id: this.props.match.params.checkDeskId}, this.props.history)
      this.setState({ checkDesk: checkDesks[0] })
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
        title={this.state.checkDesk.name}
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewCheckRecord: true })}>添加签到记录</Button>
          // <Button key="2" onClick={() => this.setState({ showNewCheckRecordPanel: true })}>新增签到</Button>
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
                style={{ backgroundColor: 'white', marginTop: '24px' }}
              />
            </TabPane>
          </Tabs>
        }
      >
        <Descriptions title='报名单信息'>
          <Descriptions.Item label="ID">{this.state.checkDesk.id}</Descriptions.Item>
          <Descriptions.Item label="用户ID">{this.state.checkDesk.user}</Descriptions.Item>
          <Descriptions.Item label="课程ID">{this.state.checkDesk.courseId}</Descriptions.Item>
          <Descriptions.Item label="姓名">{this.state.checkDesk.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{this.state.checkDesk.phone}</Descriptions.Item>
          <Descriptions.Item label="性别">{tool.resolveGender(this.state.checkDesk.gender)}</Descriptions.Item>
          <Descriptions.Item label="状态">{this.state.checkDesk.status}</Descriptions.Item>
          <Descriptions.Item label="剩余课时">{this.state.checkDesk.classBalance}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{moment(this.state.checkDesk.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
        <NewCheckRecord show={this.state.showNewCheckRecord} checkDesk={{ checkDeskId: this.props.match.params.checkDeskId }} onClose={() => this.setState({ showNewCheckRecord: false })} onSuccess={() => {
          this.setState({ showNewCheckRecord: false })
          this.queryCheckRecords()
        }}></NewCheckRecord>
      </PageHeader>
    );
  }
}

export default withRouter(App)