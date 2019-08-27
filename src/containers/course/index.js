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
import './index.css'

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
    courses: [],
    pagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    editingCourse: null,
    queryCondition: {},
    loadingCourses: false,
    showNewUser: true,
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
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      ...this.getColumnSearchProps('name', '课程'),
    },
    {
      title: '描述',
      key: 'description',
      dataIndex: 'description',
      width: '35%',
    },
    // {
    //   title: '支持试听',
    //   sorter: true,
    //   dataIndex: 'supportAudition',
    //   render: supportAudition => supportAudition? '是' : '否' ,
    //   width: '5%'
    // },
    {
      title: '状态',
      sorter: true,
      dataIndex: 'status',
      render: status => this.statusMapping[status],
      width: '10%'
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD HH:mm'),
      width: '15%',
    },
    {
      title: '操作',
      key: 'operation',
      width: '10%',
      render: course => <span><a style={{ marginRight: '5px' }} onClick={this.showEdit.bind(this, course)}><Icon type="edit" /></a><a onClick={this.deleteCourse.bind(this, course)}><Icon type="delete" /></a></span>,
    },
  ];

  statusMapping = {
    normal: '接受报名',
    disable: '不可报名'
  }

  newCourseKey = 0
  lastCourseId = 0

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

  showEdit = (course) => {
    if (this.lastCourseId !== course.id) {
      this.lastCourseId = course.id
      this.setState({ editingCourse: course, newCourseKey: this.newCourseKey++ })
    }
    this.setState({ showNewUser: true })
  }

  showNewCourse = () => {
    this.lastCourseId = 0
    this.setState({ showNewUser: true, editingCourse: null, newCourseKey: this.newCourseKey++ })
  }

  deleteCourse = (course) => {
    const {history} = this.props
    const queryCourses = this.queryCourses
    confirm({
      title: `确定要删除“${course.name}”吗？`,
      content: '课程不允许被完全删除，此操作仅会将课程状态更改为“不可报名”状态。',
      onOk() {
        return request.updateCourse(course.id, { status: 'disable' }, history).then(queryCourses)
      },
      onCancel() { },
    });
  }

  queryCourses = async () => {
    this.setState({ loadingCourses: true });
    let courses = await request.queryCourses(this.state.queryCondition, this.props.history)
    const pagination = { ...this.state.pagination };
    pagination.total = courses.count;
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
          <Button key="1" type='primary' onClick={this.showNewCourse.bind(this)}>新建课程</Button>
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
          style={{ backgroundColor: 'white', padding: '24px' }}
        />
        <NewCourse key={this.state.newCourseKey} {...this.props} course={this.state.editingCourse} show={this.state.showNewUser} onClose={() => this.setState({ showNewUser: false })} onSuccess={() => {
          this.setState({ showNewUser: false })
          this.queryCourses()
        }}></NewCourse>
      </PageHeader>
    );
  }
}

export default withRouter(App)