import { Menu, Icon, Switch } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Homepage from './containers/homepage';
import Login from './containers/login';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Route path="/index" component={Homepage} />
        <Route path="/" component={Login} />
      </Router>
    );
  }
}

export default App