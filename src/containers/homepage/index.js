import { Menu, Icon, Switch } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Homepage extends React.Component {
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
      </div>
    );
  }
}

export default Homepage