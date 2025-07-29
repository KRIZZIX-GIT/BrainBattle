import userModel from '../models/user-model'
import tokenService from '../services/token-service'
import { ApiError } from '../exceptions/api-errors'
import bcrypt from 'bcrypt'
import { UserDto } from '../dto/user-dto'
import mailService from './mail-service'
import { Cassiopeia } from 'cassiopeia-starlighter';
import fs from "fs"
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'
import resetCodes from '../middlewares/ResetPasswordsCodes'

const examp = new Cassiopeia(process.env.CASSIOPEIA_EMAIL!, process.env.CASSIOPEIA_PASSWORD!);
examp.updateTokens();

class UserService {
  async registration(name: string, surname: string, nickname: string, email: string, password: string, avatar?: string, sub?: string) {
  
    if (!name || !surname || !nickname || !email || !password) {
        throw ApiError.BadRequest('Заполните все поля');
    }

    const candidate = await userModel.findOne({ email });
    if (candidate) {
        throw ApiError.BadRequest('Пользователь с такими данными уже существует!');
    }

    if (password.length < 6 || password.length > 20) {
        throw ApiError.BadRequest('Пароль должен содержать минимум 6 символов, максимум 20');
    }

    if (!/[a-zA-Zа-яА-Я]/.test(password) || !/\d/.test(password)) {
        throw ApiError.BadRequest('Пароль должен содержать буквы (английские или русские), и цифры');
    }

    if (name.length < 2 || name.length > 20) {
        throw ApiError.BadRequest('Имя должно содержать минимум 2 символа, максимально 20');
    }

    if (surname.length < 2 || surname.length > 20) {
        throw ApiError.BadRequest('Фамилия должна содержать минимум 2 символа, максимально 20');
    }

    if (nickname.length < 2 || nickname.length > 20) {
        throw ApiError.BadRequest('Никнейм должен содержать минимум 2 символа, максимально 20');
    }
    if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/i.test(nickname)) {
      throw ApiError.BadRequest('Никнейм должен содержать хотя бы одну английскую букву и может содержать цифры, точки, дефисы и нижние подчеркивания.');
    }

    // Hash password
    const saltPass = await bcrypt.genSalt(8);
    const hashPass = await bcrypt.hash(password, saltPass);
    const activationLink = uuidv4()

    let hashSub;
    if (sub) {
      const saltSub = await bcrypt.genSalt(8);
      hashSub = await bcrypt.hash(sub, saltSub);
    }

    const user = await userModel.create({
        name: name.trim(),
        surname: surname.trim(),
        username: nickname.trim(),
        email,
        password: hashPass,
        avatar,
        activationLink,
        sub: hashSub
    });

    await mailService.sendActivationMail(
			email,
			`https://brainbattle-production.up.railway.app/api/activate/${activationLink}`
		)

    const userDto = new UserDto(user);
    const tokens = await tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { message: 'Всё прошло успешно', status: 200, ...tokens, user: userDto };
  }
  async googleAuth(sub: string, email: string) {
    if (!sub || !email) {
      throw ApiError.BadRequest('Неверные данные');
    } 
    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден')
    }
    if (!user.sub) {
      throw ApiError.BadRequest('Пользователь авторизован, но не с Google и с facebook')
    }
    const isSubEquals = await bcrypt.compare(sub, user.sub)
    if (!isSubEquals) {
      throw ApiError.BadRequest('Почта не привязана к этому сервису')
    }
    const userDto = new UserDto(user)
    const tokens = await tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async activate(activationLink: string) {
		const user = await userModel.findOne({ activationLink })
		if (!user) throw ApiError.BadRequest('Пользователь с таким email не найден')
		user.isActivated = true
		await user.save()
	}

  async login(login: string, password: string) {
    let user = await userModel.findOne({ email: login })
    if (!user) {
      user = await userModel.findOne({ username: login })
    }
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден')
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль')
    }
    
    const userDto = new UserDto(user)
    const tokens = await tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }
  async existenceUser( email: string, name: string, surname: string) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!name || !surname || !email) {
        throw ApiError.BadRequest('Заполните все поля')
      }
      if (!emailPattern.test(email)) {
        throw ApiError.BadRequest('Неверный формат email')
      }
      if (name.length < 2 || name.length > 20) {
        throw ApiError.BadRequest('Имя должно содержать минимум 2 символа, максимуи 20')
      }
      if (surname.length < 2 || surname.length > 20) {
        throw ApiError.BadRequest('Фамилия должна содержать минимум 2 символа, максимуи 20')
      }
      const user = await userModel.findOne({ email })
      
      if (user) {
        throw ApiError.BadRequest('Пользователь с такими данными уже существует')
      }

      return { message: 'Пользователь с такими данными не существует', status: 200 }
  }

  async checkAuth(refreshToken: string) {
      if (!refreshToken) throw ApiError.UnauthorizedError();

      const userData = await tokenService.validateRefreshToken(refreshToken);
      console.log(userData)
      
      if (typeof userData !== 'object' || !userData || !('email' in userData)) {
          throw ApiError.UnauthorizedError();
      }

      const user = await userModel.findOne({ email: userData.email });

      if (!user) throw ApiError.UnauthorizedError();

      const userDto = new UserDto(user);
      return { user: userDto };
  }

  async setAvatar(refreshToken: string, avatarPath: string) {
		if (!refreshToken) throw ApiError.UnauthorizedError()

		const userData = await tokenService.validateRefreshToken(refreshToken)
    if (!userData || typeof userData !== 'object' || !userData || !('email' in userData)) {
      throw ApiError.UnauthorizedError();
    }
		const user = await userModel.findOne({ email: userData.email })
		if (!user) throw ApiError.UnauthorizedError()
		if (avatarPath) {
      console.log(avatarPath)
      const buffer = fs.readFileSync(avatarPath)
      const fileName = avatarPath.split('\\').pop();
      if (!fileName) {
        throw ApiError.UnauthorizedError();
      }
      const result = await examp.upload(buffer, fileName, true)
      console.log(result)
      if (!result || typeof result !== 'object' || !('uuid' in result)) {
        throw ApiError.UnauthorizedError();
      }
			user.avatar = 'https://cassiopeia-database-195be7295ffe.herokuapp.com/api/v1/files/public/' + result.uuid
			await user.save()
			return { user: user.avatar }
		}
		else {
			return { user: user.avatar }
		}
	}

  async nicknameChange(nickname: string, userId: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден')
    }
    if (nickname.length < 2 || nickname.length > 15) {
      throw ApiError.BadRequest('Никнейм должен содержать минимум 2 символа, максимально 15')
    }
    if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/i.test(nickname)) {
      throw ApiError.BadRequest('Никнейм должен содержать хотя бы одну английскую букву и может содержать цифры, точки, дефисы и нижние подчеркивания.');
    }
    user.username = nickname.trim()
    await user.save()
    return { message: 'Никнейм успешно изменен', status: 200 }
  }

  async surnameChange(surname: string, userId: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден')
    }
    if (surname.length < 2 || surname.length > 20) {
      throw ApiError.BadRequest('Фамилия должна содержать минимум 2 символа, максимально 20')
    }
    user.surname = surname.trim()
    await user.save()
    return { message: 'Фамилия успешно изменена', status: 200 }
  }

  async nameChange(name: string, userId: string) {
     const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден')
    }
    if (name.length < 2 || name.length > 20) {
      throw ApiError.BadRequest('Имя должно содержать минимум 2 символа, максимально 20')
    }
    user.name = name.trim()
    await user.save()
    return { message: 'Имя успешно изменено', status: 200 }
  }
  
  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }
  async deleteUser(refreshToken: string) {
    const userData = await tokenService.validateRefreshToken(refreshToken)
    if (!userData || typeof userData !== 'object' || !userData || !('email' in userData)) {
      throw ApiError.UnauthorizedError();
    }
    const user = await userModel.findOne({ email: userData.email })
    if (!user) throw ApiError.UnauthorizedError()
    await userModel.findByIdAndDelete(user._id)
    return { message: 'Пользователь успешно удален', status: 200 }
  }

  async forgotPassword(email: string) {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }
  
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); 
    const link = 'https://brainbattle.onrender.com/resetPassword';
  
    resetCodes[email] = { code: resetCode };
  
    await mailService.sendResetPasswordEmail(email, link, resetCode);
    return { message: 'Письмо с инструкцией отправлено на почту', status: 200 };
  }

  async verifyCode(email: string, code: string) {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден');
    }
  
    const userResetCode = resetCodes[email];
    if (!userResetCode || userResetCode.code !== code) {
      throw ApiError.BadRequest('Неправильный или истекший код сброса');
    }
 
    delete resetCodes[email];
  
    return { message: 'Код подтвержден', status: 200 }
  }

  async changePassword(newPassword: string, email: string) {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден');
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      throw ApiError.BadRequest('Пароль должен содержать минимум 6 символов, максимум 20');
  }

  if (!/[a-zA-Zа-яА-Я]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw ApiError.BadRequest('Пароль должен содержать буквы (английские или русские), и цифры');
  }

  const saltPass2 = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash(newPassword, saltPass2);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Пароль успешно изменен', status: 200 };
  }
  async newPassword(oldPassword: string, newPassword: string, email: string) {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw ApiError.BadRequest('Неверный пароль');
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      throw ApiError.BadRequest('Новый пароль должен содержать минимум 6 символов, максимум 20');
    }
    if (!/[a-zA-Zа-яА-Я]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw ApiError.BadRequest('Новый пароль содержать буквы (английские или русские), и цифры');
    }
    const saltPass2 = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(newPassword, saltPass2);
    user.password = hashedPassword;
    await user.save();
    
  }
}
export default new UserService()