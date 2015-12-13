import React from 'react';
import ReactDOM from 'react-dom';

import {History, Router, Route} from 'react-router';
import {createHistory} from 'history';

import SignInPage from './components/SignInPage';
import App from './components/App';

var routes = (
  <Router history={createHistory()}>
    <Route path="/" component={SignInPage}/>
    <Route path="/beginConversation" component={App}/>
  </Router>
);

ReactDOM.render(routes, document.querySelector('#main'));
