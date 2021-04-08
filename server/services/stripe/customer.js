module.exports = function (stripe, fbDB) {
  return {
    // Create new customer
    findOrcreateCustomer: function (email) {
      return new Promise(function (resolve, reject) {
        stripe.customers.list({email: email, limit: 1}, async (err, customers) => {
          if(err == null) {
            const users = await fbDB.getUserByEmail(email);
            if(!users.exists())
              return reject({Error: 'No user email'});

            users.forEach(async(user) => {
              if (customers.data.length === 0) {
                // create customer
                stripe.customers.create({
                  email: email,
                }, async (err, customer) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  await fbDB.updateUser(user.key, {customerId: customer.id})
                  resolve(customer);
                });
              } else {
                // get the first customer
                await fbDB.updateUser(user.key, {customerId: customers.data[0].id})
                resolve(customers.data[0]);
              }             
            });
          }
        });
      });
    },
    // Get a customer
    getCustomer: function (id) {
      return new Promise(function (resolve, reject) {
        stripe.customers.retrieve(id, function (err, customer) {
          if (err) reject(err);
          resolve(customer);
        });
      });
    },
    // Delete a customer
    deleteCustomer: function (id) {
      return new Promise(function (resolve, reject) {
        stripe.customers.del(id, function (err, confirmation) {
          if (err) reject(err);
          resolve(confirmation);
        });
      });
    },
    // Get customers by email
    getCustomersByEmail: function (email) {
      return new Promise(function (resolve, reject) {
        stripe.customers.list(
          { email: email },
          function (err, customers) {
            if (err) reject(err);
            resolve(customers);
          }
        );
      });
    },
    getCards: function(customerId) {
      return new Promise(function (resolve, reject) {
        stripe.customers.listCards(customerId, (err, cards) => {
          if(err != null) return reject(err);
          resolve({customerId: customerId, cards: cards.data});
        });
      });
    }
  }
}
