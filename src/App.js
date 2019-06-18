import { Menu, Icon, Col, Row, Layout } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Homepage from './containers/homepage';
import Dashboard from './containers/dashboard';
import Member from './containers/member'
import Profile from './containers/profile'
import Login from './containers/login';
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import store from './reducer/index'
import {login} from './reducer/actions'
const { Header, Footer, Sider, Content } = Layout;

class App extends React.Component {



  state = {
    mode: 'inline',
    theme: 'light',
  };

  constructor(props){
    super(props)
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
    const SideBar = withRouter(({ history }) => (
      <Sider width={200} style={{ background: '#fff' }}>
        <Menu
          defaultSelectedKeys={['1']}
          mode={this.state.mode}
          theme={this.state.theme}
        >
          <Menu.Item key="1" onClick={() => history.push("/index")}>
            <Icon type="mail" />
            总览  
        </Menu.Item>
          <Menu.Item key="2" onClick={() => history.push("/member")}>
            <Icon type="mail" />
            学员管理
        </Menu.Item>
          <Menu.Item key="3">
            <Icon type="calendar" />
            课程管理
     </Menu.Item>
          <Menu.Item key="4">
            <Icon type="calendar" />
            报名管理
     </Menu.Item>
        </Menu>
      </Sider>
    ))

    return (
      <Router>

        <Layout>
          <Header style={{ backgroundColor: 'white', height: '48px', fontSize: '24px', display: 'flex', alignItems: 'center' }}>
            Studio
      </Header>
          <Layout>
            <SideBar />
            <Layout style={{ padding: '24px 24px 24px' }}>
              <Content>
                <Switch>
                  <Route path="/index" component={Dashboard} />
                  <Route path="/member/:userId" component={Profile} />
                  <Route path="/login" component={Login} />
                  <Route path="/member" component={Member} />
                </Switch>
              </Content>
            </Layout>
          </Layout>
          <Footer>Footer</Footer>
        </Layout>
      </Router>
    );
  }
}

export default App