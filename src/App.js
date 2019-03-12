import React, { Component } from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom';

import AuthService from './services/tokenDecode';
import Header from './components/Header.component/Header';
import Login from './components/Login.component/Login';
import UserPanel from './components/UserPanel.component/UserPanel';

import './App.css';

class App extends Component {

  render() {
    const auth = new AuthService();
    const isLoggedIn = auth.isLoggedIn();  
    let commonComponent = isLoggedIn? UserPanel : Login
    
    return (
      <BrowserRouter>
      <div className = 'App'>
        <Header />
        <Switch>
          <Route exact path = '/' component= {commonComponent} />
          <Route exact path='/userPanel' component={UserPanel} />
        </Switch>
      </div>
        
      </BrowserRouter> 
    );
  }
}

export default App;
