import axios, { AxiosError } from 'axios'
import { create } from 'zustand'
import UserState from '../interfaces/user-interface'
import { PREFIX } from '../src/config/api.config'

export const useUserStore = create<UserState>(set => ({
	user: null,
	tokens: null,
	errorText: '',
	googleData: null,
	facebookData: null,

	login: async (info: { login: string; password: string }) => {
		try {
			const { data } = await axios.post(`${PREFIX}/api/login`, info, {
				withCredentials: true
			})
			set({
				user: data.user,
				tokens: {
					accessToken: data.accessToken,
					refreshToken: data.refreshToken
				},
				errorText: '',
				googleData: null,
				facebookData: null
			})
			return data.accessToken
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},

	setError: (errorText: string) => {
		set({ errorText })
		setTimeout(() => {
			set({ errorText: '' })
		}, 5000)
	},

	setGoogleData: (
		data: {
			email: string
			name: string
			surname: string
			avatar: string
			sub: string
		} | null
	) => {
		set({ googleData: data })
	},

	setFacebookData: (
		data: {
			email: string
			name: string
			surname: string
			avatar: string
			sub: string
		} | null
	) => {
		set({ facebookData: data })
	},
	registration: async (
		name: string,
		surname: string,
		nickname: string,
		email: string,
		password: string,
		avatar: string | undefined,
		sub: string | undefined
	) => {
		try {
			const { data } = await axios.post(
				`${PREFIX}/api/registration`,
				{ name, surname, nickname, email, password, avatar, sub },
				{ withCredentials: true }
			)
			set({
				user: data.user,
				tokens: data,
				googleData: null,
				facebookData: null
			})
			return data
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},

	googleAuth: async (email: string, sub: string) => {
		try {
			const { data } = await axios.post(
				`${PREFIX}/api/googleAuth`,
				{ email, sub },
				{ withCredentials: true }
			)
			set({
				user: data.user,
				tokens: data,
				googleData: null,
				facebookData: null
			})
			return data
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},

	existenceUser: async (email, name, surname) => {
		try {
			const { data } = await axios.post(
				`${PREFIX}/api/existenceUser`,
				{ email, name, surname },
				{ withCredentials: true }
			)
			return data
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},
    
	setAvatar: async (avatar: FormData) => {
		try {
			const { data } = await axios.post(`${PREFIX}/api/setAvatar`, avatar, {
				headers: { 'Content-Type': 'multipart/form-data' },
				withCredentials: true
			})

			set((state: any) => ({
				user: {
					...state.user,
					avatar: data.user
				}
			}))
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},

	checkAuth: async () => {
		try {
			const { data } = await axios.get(`${PREFIX}/api/checkAuth`, {
				withCredentials: true
			})
			set({ user: data.user, googleData: null, facebookData: null })
			if (data) {
				return true
			} else {
				return false
			}
		} catch (err: any) {
			return false
		}
	},
	nicknameChange: async (nickname: string, userId: string) => {
		try {
			const { data } = await axios.patch(
				`${PREFIX}/api/nicknameChange/${userId}`,
				{ nickname },
				{ withCredentials: true }
			)
			set({ user: data.user })
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},
	surnameChange: async (surname: string, userId: string) => {
		console.log(surname, userId)
		try {
			const { data } = await axios.patch(
				`${PREFIX}/api/surnameChange/${userId}`,
				{ surname },
				{ withCredentials: true }
			)
			set({ user: data.user })
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},
	nameChange: async (name: string, userId: string) => {
		console.log(name, userId)
		try {
			const { data } = await axios.patch(
				`${PREFIX}/api/nameChange/${userId}`,
				{ name },
				{ withCredentials: true }
			)
			set({ user: data.user })
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},
	logout: async () => {
		try {
			await axios.post(`${PREFIX}/api/logout`, {}, { withCredentials: true })
			set({ user: null, tokens: null, googleData: null, facebookData: null })
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},
	deleteUser: async () => {
		try {
			await axios.delete(`${PREFIX}/api/deleteUser`, { withCredentials: true })
			set({ user: null, tokens: null, googleData: null, facebookData: null })
		} catch (err: any) {
			let errorMessage = 'Ошибка соединения'
			if (err instanceof AxiosError) {
				errorMessage = err.response?.data.message || 'Ошибка соединения'
			} else if (err.request) {
				errorMessage = 'Нет ответа от сервера'
			}
			set({ errorText: errorMessage })
			setTimeout(() => {
				set({ errorText: '' })
			}, 5000)
			throw new Error(errorMessage)
		}
	},
    ForgotPassword: async (email: string) => {
        try {
            const { data } = await axios.post(`${PREFIX}/api/forgotPassword`, { email }, { withCredentials: true })
            set({ user: data.user })
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },
    veryfyResetCode: async (email: string, code: string) => {
        try {
            const { data } = await axios.post(`${PREFIX}/api/veryfyResetCode`, { email, code }, { withCredentials: true })
            set({ user: data.user })
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },
    changePassword: async (password: string, email: string) => {
        try {
            const { data } = await axios.post(`${PREFIX}/api/changePassword`, { password, email }, { withCredentials: true })
            set({ user: data.user })
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },
    newPassword: async (oldPassword: string, newPassword: string, email: string) => {
         console.log(oldPassword, newPassword, email)
        try {
            const { data } = await axios.post(`${PREFIX}/api/newPassword`, { oldPassword, newPassword, email }, { withCredentials: true })
            set({ user: data.user })
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    }
}))