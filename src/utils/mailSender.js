import nodemailer from "nodemailer"

export const sendMail = async(to , subject , content)=>{
    let transporter = nodemailer.createTransport({
        service : `Gmail`,
        auth : {
            user : process.env.EMAIL,
            pass : process.env.PASS
        }
    })

    //mail option
    let mailOption = {
        from : process.env.EMAIL,
        to : to,
        subject : subject,
        html : ` <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Status</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
            <div style="background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                <h2 style="color: #007bff;">Ku[k]ami technology</h2>
                <p style="font-size: 16px;">Hello User,</p>
                <p style="font-size: 16px;">${content}</p>
                <p style="font-size: 16px;">Thank you!</p>
            </div>
        </body>
        </html>`
    }
    try{
        const info = await transporter.sendMail(mailOption)
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        return info
    }catch(err){
        throw err
    }
}