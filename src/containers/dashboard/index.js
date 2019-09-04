import { Menu, Icon, Card } from 'antd';
import React from 'react';
import { Redirect, withRouter } from 'react-router'
import { unauthorized } from '../../reducer/actions'
import { Statistic, Row, Col } from 'antd';

class Member extends React.Component {
  state = {
    mode: 'inline',
    theme: 'light',
  };

  statistics = [
    { title: '学员', value: 1012, suffix: '人', redirect: '/member' },
    { title: '课程', value: 10, suffix: '门' },
    { title: '待批改', value: 300, suffix: '份' },
    { title: '新报名', value: 456 },
  ]

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
    const A = withRouter(({history}) => (
      <Row gutter={16}>
        {this.statistics.map(card => (
          <Col span={6}>
            <Card onClick={() => history.push(card.redirect)}>
              <Statistic
                title={card.title}
                value={card.value}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                suffix={card.suffix}
              />
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