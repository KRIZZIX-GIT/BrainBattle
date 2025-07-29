import 'dotenv/config'
import { Request, Response, NextFunction } from 'express';
import userService from '../services/user-service'
import { ApiError } from '../exceptions/api-errors'
import { deleteFile } from '../middlewares/multer-middleware'

class UserController {

	async registration(req: Request, res: Response, next: NextFunction) {
		try {
            const {name, surname, nickname, email, password, avatar, sub} = req.body
			const resp = await userService.registration(name, surname, nickname, email, password, avatar, sub)
			res.cookie('refreshToken', resp.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				secure: true,
				httpOnly: true,
				sameSite: 'none'
			})
			res.send(resp)
		} catch (err) {
			next(err)
		}
	}

	async googleAuth(req: Request, res: Response, next: NextFunction) {
		try {
			const { sub, email } = req.body;
			const resp = await userService.googleAuth(sub, email);
			res.cookie('refreshToken', resp.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				secure: true,
				httpOnly: true,
				sameSite: 'none'
			})
			res.send(resp);
		} catch (err) {
			next(err);
		}
	}

	async existenceUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, name, surname } = req.body;
			const resp = await userService.existenceUser(email, name, surname);

			if (resp.status === 200) {
				res.send(resp);
			}
	
		} catch (err) {
			next(err);
		}
	}
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { login, password } = req.body
			
			const userData = await userService.login(login, password)
			
			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				secure: true,
				httpOnly: true,
				sameSite: 'none'
			})
			res.json(userData)
		} catch (err) {
			next(err)
		}
	}

	async setAvatar(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies
			const avatarPath = req.file ? req.file.path : null
			if (!avatarPath) throw ApiError.BadRequest('Необходимо загрузить аватарку')
			const avatar = await userService.setAvatar(refreshToken, avatarPath)
			deleteFile(req)
			res.json(avatar)
		} catch (err) {
			next(err)
		}
	}

	async activate(req: Request, res: Response, next: NextFunction) {
		const activationLink = req.params.link
		try {
			await userService.activate(activationLink)
			return res.redirect(process.env.CLIENT_URL!)
		} catch (err) {
			next(err)
		}
	}

	async checkAuth(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies
			const userData = await userService.checkAuth(refreshToken)
			res.json(userData)
		} catch (err) {
			next(err)
		}
	}

	async nicknameChange(req: Request, res: Response, next: NextFunction) {
		try {
			const { nickname } = req.body
			const { userId } = req.params
			if (!nickname) {
				throw ApiError.BadRequest('Не введен никнейм')
			}
			if (!userId) {
				throw ApiError.BadRequest('Не введен id')
			}
			const userData = await userService.nicknameChange(nickname, userId)
			res.json(userData)
		} catch (err) {
			next(err)
		}
	}
	async surnameChange(req: Request, res: Response, next: NextFunction) {
		try {
			const { surname } = req.body
			const { userId } = req.params
			if (!surname) {
				throw ApiError.BadRequest('Не введена фамилия')
			}
			if (!userId) {
				throw ApiError.BadRequest('Не введен id')
			}
			const userData = await userService.surnameChange(surname, userId)
			res.json(userData)
		} catch (err) {
			next(err)
		}
	}
	async nameChange(req: Request, res: Response, next: NextFunction) {
		try {
			const { name } = req.body
			const { userId } = req.params
			if (!name) {
				throw ApiError.BadRequest('Не введено имя')
			}
			if (!userId) {
				throw ApiError.BadRequest('Не введен id')
			}
			const userData = await userService.nameChange(name, userId)
			res.json(userData)
		} catch (err) {
			next(err)
		}
	}
	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies
			if (!refreshToken) {
				throw ApiError.UnauthorizedError()
			}
			const token = await userService.logout(refreshToken)
			res.clearCookie('refreshToken')
			res.json(token)
		} catch (err) {
			next(err)
		}
	}
	async deleteUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies
			if (!refreshToken) {
				throw ApiError.UnauthorizedError()
			}
			const token = await userService.deleteUser(refreshToken)
			res.clearCookie('refreshToken')
			res.json(token)
		} catch (err) {
			next(err)
		}
	}
	async forgotPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { email } = req.body;
			const resp = await userService.forgotPassword(email);
			res.send(resp);
		} catch (err) {
			next(err);
		}
	}
	async verifyCode(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, code } = req.body;
			const resp = await userService.verifyCode(email, code);
			res.send(resp);
		} catch (err) {
			next(err);
		}
	}
	async changePassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { password, email } = req.body;
			const resp = await userService.changePassword(password, email);
			res.send(resp);
		} catch (err) {
			next(err);
		}
	}
	async newPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { oldPassword, newPassword, email } = req.body;
			const resp = await userService.newPassword(oldPassword, newPassword, email);
			res.send(resp);
		} catch (err) {
			next(err);
		}
	}
}

export default new UserController()