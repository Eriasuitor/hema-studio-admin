import { Card, Spin } from 'antd';
import React from 'react';
import { Redirect, withRouter } from 'react-router'
import { Statistic, Row, Col } from 'antd'
import * as request from '../../request'

class Member extends React.Component {
  state = {
    loading: true,
    counter: {},
    statistics: [
      { title: '学员', key: "userCount", suffix: '人', redirect: '/member' },
      { title: '课程', key: "courseCount", suffix: '门', redirect: '/courses' },
      { title: '报名', key: "enrollmentCount", suffix: '单', redirect: '/enrollments' },
      { title: '正在签到', key: "checkingDeskCount", suffix: '个', redirect: '/check-desks' },
    ]
  }

  async componentDidMount() {
    try {
      const counter = await request.getBusinessStatistics(this.props.history)
      this.setState({
        counter
      })
    } catch (error) {

    } finally {
      this.setState({
        loading: false
      })
    }
  }

  render() {
    const A = withRouter(({ history }) => (
      <Row gutter={16} >
        {this.state.statistics.map(card => (
          <Col span={6}>
            <Card onClick={() => history.push(card.redirect)}>
              <Statistic
                title={card.title}
                value={this.state.loading ? " " : this.state.counter[card.key]}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                suffix={this.state.loading ? "" : card.suffix}
              />
              {
                this.state.loading &&
                <Spin style={{ position: "relative" }} />
              }
            </Card>
          </Col>
        ))}
      </Row>
    ))
    return (
      <div>
        <A></A>
      </div>
    )
  }
}

export default Member