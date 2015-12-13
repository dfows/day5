import React from 'react';
import {History} from 'react-router';
import Request from 'superagent';
import helpers from '../flashcards';

import UserPanel from './UserPanel';
import UserWidget from './UserWidget';
import Conversation from './Conversation';

var App = React.createClass({
  mixins: [History],
  getInitialState: function() {
    return {
      signedIn: false
    }
  },
  componentDidMount: function() {
    /*
    // check for token
    var that = this;
    var token = localStorage.getItem('convoToken');
    // IDEA: make it like, if token is less than 5 days ago, relogin
    if (token) {
      // maybe i could make another call to the db and there would be a "last used token" in the table
      Request.get('/checkToken')
        .query({token: token})
        .end(function(err, result) {
          if (err) {
            // please log in again / redirect to login page
            console.log(err);
            localStorage.removeItem('convoToken');
            alert('please sign in again');
            that.history.pushState(null,'/');
          } else {
            that.setState({signedIn: true});
          }
        });
    }
    */
  },
  render: function() {
    var userPanel = this.state.signedIn ? (<UserPanel />) : '';
    return (
      <div>
        <Conversation signedIn={this.state.signedIn} />
        {userPanel}
      </div>
    );
  }
});

export default App;
