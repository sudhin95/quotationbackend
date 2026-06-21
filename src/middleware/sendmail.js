const nodemailer = require("nodemailer");

exports.sendemail = (data) => {
    return new Promise((resolve, reject) => {
        try {
            let mail_host;
            let smtp_username;
            let smtp_password;
            let smtp_port;
            const email_settings_enabled = 1;

            if (email_settings_enabled === 1) {
                mail_host = data.mail_host;
                smtp_username = data.smtp_username;
                smtp_password = data.smtp_password;
                smtp_port = data.smtp_port;
            } else {
                mail_host = "mail.lytty.com";
                smtp_port = 587;
                smtp_username = "noreply@lytty.com";
                smtp_password = "9J1lX5q7EOhlMjO";
            }

            const transporter = nodemailer.createTransport({
                host: mail_host,
                port: smtp_port,
                secure: false,
                auth: {
                    user: smtp_username,
                    pass: smtp_password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: `"${data.from_name}" <${data.from_email}>`,
                to: "sudhin95@gmail.com",
                subject: "Test Mail",
                text: "test",
                html: "<h1>Test Mail</h1><p>This is a test mail.</p>"
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return reject(error);  // ✅ rejects the promise on error
                }
                resolve(info);            // ✅ resolves the promise with result
            });

        } catch (err) {
            console.error("Unexpected Error:", err);
            reject(err);                  // ✅ rejects on sync errors too
        }
    });
};