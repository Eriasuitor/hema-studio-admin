import { Menu, Icon, Col, Row, Layout, Badge } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Homepage from './containers/homepage';
import Dashboard from './containers/dashboard';
import Member from './containers/member'
import Course from './containers/course'
import Enrollment from './containers/enrollment'
import CheckDesk from './containers/checkDesk'
import CheckDeskDetail from './containers/checkDeskDetail'
import EnrollmentDetail from './containers/enrollmentDetail'
import CourseDetail from './containers/courseDetail'
import Profile from './containers/profile'
import Login from './containers/login';
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import store from './reducer/index'
import { login } from './reducer/actions'
import './App.css'
import DashboardIcon from './Icons/Dashboard';
import BookIcon from './Icons/Book';
import EnrollmentIcon from './Icons/Enrollment';
import CheckInIcon from './Icons/CheckIn';
import UserIcon from './Icons/Users'
import config from './config/index'

const { Header, Footer, Sider, Content } = Layout;

class App extends React.Component {

  state = {
    mode: 'inline',
    theme: 'light',
  };

  constructor(props) {
    super(props)
    store.dispatch(login(window.localStorage.token))
    if (this.props.history.location.pathname === '/') {
      this.props.history.push('/index')
    }
  }

  routerPath = [
    { url: '/index', title: '总览', key: "1", icon: DashboardIcon },
    { url: '/member', title: '学员', key: "2", icon: UserIcon },
    { url: '/courses', title: '课程', key: "3", icon: BookIcon },
    { url: '/enrollments', title: '报名', key: "4", icon: EnrollmentIcon },
    { url: '/check-desks', title: '签到', key: "5", icon: CheckInIcon },
  ]

  calculatePathKey(url) {
    const matchPath = this.routerPath.find(rp => this.props.history.location.pathname.startsWith(rp.url))
    if (!matchPath) return []
    else return [matchPath.key]
  }

  render() {
    const SideBar = withRouter(({ history }) => (
      <Sider width={200} style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        backgroundColor: 'white'
      }}>
        <Menu
          defaultSelectedKeys={['1']}
          selectedKeys={this.calculatePathKey()}
          mode={this.state.mode}
          theme={this.state.theme}
        >
          {
            this.routerPath.map(routerPath =>
              <Menu.Item key={routerPath.key} onClick={() => history.push(routerPath.url)}>
                <Icon component={routerPath.icon} />
                {/* {routerPath.icon} */}
                {routerPath.title}
              </Menu.Item>
            )
          }
        </Menu>
      </Sider>
    ))
    return (
      <Layout style={{ height: '100%', width: '100%', position: 'absolute' }}>
        <Header style={{
          fontSize: '24px',
          backgroundColor: 'white',
          height: '58px',
          display: 'flex',
          position: "fixed",
          alignItems: 'center',
          width: '100%',
          zIndex: 100,
          paddingLeft: 0
        }}>
          {/* {} */}
          <img alt="" style={{ maxHeight: '50px', margin: '0 12px' }} src="https://hema-studio-holder.oss-cn-shenzhen.aliyuncs.com/sys/hema-logo2.png!saver"></img>
          荷玛画室后台管理 <Badge style={{ backgroundColor: '#52c41a' }} count={config.desc} />
        </Header>
        <Layout style={{ marginTop: '58px' }}>
          {this.props.history.location.pathname === '/login' ? "" : <SideBar />}
          <Layout style={{ marginLeft: 200, padding: '24px 24px 24px' }}>
            <Content style={{ overflow: 'scroll' }}>
              <Switch>
                <Route path="/index" component={Dashboard} exact />
                <Route path="/member/:userId" component={Profile} />
                <Route path="/login" component={Login} />
                <Route path="/member" component={Member} />
                <Route path="/courses/:courseId" component={CourseDetail} />
                <Route path="/courses" component={Course} />
                <Route path="/enrollments/:enrollmentId" component={EnrollmentDetail} />
                <Route path="/enrollments" component={Enrollment} />
                <Route path="/check-desks/:checkDeskId" component={CheckDeskDetail} />
                <Route path="/check-desks" component={CheckDesk} />
              </Switch>
            </Content>
          </Layout>
        </Layout>
        {/* <Footer style={{ */}
        {/* // position: 'fixed',
            // bottom: 0,
            width: '100%' */}
        {/* }}>FooterFooterFooterFooterFooterFooterFooterFooterFooterFooterFooterFooter</Footer> */}
      </Layout>
    )
  }
}

export default withRouter(App)