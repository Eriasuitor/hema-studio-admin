import { Menu, Icon, Switch } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect } from 'react-router'
import {unauthorized} from '../../reducer/actions'
import * as request from '../../request'

class Homepage extends React.Component {
  state = {
    counter: {
      userCount: undefined,
      courseCount: undefined,
      enrollmentCount: undefined,
      checkingDeskCount: undefined
    }
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
  }

  async componentDidMount() {
    const counter = await request.getBusinessStatistics(this.props.history)
    this.setState({
      counter
    })
  }

  render() {
    if(!store.getState().token) {
      store.dispatch(unauthorized('./index'))
      return (<Redirect to='/login' />)
    }
    return (
      <div>
        <Menu
          style={{ width: 256 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode={this.state.mode}
          theme={this.state.theme}
        >
          <Menu.Item key="1" onClick=''>
            <Icon type="mail" />
            学员管理
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="calendar" />
            课程管理
          </Menu.Item>
          <Menu.Item key="3">
            <Icon type="calendar" />
            报名管理
          </Menu.Item>
        </Menu>
        {this.props.children}
      </div>
    );
  }
}

export default Homepage