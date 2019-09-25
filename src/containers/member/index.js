import { Menu, Icon, Switch, Table, Input } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col, Avatar } from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import NewUser from '../newUser'
import * as moment from 'moment'

class App extends React.Component {

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
    // onFilter: async (value, record) => {
    //   console.log('!!!!!!!!!!!!')
    //   await this.fetch({...this.state.queryCondition, nickname: value})
    //   console.log(record)
    //   console.log(value)
    //   console.log(dataIndex)
    //   return true
    //   // return !!record[dataIndex] && record[dataIndex]
    //   //   .toString()
    //   //   .toLowerCase()
    //   //   .includes(value.toLowerCase())
    // }
    // ,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text = '') => {
      text || (text = '')
      return <span className="ellipsis w1" title=""><Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      /></span>
    },
  });


  state = {
    data: [],
    pagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    queryCondition: {},
    loading: false,
    showNewUser: false,
    newUserKey: 1,
    newUserMode: 'create',
    user: {}
  };

  columns = [
    { title: '', dataIndex: 'avatar', render: value => <Avatar src={value} style={{ backgroundColor: '#87d068' }} icon="user" />, },
    { title: '学号', dataIndex: 'id', sorter: true, render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a>, },
    { title: '姓名', sorter: true, key: 'nickname', dataIndex: 'nickname', ...this.getColumnSearchProps('nickname', '昵称'), },
    { title: '性别', sorter: true, dataIndex: 'gender', render: gender => gender ? gender === 'male' ? '男' : '女' : '未知', },
    { title: '密码', dataIndex: 'password', render: password => <span className="ellipsis w1" title="">{password}</span> },
    { title: '手机号', sorter: true, dataIndex: 'phone', },
    { title: '地区', sorter: true, render: user => user.country ? `${user.country} ${user.province} ${user.city}` : "", },
    { title: '创建时间', sorter: true, dataIndex: 'createdAt', render: date => moment(date).format('YYYY-MM-DD HH:mm'), },
    {
      title: '操作', render: user =>
        <span>
          <a
            style={{ marginRight: '5px' }}
            onClick={this.editUser.bind(this, user)}>
            <Icon type="edit" />
          </a>
        </span>
    }
  ];

  componentDidMount() {
    this.fetch();
  }

  newUser() {
    this.setState({
      showNewUser: true,
      newUserKey: this.state.newUserKey + 1,
      newUserMode: 'create',
      user: {}
    })
  }

  editUser(user) {
    this.setState({
      showNewUser: true,
      newUserKey: this.state.newUserKey + 1,
      newUserMode: 'edit',
      user
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    console.log(filters)
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
    this.fetch(queryCondition, this.props.history);
  }

  fetch = async (query = { pageSize: 20, page: 1 }) => {
    // this.setState({ loading: true });
    try {
      let member = await getMembers(query, this.props.history)
      const pagination = { ...this.state.pagination };
      pagination.total = member.count;
      this.setState({
        loading: false,
        data: member.rows,
        pagination,
      });
    } catch (error) {

    }
  }

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: undefined });
  }


  render() {
    return (
      <PageHeader
        title="所有用户"
        extra={[
          <Button key="1" type='primary' onClick={this.newUser.bind(this)}>创建学员</Button>
          // <Button key="2" onClick={() => this.setState({ showNewCheckRecordPanel: true })}>新增签到</Button>
        ]}
      >
        <Row gutter={16} style={{ marginLeft: '24px', marginRight: '24px' }}>
          <Col span={12}>
            <Statistic title="共计" value="##" suffix="人" />
          </Col>
          <Col span={12}>
            <Statistic title="已报名" value="##" suffix="人" />
          </Col>
        </Row>
        <Table
          columns={this.columns}
          rowKey={record => record.id}
          dataSource={this.state.data}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          //           onRowClick={(userInfo) => this.props.history.push(`/member/${userInfo.id}`)}
          scroll={{ x: 888 }}
          size="small"
        />
        <NewUser
          show={this.state.showNewUser}
          onClose={() => this.setState({ showNewUser: false })}
          user={this.state.user}
          key={this.state.newUserKey}
          mode={this.state.newUserMode}
          onSubmitted={() => {
            this.setState({ showNewUser: false })
            this.fetch()
          }}
        />
      </PageHeader>
    );
  }
}

export default withRouter(App)