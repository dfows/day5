import React from 'react';
import Request from 'superagent';
import ConversationScreen from './ConversationScreen';

var Conversation = React.createClass({
  getInitialState: function() {
    return {
      errorMsg: null,
      currentCard: null,
      convoId: null,
      prevCard: null,
      choices: [],
      showMC: false,
      conversationEnded: false
    };
  },
  componentDidMount: function() {
    this.startNewConvo();
  },
  componentWillMount: function() {
    this.startNewConvo();
  },
  showError: function(errorMsg) {
    this.state.errorMsg = errorMsg;
    this.setState({errorMsg: this.state.errorMsg});
  },
  getRandom: function() {
    return new Promise(function(resolve, reject) {
      Request.get('/getRandom')
        .end(function(err, res) {
          var card = res.body[0];
          resolve(card);
        });
      });
  },
  getChoices: function() {
    var that = this;
    return new Promise(function(resolve, reject) {
      Request.get('/getNextCards')
        .query({currentCardId: that.state.currentCard.id, convoId: that.state.convoId})
        .end(function(err, res) {
          var choices = res.body;
          that.state.choices = choices;
          that.setState({choices: that.state.choices});
        });
    });
  },
  startNewConvo: function() {
    this.getRandom().then(function(card) {
      if (this.isMounted()) {
        this.setState({
          currentCard: card,
          convoId: card.id
        });
      }
    }.bind(this)),
    this.setState({
      errorMsg: null,
      prevCard: null,
      showMC: false,
      conversationEnded: false
    });
    // i want to also clear the input box
  },
  setCurrent: function(c) {
    this.setState({currentCard: c});
  },
  setPrev: function(p) {
    this.setState({prevCard: p});
  },
  setMCHidden: function() {
    this.setState({showMC: false});
  },
  setMCVisible: function() {
    if (!this.state.showMC) {this.getChoices();}
    this.setState({showMC: true});
  },
  setConversationEnd: function() {
    this.setState({conversationEnded: true});
  },
  render: function() {
    return (
      <div>
        <button onClick={this.startNewConvo}>Start New Conversation</button>
        <ConversationScreen
          prevCard={this.state.prevCard}
          currentCard={this.state.currentCard}
          convoId={this.state.convoId}
          setCurrent={this.setCurrent}
          setPrev={this.setPrev}
          setMCHidden={this.setMCHidden}
          setMCVisible={this.setMCVisible}
          showMC={this.state.showMC}
          choices={this.state.choices}
          setConversationEnd={this.setConversationEnd}
          conversationEnded={this.state.conversationEnded}
          showError={this.showError}
          signedIn={this.props.signedIn}
          errorMsg={this.state.errorMsg}
        />
      </div>
    );
  }
});

export default Conversation;
