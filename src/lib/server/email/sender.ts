export type Mail = {
    to: string;
    subject: string;
    text: string;
};

export function sendMail(mail: Mail) {
    console.log("------------------------------------------------------------------------------------");
    console.log("To: " + mail.to + "\nSubject: " + mail.subject + "\nText: " + mail.text);
    console.log("------------------------------------------------------------------------------------");
}