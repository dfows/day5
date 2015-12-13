import React from 'react';
import Request from 'superagent';
import helpers from '../flashcards';

var ConversationScreen = React.createClass({
  respond: function() {
    var yourResponse;
    var that = this;
    var phrase = this.refs.myResponse.value;
    that.props.setMCHidden();
    that.props.showError(null);
    var yourResponse = new Promise(function(resolve, reject) {
      Request.get('/getCardFromPhrase')
        .query({phrase: phrase})
        .end(function(err, res) {
          if (res.body.length > 0) {
            var card = res.body[0];
            resolve(card);
          } else {
            that.props.showError("Your response was not recognized.");
            // add option to add the response as a possible response
          }
        });
      }).then(function(card) {
        // check that the card was a valid response
        var prevCard = that.props.currentCard;
        // what are some of the nexts of the prevCard
        return new Promise(function(resolve, reject) {
          Request.get('/isCardNext')
            .query({prevId: prevCard.id, nextId: card.id, convoId: that.props.convoId})
            .end(function(err,res) {
              if (res.body.isIn) {
                resolve(card);
              } else {
                that.props.showError("Your response did not appear to be valid.");
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
          Request.get('/getMappings')
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
          Request.get('/getMappings')
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
          Request.get('/getCardFromId')
            .query({cardId: mapping.next_phrase_id})
            .end(function(err,res) {
              resolve(res.body[0])
            });
        });
      }).then(function(card) {
        that.props.setCurrent(card);
      });
  },
  showMultipleChoice: function() {
    // eventually this function will generate a list of possible answers
    // and allow you to choose one

    if (!this.props.showMC) {
      this.props.setMCVisible();
    } else {
      this.props.setMCHidden();
    }
  },
  render: function() {
    var prevResponse = this.props.prevCard ? (<p className="myPrevResponse">Du sa: {this.props.prevCard.phrase}</p>) : '';
    // REFACTOT THIS LATER
    var userWidget = this.props.signedIn ? (<UserWidget />) : '';
    var error = this.props.errorMsg ? (
      <div className="notFound">
        <p className="errorMsg">{this.props.errorMsg}</p>
        {userWidget}
      </div>
    ) : '';
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
        {error}
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

export default ConversationScreen;
