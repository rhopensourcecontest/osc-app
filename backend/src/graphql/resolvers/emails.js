const nodemailer = require('nodemailer');
const { EMAILS } = require('../../constants/emails');
const Mentor = require('../../models/mentor');

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
 * Returns mail options object based on parameters
 * 
 * @param {string} recipient - email address of the recipient
 * @param {string} email - email address for message parametrization
 * @param {string} taskTitle - title of registered Task
 * @param {string} text - text of verification request
 * @returns {Object} - email options
 */
const getMailOptions = (recipient, emailType, email, taskTitle, text) => {
  let subject, header, message;
  switch (emailType) {
    case EMAILS.USER_REGISTRATION:
      subject = 'Open Source Contest - New registration';
      header = `Welcome to<br />Red Hat Open Source Contest.`;
      message = `<p>You have successfully created a new account!</p>`;
      break;
    case EMAILS.TASK_REGISTRATION:
      subject = 'Open Source Contest - New Task registration';
      header = `Your Task has a Student now!`;
      message = `<p>Student ${email} has registered to your ` +
        `task <b>${taskTitle}</b>.</p>`;
      break;
    case EMAILS.STUDENT_REGISTRATION:
      subject = 'Open Source Contest - New Task registration';
      header = `You successfully registered to new Task!`;
      message = `<p>Task<b> ${taskTitle}</b> now belongs to you. Happy coding!</p>`;
      break;
    case EMAILS.STUDENT_UNREGISTRATION:
      subject = 'Open Source Contest - Task registration cancelled';
      header = `Your Task is now free.`;
      message = `<p>Student ${email} has unregistered the task ` +
        `<b>${taskTitle}</b>.</p>`;
      break;
    case EMAILS.MENTOR_VERIFICATION:
      subject = 'Open Source Contest - Mentor Verification Request';
      header = `Mentor verification request`;
      message = `
        <p>Mentor: ${email}</p>
        <p style="text-align: left">${text}</p>
      `;
      break;
    case EMAILS.MENTOR_VERIFIED:
      subject = 'Open Source Contest - Mentor Verification Completed';
      header = `Mentor verification completed`;
      message = `<p>${text}</p>`;
      break;
    case EMAILS.ADMIN_VERIFIED:
      subject = 'Open Source Contest - Admin Verification Completed';
      header = `Admin verification completed`;
      message = `<p>${text}</p>`;
      break;
    default: break;
  }
  return {
    from: '"Open Source Contest" <' + process.env.NODEMAILER_EMAIL_ADDRESS + '>',
    to: recipient,
    subject: subject,
    html: `
      <div style="width: 500px; color: black;">
        <div style="background-color: #404040; color: white;">
          <center>
            <h1>${header}</h1>
          </center>
        </div>
        <center>
          ${message}
        </center>
        <hr />
      </div>
    `
  }
};

module.exports = {
  /**
   * Sends email notification based on parameters.
   * 
   * @param {string} recipient - email address of the recipient
   * @param {string} emailType - value from TASKS describing type of the email
   * @param {string} email - email address for message parametrization
   * @param {string} taskTitle - for Task registration only (null otherwise)
   * @param {string} text - additional text of the email
   */
  sendEmail: async (recipient, emailType, email, taskTitle, text) => {
    const mailOptions = getMailOptions(
      recipient, emailType, email, taskTitle, text
    );

    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (err) {
      console.log('Sending email failed. NODEMAILER_EMAIL_ADDRESS: '
        + process.env.NODEMAILER_EMAIL_ADDRESS);
    }
  },
  /**
   * Verification email resolver
   * 
   * @param {string} args.recipient
   * @param {string} args.emailType
   * @param {string} args.text
   * @param {Object} req
   * @throws {Error}
   * EMAILS.ADMIN_VERIFIED || EMAILS.MENTOR_VERIFIED:
   * 1. For Mentors without Admin rights
   * 
   * else:
   * 1. For not authenticated users
   * 2. For Students
   * 3. For verified Mentors without Admin rights
   */
  sendVerificationEmail: async (args, req) => {
    if (!req.isAdmin && (args.emailType === EMAILS.ADMIN_VERIFIED ||
      args.emailType === EMAILS.MENTOR_VERIFIED)) {
      throw new Error('Unauthenticated!');
    }
    if (!req.isAuth || !req.isMentor || (!req.isAdmin && req.isVerified)) {
      throw new Error('Unauthenticated!');
    }
    try {
      let email;
      if (args.emailType === EMAILS.MENTOR_VERIFICATION) {
        const mentor = await Mentor.findById(req.userId);
        email = mentor.email;
      }

      await module.exports.sendEmail(
        args.recipient,
        args.emailType,
        email,
        null,
        args.text
      );
      return "Success";
    } catch (err) {
      console.log(err);
    }
  }
};
