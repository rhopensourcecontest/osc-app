const nodemailer = require('nodemailer');
const { EMAILS } = require('../../constants/emails');

/**
 * Email transporter object
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true, // 465
  auth: {
    user: process.env.NODEMAILER_EMAIL_ADDRESS,
    pass: process.env.NODEMAILER_EMAIL_PASSWORD
  }
});

/**
 * Returns email template based on parameters.
 *
 * @param {string} emailType - value from TASKS describing type of the email
 * @param {string} studentEmail - email of registered Student
 * @param {string} taskTitle - title of registered Task
 * @returns {string} - email template 
 */
const emailTemplate = (emailType, studentEmail, taskTitle) => {
  switch (emailType) {
    case EMAILS.USER_REGISTRATION:
      header = `Welcome to Red Hat Open Source Contest.`;
      message = `You have successfully created a new account!`;
      break;
    case EMAILS.TASK_REGISTRATION:
      header = `Your Task has a Student now!`;
      message = `Student ${studentEmail} has registered to your ` +
        `task ${taskTitle}.`;
      break;
  }
  return (
    `
      <div style="width: 500px; color: black;">
        <div style="background-color: #404040; color: white;">
          <center>
            <h1>${header}</h1>
          </center>
        </div>
        <center>
          <p>${message}</p>
        </center>
        <hr />
      </div>
    `
  )
}

/**
 * Returns mail options object based on recipient
 * 
 * @param {string} recipient - email address of the recipient
 */
const getMailOptions = (recipient) => {
  return {
    from: '"Open Source Contest" <' + process.env.NODEMAILER_EMAIL_ADDRESS + '>',
    to: recipient,
    subject: 'Open Source Contest - New registration',
    html: ''
  }
};

module.exports = {
  /**
   * Sends email notification based on parameters.
   * 
   * @param {string} recipient - email address of the recipient
   * @param {string} emailType - value from TASKS describing type of the email
   * @param {string} studentEmail - for Task registration only (null otherwise)
   * @param {string} taskTitle - for Task registration only (null otherwise)
   */
  sendEmail: async (recipient, emailType, studentEmail, taskTitle) => {
    mailOptions = {
      ...getMailOptions(recipient),
      html: emailTemplate(emailType, studentEmail, taskTitle)
    };

    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (err) {
      console.log('Sending email failed. NODEMAILER_EMAIL_ADDRESS: '
        + process.env.NODEMAILER_EMAIL_ADDRESS);
    }
  }
};
