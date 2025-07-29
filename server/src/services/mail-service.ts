import 'dotenv/config'
import nodemailer from 'nodemailer'

class mailService {
	transporter: nodemailer.Transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: +process.env.SMTP_PORT!,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		})
	}

	async sendActivationMail(email: string, link: string) {
		try {
			await this.transporter.sendMail({
				from: process.env.SMTP_USER,
				to: email,
				subject: `Активация аккаунта на ${process.env.CLIENT_URL}`,
				text: '',
				html: (`
                    <div style="background: #e74c3c; color: white; padding: 10px; border-radius: 10px;">
                        <h1>Благодарим вас за регистрацию на нашем сайте!</h1>
                        <p>Для завершения процесса регистрации и активации вашего аккаунта, пожалуйста, подтвердите вашу электронную почту.</p>
                        <p>Нажмите на указанную ссылку: <span style="color: white;">${link}</span></p>
                        <p>Спасибо за то, что выбрали нас!</p>
                        <p>С уважением, Команда №2</p>
                    </div>	
                `)
			})
		} catch (err) {
			console.error('Ошибка при отправке email:', err)
			throw err
		}
	}

	async sendResetPasswordEmail(email: string, link: string, resetCode: string) {
		try {
			await this.transporter.sendMail({
				from: process.env.SMTP_USER,
				to: email,
				subject: `Сброс пароля на ${process.env.CLIENT_URL}`,
				text: '',
				html: (`
                    <div style="background: #e74c3c; color: white; padding: 10px; border-radius: 10px;">
                        <h1>Сброс пароля</h1>
						<p>Здравствуйте ${email}</p>
                        <p>Вы получили это письмо, потому что вы запросили сброс пароля для вашей учетной записи.</p>
                        
                        <p>Нажмите на указанную ссылку: ${link}</p>
						<p color: white;'>Код сброса пароля: ${resetCode}</p>
						<p>срок действия ограничен!</p>
                        
                        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
						
						<p>Спасибо за использование нашего сервиса!</p>
						</div>
						`)
					});
				} catch (err) {
					console.error('Ошибка при отправке email:', err);
					throw err;
				}
			}
				

						
					
}

export default new mailService()