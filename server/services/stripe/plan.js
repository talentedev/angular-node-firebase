module.exports = function(stripe) {
  return {
    // Create new plan.
    createPlan: function(amount, interval, product) {
      return new Promise(function(resolve, reject) {
        stripe.plans.create({
          currency: 'usd',
          amount: amount,
          interval: interval,
          product: product
        }, function(err, plan) {
          if (err) reject(err);
          resolve(plan);
        });
      });
    },
    // Get plans by option.
    getByFilter: async function(option) {
      const promise = new Promise((resolved, rejected) => {
        stripe.plans.list(
          option,
          function(err, plans) {
            if(err != null) {
              return rejected();
            }
            resolved(plans);
        });
      });

      return await promise.then((plans => {return plans;})).catch(_=> {return false;});
    },
    // Fetch all plans.
    getAll: async function () {
      let option = {
        limit: 100
      }
      let all = [];
      let idx = 0;
      while(true) {
        idx++;
        const plans = await this.getByFilter(option);
        if(plans == false)
          break;

        if(plans.data.length == 0) {
          break;
        }
        option.starting_after = plans.data[plans.data.length - 1].id;
        all = all.concat(plans.data);

        if(plans.has_more == false)
          break;
      }
      return all;
    },
    // Check if same plan is exist.
    getSamePlan: async function (product, amount, invertal) {
      const plans = await this.getAll();
      const samePlan = plans.filter(plan => {
        return plan.product === product && plan.amount === amount && plan.interval;
      })
      return samePlan.length > 0 ? samePlan[0] : null;
    }
  }
}
