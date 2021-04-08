const express = require('express');
const compression = require('compression')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const secure = require('express-force-https');
const firebase = require('firebase');
const admin = require('firebase-admin');
const fbConfig = require('./firebase.json');
const nodemailer = require('nodemailer');
const mailgun = require("mailgun-js");
const dotenv = require('dotenv');
dotenv.config();

const mg = mailgun({apiKey: process.env.MAIL_API_KEY, domain: process.env.MAIL_DOMAIN});

nodemailer.createTransport({
  pool: true,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true, // use TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

// Initialize firebase admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: fbConfig.databaseURL
});

// Initialize Firebase
firebase.initializeApp(fbConfig);
let database = firebase.database();
let fbAuth = firebase.auth();
const fbDB = require('./server/services/firebase/database')(database);

const fs=require('fs');
const replaceString = require('replace-string');
const mailService = require('./server/services/common/mail')(mg, nodemailer, fs, replaceString, process.env.HOST_URL, fbDB);

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const planService = require('./server/services/stripe/plan')(stripe);
const productService = require('./server/services/stripe/product')(stripe);
const subscriptionService = require('./server/services/stripe/subscription')(stripe);
const invoiceService = require('./server/services/stripe/invoice')(stripe);
const cardService = require('./server/services/stripe/card')(stripe);
const transactionService = require('./server/services/stripe/transactions')(stripe);
const userService = require('./server/services/stripe/user')(invoiceService, productService);
const customerService = require('./server/services/stripe/customer')(stripe, fbDB);
const dateService = require('./server/services/common/date');

// Webhook Services
const webhookService = require('./server/services/webhook/index')(subscriptionService, customerService, cardService, productService, invoiceService, fbDB, mailService);

const app = express();

//Set CORS middleware : Uncomment for production
// let corsOptions = {
//  origin: 'http://localhost:4200',
//  optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions));
app.use(cors());
app.use(compression());
const jsonParser = bodyParser.json();
const rawParser = bodyParser.raw({type: 'application/json'});
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(secure);

// Error handlers
app.use(function (err, req, res, next) {
  if (!err) {
    next();
  }
  console.log(err.stack);
  res.status(err.status || 500);
  res.send(err);
});
const cron = require("node-cron");

cron.schedule("0 06 * * *", function() {
  getExpireCards();
});

cron.schedule("0 07 1,8,15,22 * *", function() {
  getExpireSoon();
});

app.post('/force-run-cron', jsonParser, function (req, res) {
  getExpireCards();
  res.send({status: 'success'});
});

async function getExpireCards() {
  var dt = new Date();
  const year = dt.getFullYear();
  const month = dt.getMonth() + 1;
  const users = await fbDB.getAllUsers();
  const promises = [];
  users.forEach(user => {
    const userData = user.val();
    if (userData && userData.uid) {
      fbDB.getPayments(userData.uid).then(payments => {
        payments.forEach(payment => {
          const card = payment.val();
          if (card) {
            let data = {
              name: userData.firstName + ' ' + userData.lastName,
              brand: card.brand,
              last4: card.last4
            };
            if (card.exp_year === year && card.exp_month === month) {
              // Get donations associated with the card.
              fbDB.getDonatiosnByCard(userData.uid, card.id).then(snapshot => {
                if (snapshot.val()) {
                  const donations = Object.values(snapshot.val());
                  const dailyDonations = donations.filter(donation => donation.schedule === 'day');
                  const weeklyDonations = donations.filter(donation => donation.schedule === 'week');
                  const monthlyDonations = donations.filter(donation => donation.schedule === 'month');

                  const today = new Date();

                  if (dailyDonations.length > 0) {
                    const date = today.getDate();
                    if (date > 0 && date <= 7) {
                      data.donations = dailyDonations.map(a => a.product);
                      data.expireDate = (today.getMonth() + 1) + '/' + today.getFullYear();
                      if (dailyDonations.length === 1) {
                        mailService.sendEmail(userData.email, data, 'EXPIRED_CARD_ONE_CHARITY');
                      } else {
                        mailService.sendEmail(userData.email, data, 'EXPIRED_CARD_MULTI_CHARITY');
                      }
                    }
                  }

                  if (weeklyDonations.length > 0) {
                    weeklyDonations.forEach(donation => {
                      const created = new Date(donation.created * 1000);
                      if (created.getDay() === today.getDay()) {
                        data.donations = [donation.product];
                        data.expireDate = (today.getMonth() + 1) + '/' + today.getFullYear();
                        mailService.sendEmail(userData.email, data, 'EXPIRED_CARD_ONE_CHARITY');
                      }
                    });
                  }

                  if (monthlyDonations.length > 0) {
                    monthlyDonations.forEach(donation => {
                      const created = new Date(donation.created * 1000);
                      if (created.getDate() === today.getDate()) {
                        data.donations = [donation.product];
                        data.expireDate = (today.getMonth() + 1) + '/' + today.getFullYear();
                        mailService.sendEmail(userData.email, data, 'EXPIRED_CARD_ONE_CHARITY');
                      }
                    });
                  }
                }
              });
            }
            // if (card.exp_year === year && card.exp_month === (month + 1)) {
            //   mailService.sendEmail(userData.email, data, 'EXPIRE_SOON_CARD');
            // }
          }
        });
      });
    }
  });
}

async function getExpireSoon() {
  var dt = new Date();
  const year = dt.getFullYear();
  const month = dt.getMonth() + 1;
  const users = await fbDB.getAllUsers();
  const promises = [];
  users.forEach(user => {
    const userData = user.val();
    if (userData && userData.uid) {
      fbDB.getPayments(userData.uid).then(payments => {
        payments.forEach(payment => {
          const card = payment.val();
          if (card) {
            let data = {
              name: userData.firstName + ' ' + userData.lastName,
              brand: card.brand,
              last4: card.last4
            };
            if (card.exp_year === year && card.exp_month === (month + 1)) {
              mailService.sendEmail(userData.email, data, 'EXPIRE_SOON_CARD');
            }
          }
        });
      });
    }
  });
}

// Serve only the static files form the dist directory
app.use('/', express.static(__dirname + '/dist'));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});

/***************************************************************************
 *                                                                         *
 *     Get user information                                                *
 *                                                                         *
 ***************************************************************************/
app.post('/me', jsonParser, function (req, res) {
  const uid = req.body.uid;
  fbDB.getUserById(uid).then(snapshot => {
    if (snapshot.val()) {
      res.send(snapshot.val());
    } else {
      res.send(null);
    }
  });
});

/***************************************************************************
 *                                                                         *
 *     Check if user is registered on database                             *
 *                                                                         *
 ***************************************************************************/
app.post('/check-user', jsonParser, function (req, res) {
  const email = req.body.email;
  fbDB.getUserByEmail(email).then(snapshot => {
    if (snapshot.val()) {
      res.send(snapshot.val());
    } else {
      res.send(null);
    }
  });
});

/***************************************************************************
 *                                                                         *
 *     Get user's donations.                                               *
 *                                                                         *
 ***************************************************************************/
app.post('/donations', jsonParser, function (req, res) {
  const userId = req.body.uid;
  fbDB.getDonationsById(userId).then(donations => {
    if (donations.val() !== null) {
      const values = Object.values(donations.val());
      res.send(values);
    } else {
      res.send([]);
    }
  });
});

/***************************************************************************
 *                                                                         *
 *     Get user's transactions                                             *
 *                                                                         *
 ***************************************************************************/
app.post('/transactions', jsonParser, function (req, res) {
  const uid = req.body.uid;
  fbDB.getTransactionsById(uid).then(transactions => {
    if (transactions.val() !== null) {
      const values = Object.values(transactions.val());
      res.send(values);
    } else {
      res.send([]);
    }
  });
});

/***************************************************************************
 *                                                                         *
 *     Get user's payments.                                                *
 *                                                                         *
 ***************************************************************************/
app.post('/payments', jsonParser, function (req, res) {
  const uid = req.body.uid;
  fbDB.getPayments(uid).then(payments => {
    if (payments.val() !== null) {
      const values = Object.values(payments.val());
      res.send(values);
    } else {
      res.send([]);
    }
  });
});

/***************************************************************************
 *                                                                         *
 *     Register new user.                                                  *
 *                                                                         *
 ***************************************************************************/
app.post('/users', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const data = {
    uid: uid,
    email: email,
    firstName: firstName,
    lastName: lastName,
    created: dateService.now(),
    activated: 'null',
    lastlogin: 'null',
    logincount: 0,
    recent: 'null',
    enabled: true
  }
  fbDB.createUser(uid, data).then(result => {
    res.send({ result: 'success' });
  });
});

/***************************************************************************
 *                                                                         *
 *     Get a user by email                                                 *
 *                                                                         *
 ***************************************************************************/
app.post('/get-user-by-email', jsonParser, function (req, res) {
  const email = req.body.email;
  fbDB.getUserByEmail(email).then(result => {
    res.send(result);
  });
});

/***************************************************************************
 *                                                                         *
 *     Update user activities                                              *
 *                                                                         *
 ***************************************************************************/
app.post('/update-activity', jsonParser, function (req, res) {
  const uid = req.body.uid;
  fbDB.getUserById(uid).then(snapshot => {
    let user = snapshot.val();
    const now = dateService.now();
    if (user.activated === 'null') {
      user.activated = now;
    }
    user.logincount += 1;
    user.lastlogin = now;
    user.recent = now;
    fbDB.updateUser(uid, user).then(snapshot => {
      res.send(snapshot);
    });
  });
});

/***************************************************************************
 *                                                                         *
 *     Update user profile                                                 *
 *                                                                         *
 ***************************************************************************/
app.post('/update-profile', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  fbDB.getUserById(uid).then(snapshot => {
    let user = snapshot.val();
    let log = '';
    if (user.firstName !== firstName) {
      log = 'The first name changed from ' + user.firstName + ' to ' + firstName + '.';
    } else if(user.lastName !== lastName) {
      log = 'The last name changed from ' + user.lastName + ' to ' + lastName + '.';
    }
    user.firstName = firstName;
    user.lastName = lastName;
    fbDB.updateUser(uid, user).then(snapshot => {
      res.send(snapshot);
      fbDB.createLog(uid, {time: new Date().getTime(), text: log, user: firstName + ' ' + lastName});
    });
  });
});

/***************************************************************************
 *                                                                         *
 *     Update recent activities                                            *
 *                                                                         *
 ***************************************************************************/
app.post('/recent-activity', jsonParser, function (req, res) {
  const uid = req.body.uid;
  fbDB.getUserById(uid).then(snapshot => {
    let user = snapshot.val();
    user.recent = dateService.now();
    fbDB.updateUser(uid, user).then(snapshot => {
      res.send(snapshot);
    });
  });
});

function createSubscription(authUser, customerId, card, charityName, donationAmount, donationFrequency) {
  return new Promise((resolve, reject) => {
    productService.getProductByName(charityName).then(product => {
      if (product) {
        planService.createPlan(donationAmount, donationFrequency, product.id).then(newPricingPlan => {
          subscriptionService.createSubscription(customerId, newPricingPlan.id, card.id)
            .then(subscription => {
              const reqData = {
                created: Math.round(new Date() / 1000),
                product: charityName,
                schedule: donationFrequency,
                amount: donationAmount,
                status: "active",
                subscriptionId: subscription.id,
                productId: product.id,
                planId: newPricingPlan.id,
                cardId: card.id
              };
              fbDB.createDonation(authUser.uid, reqData).then(() => {
                fbDB.createLog(authUser.uid, {
                  time: new Date().getTime(),
                  text: `New donation to ${charityName} is created`,
                  user: authUser.firstName + ' ' + authUser.lastName
                });
                sendDonationAddedEmail(authUser, donationFrequency, donationAmount, charityName, card);
                resolve(subscription);
              }).catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
      } else {
        const newProduct = {
          name: charityName,
          type: 'service',
          statement_descriptor: `Donation subscription`
        }
        planService.createPlan(donationAmount, donationFrequency, newProduct).then(newPlan => {
          subscriptionService.createSubscription(customerId, newPlan.id, card.id)
            .then(subscription => {
              const reqData = {
                created: Math.round(new Date() / 1000),
                product: charityName,
                schedule: donationFrequency,
                amount: donationAmount,
                status: "active",
                subscriptionId: subscription.id,
                productId: newPlan.product,
                planId: newPlan.id,
                cardId: card.id
              };
              fbDB.createDonation(authUser.uid, reqData).then(() => {
                fbDB.createLog(authUser.uid, {
                  time: new Date().getTime(),
                  text: `New donation to ${charityName} is created`,
                  user: authUser.firstName + ' ' + authUser.lastName
                });
                sendDonationAddedEmail(authUser, donationFrequency, donationAmount, charityName, card);
                resolve(subscription);
              }).catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
      }
    });
  });
}

// Send email for dontion added.
function sendDonationAddedEmail(authUser, donationFrequency, donationAmount, charity, card) {
  let scheduledDate;
  let interval;
  switch(donationFrequency) {
    case 'day': scheduledDate = dateService.tomorrow(); interval = 'daily'; break;
    case 'week': scheduledDate = dateService.afterWeek(); interval = 'weekly'; break;
    case 'month': scheduledDate = dateService.afterMonth(); interval = 'monthly'; break;
    case 'year': scheduledDate = dateService.afterYear();  interval = 'annualy'; break;
    default: scheduledDate = '';
  }
  const emailContent = {
    name: authUser.firstName + ' ' + authUser.lastName,
    interval: interval,
    amount: donationAmount,
    charity: charity,
    date: scheduledDate,
    brand: card.brand,
    last4: card.last4
  };
  mailService.sendEmail(authUser.email, emailContent, 'ADD_DONATION');
}

/***************************************************************************
 *                                                                         *
 *     Create new subscription for new customer                            *
 *                                                                         *
 ***************************************************************************/
app.post('/new-subscription', jsonParser, async function (req, res) {
  const uid = req.body.uid;
  const charity = req.body.charity;
  const donationAmount = req.body.donation;
  const donationFrequency = req.body.frequency;
  const authUser = req.body.user;
  const token = req.body.token;

  fbDB.getPaymentByCardId(uid, token.card.id).then(card => {
    if (card.val() !== null) {
      res.send({message: 'The card already exist'});
    } else {
      customerService.findOrcreateCustomer(authUser.email).then(customer => {
        stripe.customers.createSource(customer.id, {source: token.id}, function(err, card) {
          if (err != null) {
            res.send(err);
            return;
          }

          createSubscription(authUser, customer.id, card, charity.title, donationAmount, donationFrequency)
            .then(result => {
              // Save card information to DB.
              card.customer = customer.id;
              card.active = true;
              fbDB.createPayment(authUser.uid, card);
              res.send(result);
            }).catch(err => res.send(err))
        })
        .catch(err => res.send(err));
      });
    }
  });
});

/***************************************************************************
 *                                                                         *
 *     Create new subscription for existing customer                       *
 *                                                                         *
 ***************************************************************************/
app.post('/subscription', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const charity = req.body.charity;
  const donationAmount = req.body.donation;
  const donationFrequency = req.body.frequency;
  const authUser = req.body.user;
  const customerId = req.body.customer;
  const card = req.body.card;

  createSubscription(authUser, customerId, card, charity.title, donationAmount, donationFrequency)
    .then(result => res.send(result))
    .catch(err => res.send(err));
});

/***************************************************************************
 *                                                                         *
 *     Cancel Subscription                                                 *
 *                                                                         *
 ***************************************************************************/
app.post('/cancel-subscription', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const subscriptionId = req.body.subscription_id;
  cancelSubscription(uid, subscriptionId).then(result => {
    res.send(result);
  }).catch(err => res.send({ err }));
});

function cancelSubscription(uid, subscriptionId) {
  return new Promise((resolve, reject) => {
    subscriptionService.cancelSubscription(subscriptionId).then(confirmation => {
    fbDB.getDonationBySubscription(uid, subscriptionId).then(donation => {
      if (donation.val() !== null) {
        const subId = Object.keys(donation.val())[0];
        let donationData = Object.values(donation.val())[0];
        donationData.status = 'canceled';
        fbDB.updateDonation(uid, subId, donationData).then(() => {
          fbDB.getUserById(uid).then(snapshot => {
            const user = snapshot.val();
            fbDB.createLog(uid, {
              time: new Date().getTime(),
              text: `The donation to ${donationData.product} is cancelled`,
              user: user.firstName + ' ' + user.lastName
            });
          });
          resolve(confirmation);
        });
      } else {
        reject({message: 'There is no such donation on database.'});
      }
    }).catch(err => reject({ err }));
  }).catch(err => {
    reject({ err });
  });
  });
}

function updateSubscription(uid, subscriptionId, data, amount, interval, planId, cardId) {
  return new Promise((resolve, reject) => {
    subscriptionService.update(subscriptionId, data).then(result => {
      fbDB.getDonationBySubscription(uid, subscriptionId).then(donation => {
        if (donation.val() !== null) {
          const subId = Object.keys(donation.val())[0];
          let donationData = Object.values(donation.val())[0];
          const prevAmount = donationData.amount;
          const prevInterval = donationData.schedule;
          if (amount !== null) {
            donationData.amount = amount;
          }
          if (interval !== null) {
            donationData['schedule'] = interval;
          }
          if (planId !== null) {
            donationData['planId'] = planId;
          }
          if (cardId !== null) {
            donationData['cardId'] = cardId;
          }
          fbDB.updateDonation(uid, subId, donationData).then(() => {
            fbDB.getUserById(uid).then(userData => {
              const user = userData.val();
              let intervalStr;
              let scheduledDate;
              switch(interval) {
                case 'day': scheduledDate = dateService.tomorrow(); intervalStr = 'daily'; break;
                case 'week': scheduledDate = dateService.afterWeek(); intervalStr = 'weekly'; break;
                case 'month': scheduledDate = dateService.afterMonth(); intervalStr = 'monthly'; break;
                case 'year': scheduledDate = dateService.afterYear();  intervalStr = 'annualy'; break;
                default: scheduledDate = '';
              }
              fbDB.getPaymentByCardId(uid, cardId).then(card => {
                const cardData = Object.values(card.val())[0];
                const emailContent = {
                  name: user.firstName + ' ' + user.lastName,
                  charity: donationData.product,
                  interval: intervalStr,
                  amount: amount,
                  date: scheduledDate,
                  brand: cardData.brand,
                  last4: cardData.last4
                };
                mailService.sendEmail(user.email, emailContent, 'UPDATE_DONATION');
              });

              // Log
              if (prevAmount != amount || prevInterval != interval) {
                fbDB.createLog(uid, {
                  time: new Date().getTime(),
                  text: `The donation to ${donationData.product} is changed from $${prevAmount/100}/${prevInterval} to $${amount/100}/${interval}`,
                  user: user.firstName + ' ' + user.lastName
                });
              }
            });
            resolve(result);
          });
        } else {
          reject({message: 'There is no such donation on database.'});
        }
      }).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}

/***************************************************************************
 *                                                                         *
 *     Update Subscription with other amount and schedule.                 *
 *                                                                         *
 ***************************************************************************/
app.post('/update-subscription', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const subscription_id = req.body.subscription_id;
  const charityName = req.body.charity_name;
  const donationAmount = req.body.donation;
  const donationFrequency = req.body.frequency;
  const cardId = req.body.cardId;
  const productId = req.body.productId;

  planService.getSamePlan(productId, donationAmount, donationFrequency).then(plan => {
    if (plan) {
      subscriptionService.getOneById(subscription_id).then(subscription => {
        if (subscription) {
          const data = {
            items: [{
              id: subscription.items.data[0].id,
              plan: plan.id
            }]
          };
          updateSubscription(uid, subscription_id, data, donationAmount, donationFrequency, plan.id, cardId).then(result => {
            res.send(result);
          }).catch(err => res.send(err));
        }
      });
    } else {
      planService.createPlan(donationAmount, donationFrequency, productId).then(newPricingPlan => {
        subscriptionService.getOneById(subscription_id).then(subscription => {
          if (subscription) {
            const data = {
              items: [{
                id: subscription.items.data[0].id,
                plan: newPricingPlan.id
              }]
            };
            updateSubscription(uid, subscription_id, data, donationAmount, donationFrequency, newPricingPlan.id, cardId).then(result => {
              res.send(result);
            }).catch(err => res.send(err));
          }
        });
      });
    }
  })
});

/***************************************************************************
 *                                                                         *
 *    Change payment for a donation                                        *
 *                                                                         *
 ***************************************************************************/
app.post('/change-payment', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const subscriptionId = req.body.subscriptionId;
  const isNewCard = req.body.isNewCard;
  if (isNewCard) {
    const customerId = req.body.customerId;
    const token = req.body.token;
    stripe.customers.createSource(customerId, {source: token.id}, function(err, card) {
      if (err != null) {
          res.send(err);
      }
      updateSubscription(uid, subscriptionId, {default_source: card.id}, null, null, null, card.id).then(result => {
        // Save card information to DB.
        card.customer = customerId;
        card.active = true;
        fbDB.createPayment(uid, card);
        res.send(result);
      }).catch(err => res.send(err));
    });
  } else {
    const cardId = req.body.cardId;
    updateSubscription(uid, subscriptionId, {default_source: cardId}, null, null, null, cardId).then(result => {
      res.send(result);
    }).catch(err => res.send(err));
  }
});

/***************************************************************************
 *                                                                         *
 *    Update user's card                                                   *
 *                                                                         *
 ***************************************************************************/
app.post('/update-card', jsonParser, function (req, res) {
  const uid = req.body.uid;
  const cardId = req.body.id;
  const customerId = req.body.customer;
  const data = {
    name: req.body.name,
    address_city: req.body.city,
    address_line1: req.body.address,
    address_line2: req.body.address2,
    address_state: req.body.state,
    address_zip: req.body.zip,
    exp_month: req.body.expMonth,
    exp_year: req.body.expYear
  };
  cardService.update(customerId, cardId, data).then(result => {
    fbDB.getPaymentByCardId(uid, cardId).then(card => {
      if (card.val() !== null) {
        const subId = Object.keys(card.val())[0];
        fbDB.updatePayment(uid, subId, result);
        res.send(result);
      }
    });
  });
});

/***************************************************************************
 *                                                                         *
 *    Delete user's card                                                   *
 *                                                                         *
 ***************************************************************************/
app.post('/delete-card', jsonParser, async function (req, res) {
  const uid = req.body.uid;
  const isDelete = req.body.isDelete;
  const card = req.body.card;
  const isNewCard = req.body.isNewCard;
  const email = req.body.email;
  let assignedCard = req.body.assignedCard;

  if (isNewCard) {
    const customers = await customerService.getCustomersByEmail(email);
    const customerId = customers.data[0].id;
    assignedCard = await createSource(uid, customerId, assignedCard.id);
  }

  let all = [];
  if(isDelete) {
    if(card.charities != undefined) {
      card.charities.forEach((charity) => {
        all.push(cancelSubscription(uid, charity.subscriptionId));
      });
    }
  } else {
    if(card.charities != undefined) {
      card.charities.forEach((charity) => {
        all.push(updateSubscription(uid, charity.subscriptionId, {default_source: assignedCard.id}, null, null, null, assignedCard.id));
      });
    }
  }

  all.push(new Promise((resolved, rejected) => {
    stripe.customers.deleteSource(
    card.customer,
    card.id,
    function(err, confirmation) {
      fbDB.getPaymentByCardId(uid, card.id).then(result => {
        if (result.val() !== null) {
          const subId = Object.keys(result.val())[0];
          let data = Object.values(result.val())[0];
          data.active = false;
          fbDB.updatePayment(uid, subId, data);
        }
      });
      resolved(); 
    }
  )}));

  Promise.all(all).then(() => {
    res.send({status: 'OK'});
  }).catch(err => {
    res.send({status: 'OK'});
  });
});

function createSource(uid, customerId, tokenId) {
  return new Promise((resolve, reject) => {
    stripe.customers.createSource(customerId, {source: tokenId}, function(err, card) {
      if (err != null) {
        reject(err);
        return;
      }
      // Save card information to DB.
      card.customer = customerId;
      card.active = true;
      fbDB.createPayment(uid, card);
      resolve(card);
    });
  });
}

/***************************************************************************
 *                                                                         *
 *    Send message to user email in case of Payment Method Removed         *
 *                                                                         *
 ***************************************************************************/
app.post('/card-remove-email', jsonParser, async function(req, res){
  const cardBrand = req.body.card.brand;
  const cardLast4 = req.body.card.last4;
  const uid = req.body.uid;

  const userData = await fbDB.getUserById(uid);
  const user = userData.val();
  const cardInfo = cardBrand + ' ending in ' + cardLast4;
  const expireMailContent = 'you just removed a payment method from your account';
  const subjetEmail = 'You Removed a Payment Method';
  // await mailService.sendPaymentEmail(user.email, user.firstName + ' ' + user.lastName, subjetEmail, expireMailContent, cardInfo, 'DEL_CARD_EMAIL');
  res.send({message : 'success'});
});

/***************************************************************************
 *                                                                         *
 *    Send message to user email in case of Payment Method Added-          *
 *                                                                         *
 ***************************************************************************/
app.post('/card-added-email', jsonParser, async function(req, res){
  const cardBrand = req.body.card.brand;
  const cardLast4 = req.body.card.last4;
  const uid = req.body.uid;

  const userData = await fbDB.getUserById(uid);
  const user = userData.val();
  const cardInfo = cardBrand + ' ending in ' + cardLast4;
  const expireMailContent = 'you just added a new payment method to your account';
  const subjetEmail = 'You Added a New Payment Method';
  // await mailService.sendPaymentEmail(user.email, user.firstName + ' ' + user.lastName, subjetEmail, expireMailContent, cardInfo, 'ADD_CARD_EMAIL');
  res.send({message : 'success'});
});

/***************************************************************************
 *                                                                         *
 *    Send message for contact us                                          *
 *                                                                         *
 ***************************************************************************/
app.post('/contact-us-email', jsonParser, async function(req, res){
  await mailService.sendContactEmail(req.body.email, req.body.message, req.body.firstName, req.body.lastName, req.body.phone);
  res.send({message : 'success'});
});

app.post('/card-error', jsonParser, async function(req, res){
  const cardBrand = req.body.card.brand;
  const cardLast4 = req.body.card.last4;
  const errorMsg = req.body.msg;
  const uid = req.body.user.uid;

  const userData = await fbDB.getUserById(uid);
  const user = userData.val();
  const data = {
    name: user.firstName + ' ' + user.lastName,
    brand: cardBrand,
    last4: cardLast4
  }
  await mailService.sendEmail(user.email, data, 'CARD_PROBLEM');
  res.send({message : 'success'});
})

/***************************************************************************
 *                                                                         *
 *   Send magic link to user                                               *
 *                                                                         *
 ***************************************************************************/
app.post('/send-magic-link', jsonParser, function(req, res){
  const email = req.body.email;
  fbDB.getUserByEmail(email).then(user => {
    const uid = Object.keys(user.val())[0];
    const values = Object.values(user.val())[0];
    admin.auth().createCustomToken(uid)
      .then( async function(customToken) {
        mailService.sendLoginEmail(values.firstName + ' ' + values.lastName, values.email, customToken, uid);
        res.send({uid: uid, token : customToken});
      })
      .catch(function(error) {
        res.send({message : error});
      });
  });
});

/***************************************************************************
 *                                                                         *
 *   Confirm signin by magic link                                          *
 *                                                                         *
 ***************************************************************************/
app.post('/confirm-signin', jsonParser, async function(req, res){
  const token = req.body.token;
  const uid = req.body.uid;
  let error = null;
  await firebase.auth().signInWithCustomToken(token)
    .catch(function(err) {
      error = err;
    });
  if (error) {
     res.send({message : error});
  } else {
    fbDB.getUserById(uid).then(user => {
      res.send(user);
    });
  }
});

/***************************************************************************
 *                                                                         *
 *   Enable beta user and send email                                       *
 *                                                                         *
 ***************************************************************************/
app.post('/enable-beta', jsonParser, function(req, res){
  const uid = req.body.uid;
  fbDB.updateUser(uid, {enabled: true}).then(snapshot => {
    fbDB.getUserById(uid).then(user => {
      const firstName = user.val().firstName;
      const lastName = user.val().lastName;
      const email = user.val().email;
      admin.auth().createCustomToken(uid)
        .then( async function(customToken) {
          mailService.sendWelcomeEmail(firstName + ' ' + lastName, email, customToken, uid);
          res.send({uid: uid, token : customToken});
        })
        .catch(function(error) {
          res.send({message : error});
        });
    });
  });
});

/***************************************************************************
 *                                                                         *
 *  Webhook from stripe                                                    *
 *                                                                         *
 ***************************************************************************/
app.post('/stripe-webhook', rawParser, (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  }
  catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch(event.type) {
    case 'charge.succeeded':
      webhookService.addTransaction(event.data.object).then(msg => {
        res.send(msg);
      }).catch(err => {res.status(500);res.send(err);});
      break;
    case 'charge.expired':
      webhookService.addTransaction(event.data.object).then(msg => {
        res.send(msg);
      }).catch(err => {res.status(500);res.send(err);});
      break;
    case 'charge.failed':
      webhookService.addTransaction(event.data.object).then(msg => {
        res.send(msg);
      }).catch(err => {res.status(500);res.send(err);});
      break;
    default:
      res.status(400).end();
      break;
  }
});

/***************************************************************************
 *                                                                         *
 *    Send test email                                                      *
 *                                                                         *
 ***************************************************************************/
app.post('/send-test-email', jsonParser, async function(req, res){
  await mailService.sendTestEmail();
  res.send({message : 'success'});
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
