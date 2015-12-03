import React from 'react';
import ReactDOM from 'react-dom';

import flashcards from './flashcards';

// ok here's where i start confusing the representation of the data and the structure of the data

var App = React.createClass({
  getInitialState: function() {
    return {
      currentCard: null,
      prevCard: null
    };
  },
  componentWillMount: function() {
    this.startNewConvo();
  },
  startNewConvo: function() {
    // ideallly this has a sort of timeout thing that's like "starting new convo..."
    this.setState({currentCard: flashcards.pickRandom(), prevCard: null});
  },
  setCurrent: function(c,p) {
    this.setState({currentCard: c, prevCard: p});
  },
  render: function() {
    return (
      <div>
        <button onClick={this.startNewConvo}>Start New Conversation</button>
        <ConversationScreen
          prevCard={this.state.prevCard}
          currentCard={this.state.currentCard}
          setCurrent={this.setCurrent}
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

var ConversationScreen = React.createClass({
  respond: function() {
    var phrase = this.refs.myResponse.value;
    var yourResponse = flashcards.getCardFromPhrase(phrase);
    if (yourResponse) {
      var nextCards = flashcards.getNextCards(yourResponse);
      var newCurrentCard = flashcards.aRandom(nextCards);
      this.props.setCurrent(newCurrentCard,yourResponse);
      this.refs.myResponse.value = ''; //this is jank
    } else {
      this.props.sendError("Your response was not found.");
      // add option to add the response as a possible response
    }
  },
  showMultipleChoice: function() {
    // eventually this function will generate a list of possible answers
    // and allow you to choose one
    // it should show a <Choices fromCard={this.currentCard} />
    // for now i'll just have it tell you that you suck
    this.refs.mc.value = "google it, son";
  },
  render: function() {
    var prevResponse = this.props.prevCard ? this.props.prevCard.phrase : '';
    return (
      <div className="conversation">
        <p className="myPrevResponse">Du sa: {prevResponse}</p>
        <Flashcard card={this.props.currentCard}/>
        <input type="text" ref="myResponse"/>
        <button onClick={this.respond}>Säga</button>
        <div className="multipleChoices" ref="mc"></div>
        <button onClick={this.showMultipleChoice}>Jag förstår inte</button>
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

ReactDOM.render(<App />, document.querySelector('#main'));
