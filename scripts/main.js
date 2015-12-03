import React from 'react';
import ReactDOM from 'react-dom';

import flashcards from './flashcards';

// ok here's where i start confusing the representation of the data and the structure of the data

var App = React.createClass({
  getInitialState: function() {
    return {
      currentCard: null,
      prevCard: null,
      showMC: false,
      conversationEnded: false
    };
  },
  componentWillMount: function() {
    this.startNewConvo();
  },
  startNewConvo: function() {
    // ideallly this has a sort of timeout thing that's like "starting new convo..."
    this.setState({
      currentCard: flashcards.pickRandom(),
      prevCard: null,
      showMC: false,
      conversationEnded: false
    });
  },
  setCurrent: function(c,p) {
    this.setState({currentCard: c, prevCard: p});
  },
  toggleMC: function() {
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
          setCurrent={this.setCurrent}
          toggleMC={this.toggleMC}
          showMC={this.state.showMC}
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

var ConversationScreen = React.createClass({
  respond: function() {
    var phrase = this.refs.myResponse.value;
    var yourResponse = flashcards.getCardFromPhrase(phrase);
    if (yourResponse) {
      var yourEnd = (yourResponse.responses.length === 1 && yourResponse.responses[0] === "e000000"); // if it's the end, don't show response box
      if (yourEnd) {
        this.props.setConversationEnd();
      }
      var nextCards = flashcards.getNextCards(yourResponse);
      var newCurrentCard = flashcards.aRandom(nextCards);
      // check that this card is not the end
      if (!yourEnd) {
        var nextEnd = (newCurrentCard.responses.length === 1 && newCurrentCard.responses[0] === "e000000");
        if (nextEnd) {
          this.props.setConversationEnd();
        }
      }
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

    // change the state to "show multiple choice"
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
    var multipleChoiceDiv = this.props.showMC ? (<div className="multipleChoices" ref="mc">mc</div>) : '';
    return (
      <div className="conversation">
        {prevResponse}
        <Flashcard card={this.props.currentCard}/>
        {respondable}
        {multipleChoiceDiv}
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
