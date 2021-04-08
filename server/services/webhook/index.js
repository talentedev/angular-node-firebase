module.exports = function (subscriptionService, customerService, cardService, productService, invoiceService, fbDB, mailService) {
  return {
    // Add new transaction.
    addTransaction: function (req) {
      return new Promise(function (resolve, reject) {
        const invoiceId = req.invoice;
        const fail = req.failure_code;
        const failMsg = req.failure_message;
        invoiceService.getById(invoiceId).then(invoice => {
          const createdAt = invoice.created;
          const email = invoice.customer_email;
          const amount = invoice.amount_paid;
          const billing = invoice.billing;
          const billingReason = invoice.billing_reason;
          const subscriptionId = invoice.subscription;
          if (billing === 'charge_automatically') {
            const interval = invoice.lines.data[0].plan.interval;
            subscriptionService.getOneById(subscriptionId).then(subscription => {
              const productId = subscription.plan.product;
              productService.getProduct(productId).then(product => {
                let data = {
                  created: Math.round(new Date().getTime()/1000),
                  card: req.source.brand + '-' + req.source.last4,
                  product: product.name,
                  schedule: interval,
                  amount: amount,
                  status: "succeeded"
                };
                if (fail) {
                  data.status = 'fail';
                  data.msg = failMsg;
                  data.failedAmount = req.amount;
                }
                fbDB.getUserByEmail(email).then(user => {
                  if (user.val() !== null) {
                    const uid = Object.keys(user.val())[0];
                    fbDB.createTransaction(uid, data).then(() => {
                      if (fail) {
                        const emailData = {
                          name: user.val().firstName + ' ' + user.val().lastName,
                          brand: req.source.brand,
                          last4: req.source.last4
                        }
                        mailService.sendEmail(email, emailData, 'CARD_PROBLEM');
                      }
                      resolve({message: 'success'});
                    }).catch(err => reject(err));
                  } else {
                    reject({message: "User don't exist on database"});
                  }
                }).catch(err => reject(err));
              }).catch(err => reject(err));
            }).catch(err => reject(err));
          }
        }).catch(err => reject(err));
      });
    }
  }
}
