import { Menu, Icon, Switch, Table, Input } from 'antd';
import reqwest from 'reqwest';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import Highlighter from 'react-highlight-words';
import { unauthorized, login } from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';
import { queryCourses } from '../../request'
import { withRouter } from 'react-router'
import NewCourse from '../newCourse'
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
      return <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    },
  });


  state = {
    courses: [],
    pagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    queryCondition: { },
    loadingCourses: false,
    showNewUser: false
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: true,
      render: id => <a onClick={() => this.props.history.push(`/courses/${id}`)}>{id}</a>,
      width: '5%'
    },
    {
      title: '课程名称',
      sorter: true,
      key: 'name',
      dataIndex: 'name',
      width: '15%',
      ...this.getColumnSearchProps('name', '课程'),
    },
    {
      title: '描述',
      key: 'description',
      dataIndex: 'description',
      width: '30%'
    },
    {
      title: '支持试听',
      sorter: true,
      dataIndex: 'supportAudition',
      render: supportAudition => supportAudition? '是' : '否' ,
      width: '5%'
    },
    {
      title: '状态',
      sorter: true,
      dataIndex: 'status',
      render: status => this.statusMapping[status],
      width: '5%'
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
      width: '12%',
    }
  ];

  statusMapping = {
    normal: '接受报名',
    disable: '不可报名'
  }

  componentDidMount() {
    this.queryCourses();
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

  queryCourses = async () => {
    this.setState({ loadingCourses: true });
    let courses = await queryCourses(this.state.queryCondition, this.props.history)
    const pagination = { ...this.state.pagination };
    pagination.total = courses.count;
    console.log(courses.rows)
    this.setState({
      loadingCourses: false,
      courses: courses.rows,
      pagination,
    });
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
        title="所有课程"
        extra={[
          <Button key="1" type='primary' onClick={() => this.setState({ showNewUser: true })}>新建课程</Button>
          // <Button key="2" onClick={() => this.setState({ showNewCheckRecordPanel: true })}>新增签到</Button>
        ]}
      >
        <Table
          columns={this.columns}
          rowKey={record => record.id}
          dataSource={this.state.courses}
          pagination={this.state.pagination}
          loading={this.state.loadingCourses}
          onChange={this.handleTableChange}
          size="small"
          style={{ backgroundColor: 'white', padding: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        />
        <NewCourse show={this.state.showNewUser} onClose={() => this.setState({ showNewUser: false })} onSubmitted={() => {
          this.setState({ showNewUser: false })
          this.fetch()
        }}></NewCourse>
      </PageHeader>
    );
  }
}

export default withRouter(App)