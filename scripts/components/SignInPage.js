import React from 'react';
import {History} from 'react-router';
import Request from 'superagent';

function errorAlert(err) {
  alert(err);
}

var SignInPage = React.createClass({
  mixins: [History],
  signIn: function() {
    var that = this;
    Request.post('/signIn')
      .send({username: this.refs.username.value, password: this.refs.password.value})
      .end(function(err, res) {
        if (err) {
          // also render the errorMsg
          errorAlert(err);
        } else {
          // set localStorage token; navigate to /beginConvo
          var token = res.body.token;
          localStorage.setItem('convoToken', token);
          that.history.pushState(null, '/beginConversation');
        }
      });
  },
  continue: function() {
    if (confirm("you will not be able to contribute without signing in")) {
      localStorage.removeItem('convoToken');
      this.history.pushState(null,'/beginConversation');
    }
  },
  render: function() {
    return (
      <div>
        <input type="text" ref="username" placeholder="username"/>
        <input type="password" ref="password" placeholder="password"/>
        <button onClick={this.signIn}>Sign In</button>
        <button onClick={this.continue}>Continue without Signing In</button>
      </div>
    );
  }
});

export default SignInPage;
