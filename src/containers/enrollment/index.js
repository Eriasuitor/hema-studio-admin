import { Menu, Icon, Switch, Table, Input } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Modal, Row, Col } from 'antd';
import * as request from '../../request'
import { withRouter } from 'react-router'
import NewCourse from '../newCourse'
import * as moment from 'moment'
import NewEnrollment from '../newEnrollment'

const { confirm } = Modal

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
          onPressEnter={() => {
            confirm()
            this.setState({ searchText: selectedKeys[0] })
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => {
            confirm()
            this.setState({ searchText: selectedKeys[0] })
          }}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          搜索
        </Button>
        <Button onClick={() => {
          clearFilters();
          this.setState({ searchText: undefined });
        }} size="small" style={{ width: 90 }}>
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
      return <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text}
      />
    },
  });

  state = {
    courses: [],
    pagination: {
      pageSize: 10,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    editingCourse: null,
    queryCondition: {},
    loading: true,
    showNewEnrollment: false,
    enrollments: []
  };

  enrollmentStatusMap = {
    created: '待支付',
    paid: '待确认',
    confirmed: '已确认',
    expired: '已过期'
  }

  columns = [
    { title: 'ID', dataIndex: 'id', sorter: true, render: id => <a onClick={() => this.props.history.push(`/enrollments/${id}`)}>{id}</a> },
    { title: '学号', dataIndex: 'userId', sorter: true, render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a> },
    { title: '课程', dataIndex: 'courseId', sorter: true, render: id => <a onClick={() => this.props.history.push(`/courses/${id}`)}>{id}</a> },
    { title: '剩余课时', dataIndex: 'classBalance', sorter: true },
    { title: '姓名', dataIndex: 'name', ...this.getColumnSearchProps('name', '姓名') },
    { title: '手机号', dataIndex: 'phone' },
    { title: '状态', dataIndex: 'status', render: value => this.enrollmentStatusMap[value] },
    { title: '创建时间', dataIndex: 'createdAt', render: value => moment(value).format('YYYY-MM-DD HH-mm') },
    { title: '价格', dataIndex: 'pricePlan.discountedPrice' },
    { title: '课时总额', dataIndex: 'pricePlan.class' },
  ];

  statusMapping = {
    normal: '接受报名',
    disable: '不可报名'
  }

  newCourseKey = 0
  lastCourseId = 0

  componentDidMount() {
    this.queryEnrollments();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    let queryCondition = {
      pageSize: pager.pageSize,
      page: pager.current,
      ...filters,
    }
    sorter.field && (queryCondition.orderBy = sorter.field)
    sorter.order && (queryCondition.isDesc = sorter.order === 'descend' ? true : false)

    if(queryCondition.name) {
      queryCondition.nameMatch = queryCondition.name
      delete queryCondition.name
    }
    this.queryEnrollments(queryCondition);
  };

  queryEnrollments = async (queryCondition) => {
    this.setState({ loading: true });
    try {
      let { rows: enrollments, count } = await request.queryEnrollments(queryCondition, this.props.history)
      const pagination = { ...this.state.pagination };
      pagination.total = count;
      this.setState({
        loading: false,
        enrollments,
        pagination,
      });
    } catch (error) {

    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <PageHeader
        title="所有报名表"
        extra={[
            <Button key="1" type='primary' onClick={() => this.setState({ showNewEnrollment: true })}>新增报名单</Button>,
          // <Button key="2" onClick={() => this.setState({ showNewCheckRecordPanel: true })}>新增签到</Button>
        ]}
      >
        <Table
          columns={this.columns}
          rowKey={record => record.id}
          dataSource={this.state.enrollments}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          onRowClick={(enrollment) => this.props.history.push(`/enrollments/${enrollment.id}`)}
          size="small"
          scroll={{x: 888}}
          style={{marginTop: '24px'}}
        />
        <NewCourse key={this.state.newCourseKey} {...this.props} course={this.state.editingCourse} show={this.state.showNewUser} onClose={() => this.setState({ showNewUser: false })} onSuccess={() => {
          this.setState({ showNewUser: false })
          this.queryCourses()
        }}></NewCourse>
        <NewEnrollment
          show={this.state.showNewEnrollment}
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