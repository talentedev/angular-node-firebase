module.exports = function (stripe) {
  return {
    // Get all transactions
    getAll: function (email) {
      return new Promise(function (resolve, reject) {
        stripe.issuing.transactions.list({
          limit: 3
        }, function (err, transactions) {
          if (err != null) {
            reject(err);
          }
          resolve(transactions);
        });
      });
    }
  }
}
