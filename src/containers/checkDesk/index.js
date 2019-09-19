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
import NewCheckDesk from '../newCheckDesk'
import * as tool from '../../util'
import { CheckDeskStatus } from '../../common'

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
    showNewCheckDesk: false,
    checkDesks: [],
    editingCheckDesk: {},
  };

  columns = [
    { title: 'ID', dataIndex: 'id', sorter: true, render: id => <a onClick={() => this.props.history.push(`/check-desks/${id}`)}>{id}</a> },
    { title: '学号', dataIndex: 'userId', sorter: true, render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a> },
    { title: '课程', dataIndex: 'courseId', sorter: true, render: id => <a onClick={() => this.props.history.push(`/courses/${id}`)}>{id}</a> },
    { title: '地址', dataIndex: 'address', render: text => <span className='ellipsis'>{text}</span> },
    { title: '序号', dataIndex: 'order' },
    { title: '状态', dataIndex: 'status', sorter: true, render: value => CheckDeskStatus[value] },
    { title: '创建时间', dataIndex: 'createdAt', sorter: true, render: tool.formatDate },
    {
      title: '操作', render: checkDesk =>
        <span>
          <a
            style={{ marginRight: '5px' }}
            onClick={this.editCheckDesk.bind(this, checkDesk)}>
            <Icon type="edit" />
          </a>
        </span>
    }
  ];
  newCheckDeskKey = 0
  editCheckDesk(checkDesk) {
    this.setState({
      newCheckDeskKey: this.newCheckDeskKey++,
      showNewCheckDesk: true,
      editingCheckDesk: checkDesk
    })
  }

  componentDidMount() {
    this.queryCheckDesks();
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

    if (queryCondition.name) {
      queryCondition.nameMatch = queryCondition.name
      delete queryCondition.name
    }
    this.queryCheckDesks(queryCondition);
  };

  queryCheckDesks = async (queryCondition) => {
    this.setState({ loading: true });
    try {
      let { rows: checkDesks, count } = await request.queryCheckDesks(queryCondition, this.props.history)
      const pagination = { ...this.state.pagination };
      pagination.total = count;
      this.setState({
        loading: false,
        checkDesks,
        pagination,
      });
    } catch (error) {

    } finally {
      this.setState({ loading: false });
    }
  }

  showNewCheckDesk() {

  }

  render() {
    return (
      <PageHeader
        title="所有报名表"
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewCheckDesk: true, newCheckDeskKey: this.newCheckDeskKey++, editingCheckDesk: null })}>新增签到单</Button>,
          // <Button key="2" onClick={() => this.setState({ showNewCheckRecordPanel: true })}>新增签到</Button>
        ]}
      >
        <Table
          columns={this.columns}
          rowKey={record => record.id}
          dataSource={this.state.checkDesks}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          //           onRowClick={(checkDesk) => this.props.history.push(`/check-desks/${checkDesk.id}`)}
          size="small"
          scroll={{ x: 888 }}
          style={{ marginTop: '24px' }}
        />
        <NewCourse key={this.state.newCourseKey} {...this.props} course={this.state.editingCourse} show={this.state.showNewUser} onClose={() => this.setState({ showNewUser: false })} onSuccess={() => {
          this.setState({ showNewUser: false })
          this.queryCourses()
        }}></NewCourse>
        <NewCheckDesk
          key={this.state.newCheckDeskKey}
          show={this.state.showNewCheckDesk}
          checkDesk={this.state.editingCheckDesk}
          mode={this.state.editingCheckDesk? 'edit': 'create'}
          onClose={() => this.setState({ showNewCheckDesk: false })}
          onSuccess={() => {
            this.setState({ showNewCheckDesk: false })
            this.queryCheckDesks()
          }}
        />
      </PageHeader>
    );
  }
}

export default withRouter(App)