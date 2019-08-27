import { Menu, Icon, Switch, Table, Input } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import NewUser from '../newUser'
import * as moment from 'moment'

class Member extends React.Component {
  state = {
    mode: 'inline',
    theme: 'light',
    searchText: ''
  };

  constructor(props) {
    super(props)
    console.log('member: ' + window.localStorage.token)
    store.dispatch(login(window.localStorage.token))
  }

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
    // if(!store.getState().token) {
    //   store.dispatch(unauthorized('./member'))
    //   return (<Redirect to='/login' />)
    // }
    const { TabPane } = Tabs;
    return (
      <PageHeader
        onBack={() => window.history.back()}
        title="Title"
        subTitle="This is a subtitle"
        tags={<Tag color="red">Warning</Tag>}
        extra={[
          <Button key="3">Operation</Button>,
          <Button key="2">Operation</Button>,
          <Button key="1" type="primary">
            Primary
      </Button>,
        ]}
        footer={
          <Tabs defaultActiveKey="1">
            <TabPane tab="Details" key="1" />
            <TabPane tab="Rule" key="2" />
          </Tabs>
        }
      >
        <div className="wrap">
          <div className="content padding">asdasd</div>
          <div className="extraContent">asdasda</div>
        </div>
      </PageHeader>
    );
  }
}



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
      return <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
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
    showNewUser: false
  };

  columns = [
    {
      title: '学号',
      dataIndex: 'id',
      sorter: true,
      render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a>,
      width: '5%'
    },
    {
      title: '姓名',
      sorter: true,
      key: 'nickname',
      dataIndex: 'nickname',
      width: '15%',
      ...this.getColumnSearchProps('nickname', '昵称'),
    },
    {
      title: '性别',
      sorter: true,
      dataIndex: 'gender',
      render: gender => gender ? gender === 'male' ? '男' : '女' : '未知',
      width: '5%'
    },
    {
      title: '密码',
      dataIndex: 'password',
      width: '10%'
    },
    {
      title: '手机号',
      sorter: true,
      dataIndex: 'phone',
      width: '7%'
    },
    {
      title: '地区',
      sorter: true,
      width: '10%',
      render: user => user.country ? `${user.country} ${user.province} ${user.city}` : "",
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
      width: '12%',
    },
    {
      title: 'unionId',
      sorter: true,
      dataIndex: 'unionId',
      width: '15%'
    },
  ];

  componentDidMount() {
    this.fetch();
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
  };

  fetch = async (query = { pageSize: 20, page: 1 }) => {
    // this.setState({ loading: true });
    try {
      let member = await getMembers(query, this.props.history)

      const pagination = { ...this.state.pagination };
      pagination.total = member.count;
      //   console.log(data)
      this.setState({
        loading: false,
        data: member.rows,
        pagination,
      });
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


  render() {
    return (
      <PageHeader
        title="所有用户"
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewUser: true })}>创建学员</Button>
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
          size="small"
          style={{ backgroundColor: 'white', padding: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        />
        <NewUser show={this.state.showNewUser} onClose={() => this.setState({ showNewUser: false })} onSubmitted={() => {
          this.setState({ showNewUser: false })
          this.fetch()
        }}></NewUser>
      </PageHeader>
    );
  }
}

export default withRouter(App)