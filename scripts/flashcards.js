// here i will write all the methods of shit
// still no idea what im doin
// is this an api
// i have no idea

var flashcards = {
  beginningCards: {
    b000001: {
      phrase: "Hej!",
      responses: [
        "c000001",
        "c000002",
      ]
    }
  },
  allCards: {
    c000001: {
      phrase: "Hej!",
      responses: [
        "c000003"
      ]
    },
    c000002: {
      phrase: "Hej, hur mår du?",
      responses: [
        "c000004",
        "c000005",
        "c000006"
      ]
    },
    c000003: {
      phrase: "Hur mår du?",
      responses: [
        "c000004",
        "c000005"
      ]
    },
    c000004: {
      phrase: "Bra, och du?",
      responses: [
        "c000006",
        "c000007"
      ]
    },
    c000005: {
      phrase: "Tja, inte så bra. Du då?",
      responses: [
        "c000006",
        "c000007"
      ]
    },
    c000006: {
      phrase: "Jag mår bra.",
      responses: [
        "e000000"
      ]
    },
    c000007: {
      phrase: "Jag är toppen!",
      responses: [
        "e000000"
      ]
    },
    e000000: {
      phrase: "SLUTET"
    }
  },
  getNextCards: function(currentCard) {
    var multipleChoice = [];
    var nexts = currentCard.responses;
    if (!!nexts) {
      for (var idx in nexts) {
        var nextCardId = nexts[idx];
        multipleChoice.push(this.allCards[nextCardId]);
      }
    }
    return multipleChoice;
  },
  getCardFromPhrase: function(phrase) {
    //strip phrase
    phrase = this.stripPunctuation(phrase);
    // why god
    // is there any way to do this in a better way
    var allCardsIds = Object.keys(this.allCards);
    for (var idx in allCardsIds) {
      var cardId = allCardsIds[idx]; //fuck you javascript why do i even have to do this
      var card = this.allCards[cardId];
      // STRIP PUNCTUATION aint nobody got time to try and imitate everything
      var cardPhrase = this.stripPunctuation(card.phrase);
      if (phrase === cardPhrase) {
        return card;
      }
    }
  },
  stripPunctuation: function(phrase) {
    return phrase.toLowerCase().replace(/[^A-Za-z\s]/g,'');
  },
  aRandom: function(arr) {
    var rIdx = Math.floor(Math.random()*arr.length);
    return arr[rIdx];
  },
  pickRandom: function() {
    var cardIds = Object.keys(this.beginningCards);
    var randomIndex = this.aRandom(cardIds);
    return this.beginningCards[randomIndex];
  }
}

export default flashcards;
