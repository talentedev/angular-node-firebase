module.exports = function(database) {
  return {
    // Get all users
    getAllUsers: function(){
      return database.ref('/users').once('value');
    },
    // Get a user by uid.
    getUserById: function(uid) {
      return database.ref('/users/' + uid).once('value');
    },
    // Get a user by email
    getUserByEmail: function(email) {
      return database.ref('users').orderByChild("email").equalTo(email).once("value");
    },
    // Get a user by customerId
    getUserByCustomer: function(customerId) {
      return database.ref('users').orderByChild("customerId").equalTo(customerId).once("value");
    },
    // Create new user
    createUser: function(uid, data) {
      return database.ref('users/' + uid).set(data);
    },
    // Update user
    updateUser: function(uid, data) {
      //var updates = {};
      //updates['/users/' + uid] = data;
      return database.ref('/users/' + uid).update(data);
    },
    // Create user's new payment
    createPayment: function(uid, data) {
      return database.ref('payments/' + uid).push(data);
    },
    // Get user's payments.
    getPayments: function(uid) {
      return database.ref('payments/' + uid).orderByChild("active").equalTo(true).once('value');
    },
    // Get user's a payment by card id.
    getPaymentByCardId: function(uid, cardId) {
      return database.ref('payments/' + uid).orderByChild("id").equalTo(cardId).once("value");
    },
    // Update user's new payments.
    updatePayment: function(uid, subId, data) {
      return database.ref('payments/' + uid + '/' + subId).update(data);
    },
    // Create new transaction.
    createTransaction: function(uid, data) {
      return database.ref('transactions/' + uid).push(data);
    },
    // Get user's transactions.
    getTransactionsById: function(uid) {
      return database.ref('transactions/' + uid).orderByChild('created').once('value');
    },
    // Create a new donation.
    createDonation: function(uid, data) {
      return database.ref('donations/' + uid).push(data);
    },
    // Get a user's donations.
    getDonationsById: function(uid) {
      return database.ref('donations/' + uid).orderByChild("status").equalTo('active').once('value');
    },
    // Get a donation by subscription id.
    getDonationBySubscription: function(uid, subscriptionId) {
      return database.ref('donations/' + uid).orderByChild("subscriptionId").equalTo(subscriptionId).once("value");
    },
    // Get donations by card id.
    getDonatiosnByCard: function(uid, cardId) {
      return database.ref('donations/' + uid).orderByChild("cardId").equalTo(cardId).once("value");
    },
    // Update a donation.
    updateDonation: function(uid, subId, data) {
      return database.ref('donations/' + uid + '/' + subId).update(data);
    },
    // Create new log.
    createLog: function(uid, data) {
      return database.ref('logs/' + uid).push(data);
    },
    // Create new email log.
    createEmailLog: function(data) {
      return database.ref('emailLogs').push(data);
    },
  }
}
