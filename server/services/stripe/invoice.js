module.exports = function (stripe) {
  return {
    // Get user's invoices for a subscription.
    getInvoices: function (subscriptionId, customerId) {
      return new Promise(function (resolve, reject) {
        stripe.invoices.list(
          {
            customer: customerId,
            billing: "charge_automatically",
            paid: true,
            subscription: subscriptionId
          },
          function (err, invoices) {
            if (err) {
              reject(err);
            }
            resolve(invoices.data);
          }
        );
      });
    },
    // Get an invoice by id.
    getById: function (id) {
      return new Promise(function (resolve, reject) {
        stripe.invoices.retrieve(
          id,
          function (err, invoice) {
            if (err) {
              reject(err);
            }
            resolve(invoice);
          }
        );
      });
    },

    invoices: async function(option) {
      const promise = new Promise((resolved, rejected) => {
        stripe.invoices.list(
          option,
          function(err, invoices) {
            if(err != null) {
              return rejected();
            }
            resolved(invoices);
        });
      });

      return await promise.then((invoices => {return invoices;})).catch(_=> {return false;});
    },
    
    getAllInvoices: async function () {
      let option = {
        limit: 100
      }
      let all = [];
      let idx = 0;
      while(true) {
        idx++;
        const invoices = await this.invoices(option);
        if(invoices == false)
          break;

        if(invoices.data.length == 0) {
          break;
        }
        option.starting_after = invoices.data[invoices.data.length - 1].id;
        all = all.concat(invoices.data);

        if(invoices.has_more == false)
          break;
      }
      return all;
    }
  }
}
