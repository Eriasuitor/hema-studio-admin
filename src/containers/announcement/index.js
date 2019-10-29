import { Menu, Icon, Switch, Table, Input, message } from 'antd';
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
import NewAnnouncement from '../newAnnouncement'
import * as tool from '../../util'
import { CheckDeskStatus } from '../../common'

const { confirm } = Modal

class App extends React.Component {
  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
  }

  componentDidMount() {
    this.queryAnnouncements()
  }

  queryAnnouncements = async (queryCondition) => {
    queryCondition = queryCondition || {
      pageSize: this.state.pagination.pageSize
    }
    this.setState({ loading: true });
    try {
      let { rows: announcements, count } = await request.queryAnnouncements(queryCondition, this.props.history)
      const pagination = { ...this.state.pagination };
      pagination.total = count;
      this.setState({
        loading: false,
        announcements,
        pagination,
      });
    } catch (error) {

    } finally {
      this.setState({ loading: false });
    }
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
    this.queryAnnouncements(queryCondition);
  }

  async deleteAnnouncement(announcement) {
    console.log(announcement)
    const { history } = this.props
    const queryAnnouncements = this.queryAnnouncements
    confirm({
      title: `确定要删除“${announcement.summary}”吗？`,
      onOk() {
        return request.deleteAnnouncement(announcement.id, history).then(() => {
          message.success('保存成功！')
        }).then(queryAnnouncements).catch()
      },
      onCancel() { },
    })
  }

  state = {
    pagination: {
      pageSize: 15,
      showQuickJumper: true,
      showTotal: (total) => `共${total}条目`,
      total: 0
    },
    loading: false,
    announcements: [],
    newAnnouncementPanel: {
      show: true
    }
  }

  render() {
    return <PageHeader
      title="所有报名表"
      extra={[
        <Button key="1" type='primary' onClick={() => {
          this.setState({ newAnnouncementPanel: { show: true } })
        }}>添加通知</Button>,
      ]}
    >
      <Table
        columns={[
          { title: 'ID', sorter: true, dataIndex: 'id' },
          { title: '标题', dataIndex: 'title' },
          { title: '概括', dataIndex: 'summary' },
          { title: '详情', dataIndex: 'more' },
          { title: '开始时间', sorter: true, dataIndex: 'startedAt', render: tool.formatDate },
          { title: '结束时间', sorter: true, dataIndex: 'endedAt', render: tool.formatDate },
          {
            title: '操作', render: announcement =>
              <span><a onClick={this.deleteAnnouncement.bind(this, announcement)}><Icon type="delete" /></a></span>
          },
        ]}
        rowKey={record => record.id}
        dataSource={this.state.announcements}
        pagination={this.state.pagination}
        loading={this.state.loading}
        onChange={this.handleTableChange}
        size="small"
        scroll={{ x: 888 }}
        style={{ marginTop: '24px' }}
      />
      <NewAnnouncement show={this.state.newAnnouncementPanel.show}
        onClose={() => {
          this.setState({
            newAnnouncementPanel: { show: false }
          })
        }}
        onSubmitted={() => {
          this.setState({
            newAnnouncementPanel: { show: false }
          })
          this.queryAnnouncements()
        }}
      />
    </PageHeader>
  }
}

export default withRouter(App)