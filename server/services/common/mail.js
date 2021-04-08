module.exports = function(mg, nodemailer, fs, replaceString, host, fbDB) {
  return {
    // Send login email.
    sendLoginEmail: function(userName, email, token, uid){
      const defaultEmailContent = 'Hey Kevin!';
      const defaultLink = 'allgive-magic-link';
      const defaultEmailContentHeader = 'Hey, ' + userName + '!';
      const subjetEmail = 'Your AllGive Secure Login Link';
      const replaseEmailContent = defaultEmailContentHeader + ` You just requested a secure login link for your AllGive account using this email address, ` + email + `. Just click the button below to safely log into your account and start giving to all of your favorite charities.`;
      const replaceLink = host + '/link-login?token=' + token + '&uid=' + uid;
      fs.readFile('./src/assets/template-login-email.html','UTF-8',function(err,data)
        {
          let templateData = data;
          templateData = replaceString(data, defaultEmailContent, replaseEmailContent);
          templateData = replaceString(templateData, defaultLink, replaceLink);

          const mailData = {
            from: "AllGive <help@allgive.org>",
            to: email,
            subject: subjetEmail,
            html: templateData
          };

          mg.messages().send(mailData, function (error, body) {
            // Log email
            fbDB.createEmailLog({
              time: new Date().getTime(),
              subject: subjetEmail,
              recipient: email
            });
          });

          // nodemailer.mail({
          //   from: "AllGive <help@allgive.org>", // sender address
          //   to: email, // list of receivers
          //   subject: subjetEmail, // Subject line
          //   // text: "Hello world", // plaintext body
          //   html: templateData // html body
          // });
      });
    },
    // Send payment email.
    sendPaymentEmail: async function(emailTo, userName, subjetEmail, contentEmail, cardInfo, emailType){
      const defaultEmailContent = 'Hey Kevin!';
      const defaultEmailContentHeader = 'Hey, ' + userName + ' ! ';
      const addNewEmailContent = `Make sure to delete your old card number if this is a replacement number. If this is just an alternate method of payment then carry on! If this notification seems wrong or you didn’t add a new payment method, you’d better let us know right away! *If this problem persists please contact AllGive customer support at help@allgive.org.`
      const deleteCardEmailContent = `Make sure to add a new payment method if this was your only card on file so your donations will continue to be delivered to your charities. If this notification seems wrong or you didn’t remove a payment method, you’d better let us know right away!
      *If this problem persists please contact AllGive customer support at help@allgive.org.`
      const cardDeclinedEmailContent = `These problems usually occur for one of two reasons. Either your card on file has expired, or there were insufficient funds in the preferred account to make your daily gift. We will try to run the card again tomorrow. *If this problem persists please contact AllGive customer support at <a href="#" targer="_blank">help@allgive.org</a>.`
      const expirationEmailContent = `Make sure to add a new payment method if this was your only card on file so your donations will continue to be delivered to your charities. If this notification seems wrong or you, you’d better let us know right away! *If this problem persists please contact AllGive customer support at help@allgive.org.`
      let replaseEmailContent = defaultEmailContentHeader + `<br>Uh oh. It looks like ${contentEmail}, ${cardInfo}. `;
      switch(emailType) {
        case 'ADD_CARD_EMAIL':
          replaseEmailContent += addNewEmailContent;
          break;
        case 'DEL_CARD_EMAIL':
          replaseEmailContent += deleteCardEmailContent;
          break;
        case 'EXP_CARD_EMAIL':
          replaseEmailContent += expirationEmailContent;
          break;
        case 'DEC_CARD_EMAIL':
          replaseEmailContent += cardDeclinedEmailContent;
          break;
      }

        fs.readFile('./src/assets/template-email.html','UTF-8',function(err,data)
        {
          const templateData = replaceString(data, defaultEmailContent, replaseEmailContent);

          const mailData = {
            from: "AllGive <help@allgive.org>", // sender address
            to: emailTo, // list of receivers
            subject: subjetEmail, // Subject line
            html: templateData // html body
          };

          mg.messages().send(mailData, function (error, body) {
            console.log(body);
          });
          // nodemailer.mail({
          //   from: "AllGive <help@allgive.org>", // sender address
          //   to: emailTo, // list of receivers
          //   subject: subjetEmail, // Subject line
          //   // text: "Hello world", // plaintext body
          //   html: templateData // html body
          // });
      });
    },
    // Send an email.
    sendEmail: async function(emailTo, content, type){
      const defaultEmailContent = 'Hey Kevin!';
      let replaseEmailContent;
      let subject;
      let brand = '';
      if (content.brand) {
        brand = content.brand.toLowerCase().includes('card') ? content.brand : content.brand + ' Card';
      }
      switch(type) {
        case 'ADD_DONATION':
          subject = 'AllGive Donation Scheduled';
          replaseEmailContent = `<p style="margin:0;">Congratulations, <b>${content.name}</b>!</p>
            <p style="margin:0;">We’ve processed your first ${content.interval} donation in the amount of $${(content.amount/100).toFixed(2)} for ${content.charity} using your <b>${brand}</b> ending in <b>${content.last4}</b>.
            The next donation will post to your account on ${content.date} and you can visit <a href="https://allgive.org/portfolio">your AllGive Portfolio</a> at any time between now and then to modify it if you’d like.</p>
            <p style="margin:0;">Thanks for making a difference for ${content.charity}!</p>
            <p style="margin:0;">Your AllGive Team</p>`;
          break;
        case 'UPDATE_DONATION':
          subject = 'AllGive Donation Updated';
          replaseEmailContent = `<p style="margin:0;">Hey, <b>${content.name}</b>!</p>
            <p style="margin:0;">We’ve updated your donation for ${content.charity} based on your request.
            You’ll now see a ${content.interval} transaction in the amount of $${(content.amount/100).toFixed(2)} using your <b>${brand}</b> ending in <b>${content.last4}</b>.
            The next donation will post to your account on ${content.date} and you can visit <a href="https://allgive.org/portfolio">your AllGive Portfolio</a> at any time between now and then to modify it if you’d like.</p>
            <p style="margin:0;">Thanks for making a difference for ${content.charity}!</p>
            Your AllGive Team`;
          break;
        case 'EXPIRED_CARD':
          subject = 'Uh Oh! Your Payment Method Has Expired';
          replaseEmailContent = `<p style="margin:0;">Hey <b>${content.name}</b>!</p>
            <p style="margin:0;">It looks like your payment method has expired. A <b>${brand}</b> ending in <b>${content.last4}</b> to be precise. Make sure to add a new payment method if this is your only card on file so your donations will continue to be delivered to your charities.
            If this notification seems wrong or your payment method hasn’t expired, you’d better let us know right away!</p>
            <p style="margin:0;">*If this problem persists please contact AllGive customer support at help@allgive.org.</p>`;
          break;
        case 'EXPIRE_SOON_CARD':
          subject = 'Uh Oh! Your Payment Method Expires Soon!';
          replaseEmailContent = `<p style="margin:0;">Hey <b>${content.name}</b>!</p>
            <p style="margin:0;">It looks like your payment method expires soon. A <b>${brand}</b> ending in <b>${content.last4}</b> to be precise. Make sure to <a href="https://allgive.org/portfolio">add a new payment method</a> if this is your only card on file so your donations will continue to be delivered to your charities.</p>
            <p style="margin:0;">If this notification seems wrong to you, you’d better let us know right away!</p>
            <p style="margin:0;">*If this problem persists please contact AllGive customer support at help@allgive.org.</p>`;
          break;
        case 'CARD_PROBLEM':
          subject = 'Houston, We Have a Problem';
          replaseEmailContent = `Uh oh. It looks like we are having an issue with a method of payment on your account. Your <b>${brand}</b> ending in <b>${content.last4}</b> did not work. These problems usually occur for one of two reasons: either your card has expired or there were insufficient funds to make your gift. If this was related to a recurring donation, we will try to run the card again tomorrow. 
            <p style="margin:0;">*If this problem persists please contact AllGive customer support at help@allgive.org.</p>`;
          break;
        case 'EXPIRED_CARD_ONE_CHARITY':
          subject = 'Your Payment Method Has Expired';
          replaseEmailContent = `Hey, <b>${content.name}</b>! It looks like your payment method has expired. Your <b>${brand}</b> ending in <b>${content.last4}</b> expired on <b>${content.expireDate}</b>, so we cannot process your scheduled donation to <b>${content.donations[0]}</b>.
            <p style="margin:0;">Please <a href="https://allgive.org/portfolio">update your payment method</a> so your donations will continue to be delivered to your charities.</p>
            If this notification seems wrong or your payment method hasn’t expired, you’d better let us know right away!
            <p style="margin:0;">*If this problem persists please contact AllGive customer support at help@allgive.org.</p>`;
          break;
        case 'EXPIRED_CARD_MULTI_CHARITY':
          subject = 'Your Payment Method Has Expired';
          let donations = '';
          content.donations.forEach(item => {
            donations += `<p><b>${item}</b></p>`;
          });
          replaseEmailContent = `Hey, <b>${content.name}</b>! It looks like your payment method has expired. Your <b>${brand}</b> ending in <b>${content.last4}</b> expired on <b>${content.expireDate}</b>, so we cannot process your scheduled donations to:
            ${donations}
            <p style="margin:0;">Please <a href="https://allgive.org/portfolio">update your payment method</a> so your donations will continue to be delivered to your charities.</p>
            If this notification seems wrong or your payment method hasn’t expired, you’d better let us know right away!
            <p style="margin:0;">*If this problem persists please contact AllGive customer support at help@allgive.org.</p>`;
          break;
      }

      const templatePath = './src/assets/donation-email.html';

      fs.readFile(templatePath, 'UTF-8', function(err,data)
        {
          const templateData = replaceString(data, defaultEmailContent, replaseEmailContent);

          const mailData = {
            from: "AllGive <help@allgive.org>",
            to: emailTo,
            subject: subject,
            html: templateData
          };

          mg.messages().send(mailData, function (error, body) {
            // Log email
            fbDB.createEmailLog({
              time: new Date().getTime(),
              subject: subject,
              recipient: emailTo
            });
          });

          // nodemailer.mail({
          //   from: "AllGive <help@allgive.org>",
          //   to: emailTo,
          //   subject: subject,
          //   html: templateData
          // });
      });
    },
    // Send contact email.
    sendContactEmail: async function(sender, message, firstName, lastName, phone){
      const mailData = {
        from: sender, // sender address
        to: "help@allgive.org", // list of receivers
        bcc: "david@allgive.org",
        subject: 'Contact Us', // Subject line
        html: `<p>Support message received at :</p>
                <p>Name - ` + firstName + ` ` + lastName + `</p>
                <p>Email - ` + sender + `</p>
                <p>Phone - ` + phone + `</p>
                <p>Message - ` + message + `</p>`
      };

      mg.messages().send(mailData, function (error, body) {
        console.log(body);
      });
      // nodemailer.mail({
      //   from: sender, // sender address
      //   to: "help@allgive.org", // list of receivers
      //   bcc: "david@allgive.org",
      //   subject: 'Contact Us', // Subject line
      //   html: `<p>Support message received at :</p>
      //           <p>Name - ` + firstName + ` ` + lastName + `</p>
      //           <p>Email - ` + sender + `</p>
      //           <p>Phone - ` + phone + `</p>
      //           <p>Message - ` + message + `</p>`
      // });
    },
    // Send welcome email.
    sendWelcomeEmail: async function(userName, email, token, uid){
      const secureLink = host + '/link-login?token=' + token + '&uid=' + uid;
      const mailData = {
        from: "AllGive <help@allgive.org>",
        to: email,
        subject: 'Welcome to AllGive!', // Subject line
        html: `<p>Thanks for showing an interest in AllGive! You have been selected to fill a very important role in the AllGive family. As a beta tester, you are helping us ensure that the site is running as smoothly as possible before opening to the world. Keep in mind that even though we are in the "friends and family" phase of our launch, your donations are real and will be deducted from your card on file immediately and delivered to your charity of choice at the end of each month.</p>
                <p>Speaking of donations, below you will find a link to your donor account. Click the link, and browse through our ever-growing list of charities. If you find something you like, go ahead and start giving. If you have a charity you would like to see in the system, please send an email to help@allgive.org and we'll let you know when your charity has been added. As you progress through your experience with AllGive, please make us aware of any issues you encounter, bugs you run across, or suggestions you might have by sending an email to help@allgive.org.</p>
                <p>Thanks again for using AllGive, and happy giving!</p>
                <p><a href="${secureLink}">Click Here to Log In</a></p>`
      };

      mg.messages().send(mailData, function (error, body) {
        console.log(body);
      });
    },
    // Send test mail.
    sendTestEmail: async function(){
      const mailData = {
        from: "AllGive <help@allgive.org>", // sender address
        to: "alexandrkoval24@gmail.com", // list of receivers
        subject: 'Test Email', // Subject line
        html: `<p>This is test email from allgive.org :</p>`
      };

      mg.messages().send(mailData, function (error, body) {
        console.log(body);
      });
    }
  }
}
