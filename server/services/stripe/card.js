module.exports = function (stripe) {
  return {
    // Get all cards of a customer
    getCards: function (customerId) {
      return new Promise(function (resolve, reject) {
        stripe.customers.listCards(customerId, function (err, cards) {
          if (err) reject(err);
          resolve(cards);
        });
      });
    },
    // Update card
    update: function (customerId, cardId, data) {
      return new Promise(function (resolve, reject) {
        stripe.customers.updateCard(
          customerId,
          cardId,
          data,
          function (err, card) {
            if (err) reject(err);
            resolve(card);
          }
        );
      });
    },
    // Get a card by Id
    getById: function(customerId, cardId) {
      return new Promise(function (resolve, reject) {
        stripe.customers.retrieveSource(
          customerId,
          cardId,
          function (err, card) {
            if (err) reject(err);
            resolve(card);
          }
        );
      });
    }
  }
}
