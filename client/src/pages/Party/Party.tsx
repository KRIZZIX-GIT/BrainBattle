import styles from './Party.module.css'
//npm
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { io, Socket } from 'socket.io-client'
//store
import { useLobbyStore } from '../../../store/lobbyStore'
import { quizzesStore } from '../../../store/quizzesStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { useUserStore } from '../../../store/userStore'
//assets
import notFoundImg from '../../assets/avatar.png'
import coutdown from '../../assets/SFX/game-countdown.mp3'
import join from '../../assets/SFX/join.wav'
import leave from '../../assets/SFX/leave.wav'
import elevatorSound from '../../assets/Sounds/Elevator-music.mp3'
import { PREFIX } from '../../config/api.config'
//components
import Preloader from '../../components/preloader/preloader'
import WhenIsTheError from '../../components/WhenIsTheError/WhenIsTheError'
import GameComponent from './Game/Game'
import { IQuizzes } from '../../../interfaces/IQuizzez-model'

interface IUser {
	id: string
	username: string
	name: string
	surname: string
	avatar: string
	socketId: string | undefined
}

const LobbyComponent = () => {
	const [socket, setSocket] = useState<Socket | null>(null)
	const { t } = useTranslation()
	const [lobbyId, setLobbyId] = useState<string>('')
	const [players, setPlayers] = useState<IUser[]>([])
	const [quiz, setQuiz] = useState<IQuizzes | null>(null)
	const { user, setError } = useUserStore()
	const { choosedQuiz } = useLobbyStore()
	const setVolumeFromStore = useLobbyStore(state => state.setVolume)
	const volumeFromStore = useLobbyStore(state => state.volume)
	const { quizById } = quizzesStore()
	const [translatedTexts, setTranslatedTexts] = useState<
		Record<string, string>
	>({})
	const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})
	const [countdown, setCountdown] = useState<string | number | null>(null)
	const [showVolume, setShowVolume] = useState<boolean>(false)
	const [volume, setVolume] = useState<number>(volumeFromStore)
	//Аудио
	const joinSFX = useRef<HTMLAudioElement | null>(null)
	const leaveSFX = useRef<HTMLAudioElement | null>(null)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const elevator = useRef<HTMLAudioElement | null>(null)
	const [youHost, setYouHost] = useState(false)

	const [isGameStarted, setIsGameStarted] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const { theme } = useSettingsStore()
	const [isLoading, setLoading] = useState(true)
	const [isLoadButton, setLoadButton] = useState(false)

	useEffect(() => {
		if (
			audioRef.current &&
			elevator.current &&
			joinSFX.current &&
			leaveSFX.current
		) {
			audioRef.current.volume = volume
			elevator.current.volume = volume
			joinSFX.current.volume = volume
			leaveSFX.current.volume = volume
		}
	}, [volume])

	useEffect(() => {
		const newSocket = io(PREFIX)
		newSocket.on('connect', () =>
			console.log('Connected to server:', newSocket.id)
		)
		newSocket.on('connect_error', () => {
			setError(`${t('SocketConnErr')}`)
		})
		setSocket(newSocket)
		newSocket.on('lobbyUpdated', lobbyData => {
			if (user && user.id == lobbyData.hostId) {
				setYouHost(true)
			}
			if (joinSFX.current) {
				joinSFX.current.play()
			}

			const getQuiz = async () => {
				return await quizById(lobbyData.quizId)
			}
			if (!quiz) {
				(async () => {
					try {
						const res = await getQuiz()
						setQuiz(res) 
					} catch (error) {
						navigate('/main')
					}
				})()
			}
			setPlayers((prevPlayers) => {		
				if (lobbyData.players.length > prevPlayers.length && joinSFX.current) {
					joinSFX.current.play()
				}
		
				if (lobbyData.players.length < prevPlayers.length && leaveSFX.current) {
					leaveSFX.current.play()
				}
		
				return lobbyData.players
			})
		})

		newSocket.on('lobbyClosed', () => {
			if (leaveSFX.current) {
				leaveSFX.current.play()
			}
			setLobbyId('')
			setLoadButton(false)
			navigate('/main')
		})

		newSocket.on('gameStart', (data) => {
			if (!isGameStarted && typeof data == "string") {
				setLoadButton(false)
				const countdownSequence: [number, number, number, number, number, string] = [
					5,
					4,
					3,
					2,
					1,
					'СТАРТ!'
				]
				let index: number = 0
				setCountdown(countdownSequence[index])
				if (audioRef.current) {
					audioRef.current.play()
				}

				const interval = setInterval(() => {
					index++
					if (index >= countdownSequence.length && elevator.current) {
						elevator.current.pause()
						elevator.current.currentTime = 0
						clearInterval(interval)
						setCountdown(null)
						setIsGameStarted(true)
					} else {
						setCountdown(countdownSequence[index])
					}
				}, 1000)
			}
		})

		newSocket.on('error', message => {
			setError(message.message)
			navigate('/main')
		})

		newSocket.on('lobbyNotFound', () => {
			setError(`${t('LobbyNotFound')}`)
			navigate('/main')
		})

		const params = new URLSearchParams(location.search)
		const code = params.get('code')
		if (user && code) {
			setLobbyId(code)
			newSocket.emit('joinLobby', { lobbyId: code, userId: user.id })
		}

		if (user && !code) {
			setPlayers([
				{
					name: user.name,
					surname: user.surname,
					avatar: user.avatar ?? "",
					username: user.username,
					id: user.id,
					socketId: socket?.id
				}
			])
		}

		return () => {
			newSocket.disconnect()
		}
	}, [location.search, user, navigate])

	useEffect(() => {
		if (!user) {
			setError(`${t('YouRlyAuth')}`)
			navigate('/')
		}
	}, [user])

	useEffect(() => {
		if (players.length == 0) {
			setLoadButton(true)
		} else {
			setLoadButton(false)
		}
	}, [players])

	useEffect(() => {
		if (choosedQuiz) {
			setQuiz(choosedQuiz)
		}
	}, [choosedQuiz])

	useEffect(() => {
		if (elevator.current && socket) {
			setLoading(true)
			elevator.current.play()
		}
	}, [])

	const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(event.target.value)
		setVolumeFromStore(newVolume)
		setVolume(newVolume)
	}

	const handleTranslate = async (quizName: string) => {
		if (!translatedTexts[quizName]) {
			try {
				const response = await axios.post(`${PREFIX}/api/translate`, {
					text: quizName
				})
				setTranslatedTexts(prev => ({ ...prev, [quizName]: response.data }))
			} catch (error) {
				setError(`${t('TranslateErrExt')}`)
			}
		}
	}

	const toggleText = (quizName: string) => {
		setShowOriginal(prev => ({
			...prev,
			[quizName]: !prev[quizName]
		}))
	}

	const createLobby = () => {
		if (socket && user && quiz && !isLoadButton) {
			setLoadButton(true)
			socket.emit(
				'createLobby',
				{ userId: user.id, quizId: quiz._id },
				(response: {
					success: boolean
					createdLobbyId?: string
					message?: string
				}) => {
					if (response.success && response.createdLobbyId) {
						setLobbyId(response.createdLobbyId)
						navigate(`/party?code=${response.createdLobbyId}`)
					} else {
						setError(`${t('LobbyCreateErr')}`)
					}
				}
			)
		}
	}

	const leaveLobby = () => {
		setLoadButton(true)
		if (socket && lobbyId && user && socket.id) {
			socket.emit('leaveLobby', { lobbyId })
			if (leaveSFX.current) {
				leaveSFX.current.play()
			}
			setLobbyId('')
			setPlayers([
				{
					name: user.name,
					surname: user.surname,
					avatar: user.avatar ?? "",
					username: user.username,
					id: user.id,
					socketId: socket?.id
				}
			])
			navigate('/party')
		}
		setLoadButton(false)
	}

	const seeVolume = () => {
		setShowVolume(!showVolume)
	}

	const startGame = () => {
		if (socket && !isLoadButton) {
			setLoadButton(true)
			socket.emit('startGame', { lobbyId })
		}
	}
	function truncateText(text: string, maxLength: number): string {
		if (!text) return ''
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
	}
	const [exitWarning, setExitWarning] = useState(false)
	function exit() {
		setExitWarning(true)
	}

	return (
		<div
			className={`${
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			} ${countdown !== null ? styles['fadeOut'] : ''}`}
		>
			<Preloader text={t('SocketConn')} isLoad={!isLoading} />
			<div className={styles['header']}>
				{!lobbyId ? (
					<p className={styles['header-text']}>{t('LobbyNotCreated')}</p>
				) : (
					<>
						<div className={styles['header-container']}>
							<p className={styles['header-text']}>
								{t('LobbyCode')}: {lobbyId}
							</p>
							<p className={styles['header-text']}>
								{t('Members')}: {players.length} / 4
							</p>
							<button className={styles['exit']} onClick={exit}>
								{t("Exit")}
							</button>
						</div>
						<p className={styles['header-text-2']}>p.s: {t('CodeTxt')})</p>
					</>
				)}
			</div>

			<div
				className={
					!exitWarning
						? styles['exit-container-invisible']
						: styles['exit-container']
				}
			>
				<div className={styles['exit-warning']}>
					<div className={styles['exit-warning-text-container']}>
						<p className={styles['exit-warning-text']}>{t('ExitQuestion')}</p>
						<p className={styles['exit-warning-text-2']}>
							{t('LobbyExitWarning')}
						</p>
					</div>
					<div className={styles['exit-warning-buttons']}>
						<button
							className={styles['exit-warning-button-2']}
							onClick={() => navigate('/main')}
						>
							{t('Yes')}
						</button>
						<button
							className={styles['exit-warning-button-1']}
							onClick={() => setExitWarning(false)}
						>
							{t('No')}
						</button>
					</div>
				</div>
			</div>

			<WhenIsTheError />
			<Snowfall style={{ position: 'fixed' }} />
			<audio ref={elevator} src={elevatorSound} preload='auto' loop />
			<audio ref={audioRef} src={coutdown} preload='auto' />
			<audio ref={joinSFX} src={join} preload='auto' />
			<audio ref={leaveSFX} src={leave} preload='auto' />
			{isGameStarted ? (
				<GameComponent socket={socket} players={players} />
			) : (
				<div className={styles['container']}>
					{countdown !== null && (
						<div className={styles['countdownOverlay']}>
							<div className={styles['countdownNumber']}>{countdown}</div>
						</div>
					)}

					<div className={styles['content-1']}>
						<p className={styles['content-1-text']}>{t('LobbyInclude')}</p>
					</div>

					<div className={styles['content-2']}>
						<ul className={styles['content-2-list']}>
							{players.map((player: IUser) => (
								<li key={player.id} className={styles['content-2-list-item']}>
									<img
										src={player.avatar ? player.avatar : notFoundImg}
										className={styles['avatar']}
										alt='Avatar'
									/>

									<div className={styles['player-info']}>
										<p className={styles['player-name']}>{player.username}</p>
										<div className={styles['player-info-2']}>
											<p className={styles['player-name2']}>{player.name}</p>
											<p className={styles['player-name2']}>{player.surname}</p>
										</div>
									</div>
								</li>
							))}
						</ul>

						{quiz && (
							<div className={styles['Quiz-block']}>
								<div className={styles['Quiz-block-content-1']}>
									<h2 className={styles['textAndTranslate']}>
										{showOriginal[quiz.quiz_name]
											? truncateText(quiz.quiz_name, 30)
											: truncateText(
													translatedTexts[quiz.quiz_name] || quiz.quiz_name,
													30
											  )}
									</h2>{' '}
									{!translatedTexts[quiz.quiz_name] && (
										<button
											onClick={() => handleTranslate(quiz.quiz_name)}
											className={styles['translate-button']}
										>
											{t('Translate')}
										</button>
									)}
									{translatedTexts[quiz.quiz_name] && (
										<button
											onClick={() => toggleText(quiz.quiz_name)}
											className={styles['translate-button']}
										>
											{showOriginal[quiz.quiz_name]
												? `${t('Translate')}`
												: `${t('Original')}`}
										</button>
									)}
								</div>

								<div className={styles['db-name']}>
									{`${t('FromDb')}: ` + quiz.TYPE}
								</div>

								<img
									src={quiz.image}
									alt={quiz.quiz_name}
									className={styles['imageCategory']}
								/>
							</div>
						)}
					</div>

					<div className={styles['content-3']}>
						{!lobbyId && (
							<div className={styles['content-3-buttons']}>
								<button
									className={styles['button-create']}
									onClick={createLobby}
								>
									{isLoadButton ? (
										<div className={styles['preloader']}>
											<div className={styles['cube']}>
												<div className={styles['cube__inner']}></div>
											</div>
											<div className={styles['cube']}>
												<div className={styles['cube__inner']}></div>
											</div>
											<div className={styles['cube']}>
												<div className={styles['cube__inner']}></div>
											</div>
										</div>
									) : (
										t('LobbyCreate')
									)}
								</button>
								<button
									className={styles['button-leave']}
									onClick={() => navigate('/main')}
								>
									{t('ToMenu')}
								</button>
							</div>
						)}
						{lobbyId && (
							<div className={styles['content-3-buttons']}>
								<button className={styles['button-leave']} onClick={leaveLobby}>
									{t('LobbyExit')}
								</button>
								{youHost && (
									<button
										className={styles['button-start']}
										onClick={startGame}
									>
										{isLoadButton ? (
											<div className={styles['preloader']}>
												<div className={styles['cube']}>
													<div className={styles['cube__inner']}></div>
												</div>
												<div className={styles['cube']}>
													<div className={styles['cube__inner']}></div>
												</div>
												<div className={styles['cube']}>
													<div className={styles['cube__inner']}></div>
												</div>
											</div>
										) : (
											t('Start')
										)}
									</button>
								)}
							</div>
						)}
					</div>

					<div className={styles['volumeContainer']} onClick={seeVolume}>
						{volume !== 0 ? <FaVolumeHigh /> : <FaVolumeXmark />}
						{showVolume && (
							<div className={styles['volumeChanger']}>
								<label>{Math.round(volume * 100)}%</label>
								<input
									type='range'
									min='0'
									max='1'
									step='0.01'
									value={volume}
									onChange={handleVolumeChange}
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default LobbyComponent