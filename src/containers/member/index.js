import { Menu, Icon, Switch } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import {unauthorized} from '../../reducer/actions'
import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

class Member extends React.Component {
  state = {
    mode: 'inline',
    theme: 'light',
  };

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

export default Member