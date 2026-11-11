import { Resend } from 'resend';

import { RESEND_API_KEY } from '$app/env/private';

const resend = new Resend(RESEND_API_KEY);

export type Mail = {
    to: string;
    subject: string;
    text: string;
};

export function sendMail(mail: Mail) {
    console.log("------------------------------------------------------------------------------------");
    console.log("To: " + mail.to + "\nSubject: " + mail.subject + "\nText: " + mail.text);
    console.log("------------------------------------------------------------------------------------");

    resend.emails.send({
        from: 'onboarding@resend.dev',
        to: mail.to,
        subject: mail.subject,
        html: mail.text
    });
}