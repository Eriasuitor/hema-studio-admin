import { Menu, Icon, Switch, Table } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';
import { getMembers } from '../../request'
import { withRouter } from 'react-router'
import * as moment from 'moment'

class Member extends React.Component {
  state = {
    mode: 'inline',
    theme: 'light',
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
  state = {
    data: [],
    pagination: {
      pageSize: 15
    },
    loading: false,
  };

  columns = [
    {
      title: '学号',
      dataIndex: 'id',
      sorter: true,
      render: id => <a onClick={() => this.props.history.push(`/member/${id}`)}>{id}</a>,
      width: '7%'
    },
    {
      title: '姓名',
      sorter: true,
      dataIndex: 'nickname',
      width: '10%',
    },
    {
      title: '性别',
      sorter: true,
      dataIndex: 'gender',
      width: '7%'
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
      width: '15%'
    },
    {
      title: '地区',
      sorter: true,
      width: '10%',
      render: user => user.country? `${user.country} ${user.province} ${user.city}` : "",
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
      width: '13%',
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
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.fetch({
      pageSize: pagination.pageSize,
      page: pagination.current,
      orderBy: sorter.field,
      isDesc: sorter.order === 'descend' ? true : false,
    }, this.props.history);
  };

  fetch = async (query = {pageSize: 20, page: 1}) => {
    // this.setState({ loading: true });
    let member = await getMembers(query, this.props.history)
    
    const pagination = { ...this.state.pagination };
    pagination.total = member.count;
    //   console.log(data)
    this.setState({
      loading: false,
      data: member.rows,
      pagination,
    });
    // reqwest({
    //   url: 'https://randomuser.me/api',
    //   method: 'get',
    //   data: {
    //     results: 10,
    //     ...params,
    //   },
    //   type: 'json',
    // }).then(data => {
    // 
    // });
  };

  render() {
    return (
      <Table
        columns={this.columns}
        rowKey={record => record.id}
        dataSource={this.state.data}
        pagination={this.state.pagination}
        loading={this.state.loading}
        onChange={this.handleTableChange}
        size="small"
        style={{backgroundColor: 'white', padding: '24px'}}
      />
    );
  }
}


export default withRouter(App)