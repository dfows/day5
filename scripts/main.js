import React from 'react';
import ReactDOM from 'react-dom';

import Request from 'superagent';
import helpers from './flashcards';

var App = React.createClass({
  getInitialState: function() {
    return {
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
  getRandom: function() {
    return new Promise(function(resolve, reject) {
      Request.get('http://localhost:3000/getRandom')
        .end(function(err, res) {
          var card = res.body[0];
          resolve(card);
        });
      });
  },
  getChoices: function() {
    var that = this;
    return new Promise(function(resolve, reject) {
      Request.get('http://localhost:3000/getNextCards')
        .query({currentCardId: that.state.currentCard.id, convoId: that.state.convoId})
        .end(function(err, res) {
          console.log("getting choices from App",res.body);
          var choices = res.body;
          that.state.choices = choices;
          that.setState({choices: that.state.choices});
        });
    });
  },
  componentWillMount: function() {
    this.startNewConvo();
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
      prevCard: null,
      showMC: false,
      conversationEnded: false
    });
  },
  setCurrent: function(c) {
    this.setState({currentCard: c});
  },
  setPrev: function(p) {
    this.setState({prevCard: p});
  },
  toggleMC: function() {
    if (!this.state.showMC) {this.getChoices();}
    this.setState({showMC: !this.state.showMC});
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
          toggleMC={this.toggleMC}
          showMC={this.state.showMC}
          choices={this.state.choices}
          setConversationEnd={this.setConversationEnd}
          conversationEnded={this.state.conversationEnded}
        />
      </div>
    );
  }
});

/*
var ConversationCreator = React.createClass({
});
var FlashcardCreator = React.createClass({
});
*/

function getNexts(card, convoId, callback) {
  Request.get('http://localhost:3000/getMappings')
    .query({currentCardId: card.id, convoId: convoId})
    .end(function(err, res) {
      if (res.body.length > 1 || res.body[0].next_phrase_id !== 0) {
        callback(res.body);
      }
    });
}

var ConversationScreen = React.createClass({
  respond: function() {
    var yourResponse;
    var that = this;
    var phrase = this.refs.myResponse.value;
    var yourResponse = new Promise(function(resolve, reject) {
      Request.get('http://localhost:3000/getCardFromPhrase')
        .query({phrase: phrase})
        .end(function(err, res) {
          if (res.body.length > 0) {
            var card = res.body[0];
            resolve(card);
          } else {
            console.log(res);
            //that.props.sendError("Your response was not found.");
            // add option to add the response as a possible response
          }
        });
      }).then(function(card) {
        // check that the card was a valid response
        var prevCard = that.props.currentCard;
        // what are some of the nexts of the prevCard
        return new Promise(function(resolve, reject) {
          Request.get('http://localhost:3000/isCardNext')
            .query({prevId: prevCard.id, nextId: card.id, convoId: that.props.convoId})
            .end(function(err,res) {
              if (res.body.isIn) {
                resolve(card);
              } else {
                console.log(res);
                //that.props.sendError("Your response was not found.");
                // add option to add the response as a possible response
              }
              that.refs.myResponse.value = ''; //this is jank
            });
          });
      }).then(function(card) {
        var cardId = card.id;
        var convoId = that.props.convoId;
        return new Promise(function(resolve, reject) {
          // if there are nextcards, then it's not the end. if there arent nextcards, it's the end.
          // if there are nextcards, i want to know also if those are the end.
          Request.get('http://localhost:3000/getMappings')
            .query({currentCardId: card.id, convoId: that.props.convoId})
            .end(function(err, res) {
              if (res.body.length === 1 && res.body[0].next_phrase_id === 0) {
                that.props.setConversationEnd();
              }
              // if it could have more than just end, do this
              resolve(res.body);
              console.log("your card",card);
              that.props.setPrev(card);
            });
        });
      }).then(function(mappings) {
        // pick a random one out of the available nexts
        var mapping = helpers.aRandom(mappings);
        // check if *that* card is an end (if its next is just an end)
        return new Promise(function(resolve, reject) {
          Request.get('http://localhost:3000/getMappings')
            .query({currentCardId: mapping.next_phrase_id, convoId: that.props.convoId})
            .end(function(err,res) {
              if (res.body.length === 1 && res.body[0].next_phrase_id === 0) {
                that.props.setConversationEnd();
              }
              console.log("random computercard",mapping);
              resolve(mapping);
            });
        });
      }).then(function(mapping) {
        console.log(mapping,"mapping about to get card", mapping.next_phrase_id);
        return new Promise(function(resolve, reject) {
          Request.get('http://localhost:3000/getCardFromId')
            .query({cardId: mapping.next_phrase_id})
            .end(function(err,res) {
              resolve(res.body[0])
            });
        });
      }).then(function(card) {
        console.log("last cascade");
        that.props.setCurrent(card);
      });
  },
  showMultipleChoice: function() {
    // eventually this function will generate a list of possible answers
    // and allow you to choose one

    this.props.toggleMC();
  },
  render: function() {
    var prevResponse = this.props.prevCard ? (<p className="myPrevResponse">Du sa: {this.props.prevCard.phrase}</p>) : '';
    var respondable = this.props.conversationEnded ? '' :
      (
        <div className="response">
          <input type="text" ref="myResponse"/>
          <button onClick={this.respond}>Säga</button>
        </div>
      );
    var multipleChoiceDiv = this.props.showMC ? (<Choices choices={this.props.choices} />) : '';
    var btnText = this.props.showMC ? 'Jag förstår nu' : 'Jag förstår inte';
    var cardLoaded = this.props.currentCard ? (<Flashcard card={this.props.currentCard}/>) : (<p>Loading...</p>);
    return (
      <div className="conversation">
        {prevResponse}
        {cardLoaded}
        {respondable}
        {multipleChoiceDiv}
        <button onClick={this.showMultipleChoice}>{btnText}</button>
      </div>
    )
  }
});

var Flashcard = React.createClass({
  render: function() {
    var card = this.props.card;
    return (
      <p className="phrase">{card.phrase}</p>
    );
  }
});

var Choices = React.createClass({
  render: function() {
    var choices = this.props.choices.map(function(choice) {
      return (<li key={choice.id}>{choice.phrase}</li>);
    });
    return (
      <ul>
        {choices}
      </ul>
    );
  }
});

ReactDOM.render(<App />, document.querySelector('#main'));
