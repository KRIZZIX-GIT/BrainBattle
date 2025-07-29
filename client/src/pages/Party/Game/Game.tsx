import { useEffect, useRef, useState } from 'react'
import { FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6'
import { Socket } from 'socket.io-client'
import styles from './Game.module.css'

//assets
import interferenseSFX from '../../../assets/SFX/interference.mp3'
import cutcseneSound from '../../../assets/Sounds/cutscene.mp3'
import goodKarma from '../../../assets/Sounds/Good-karma.mp3'
import resultsSound from '../../../assets/Sounds/results.mp3'
import ConfettiEffect from '../../../components/ConfettiEffect/ConfettiEffect'
import Game from '../../../components/Cutscene/Game'
import FinalResults from '../../../components/FinalResults/FinalResults'
import QuestionContainer from '../../../components/QuestionContainer/QuestionContainer'
import ResultsOverlay from '../../../components/ResultsOverlay/ResultsOverlay'
import StaticEffectCanvas from '../../../components/StaticEffectCanvas/StaticEffectCanvas'

interface IScores {
    [userId: string]: number
}

interface IResults {
    [userId: string]: boolean
}

interface IQuestion {
	question: string
	answers: string[]
}

interface GameComponentProps {
	socket: Socket | null
	players: { id: string; username: string; avatar: string; socketId: string | undefined }[]
}

const GameComponent = ({ socket, players }: GameComponentProps) => {
	const [countQuestions, setCountQuestions] = useState<number>(0)
	const [passedQuestions, setPassedQuestions] = useState<number>(0)
	const [isReady, setIsReady] = useState<boolean>(false)
	const [allReady, setAllReady] = useState<boolean>(false)
	const [readyPlayers, setReadyPlayers] = useState(0)
	const [totalPlayers, setTotalPlayers] = useState(players.length)
	const [lobbyId, setLobbyId] = useState<string>('')
	const [question, setQuestion] = useState<IQuestion | null>(null)
	const [showResults, setShowResults] = useState<boolean>(false)
	const [youChoose, setYouChoose] = useState<boolean>(false)
	const [results, setResults] = useState<IResults | null>(null)
	const [scores, setScores] = useState<IScores | null>(null)
	const [timer, setTimer] = useState(40)
	const [showVolume, setShowVolume] = useState<boolean>(false)
	const [volume, setVolume] = useState<number>(1)
	const [timerActive, setTimerActive] = useState<boolean>(false)
	const [interference, setInterference] = useState<boolean>(false)
	const [gameOver, setGameOver] = useState<boolean>(false)
	const cutsceneAudio = useRef<HTMLAudioElement | null>(null)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const resultsAudio = useRef<HTMLAudioElement | null>(null)
	const goodAudio = useRef<HTMLAudioElement | null>(null)

	useEffect(() => {
		if (
			cutsceneAudio.current &&
			audioRef.current &&
			resultsAudio.current &&
			goodAudio.current
		) {
			audioRef.current.volume = volume
			cutsceneAudio.current.volume = volume
			resultsAudio.current.volume = volume
			goodAudio.current.volume = volume
		}
	}, [volume])

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const code = params.get('code')
		if (code) setLobbyId(code)
		if (cutsceneAudio.current && !allReady) {
			cutsceneAudio.current.play()
		}
	}, [])

	useEffect(() => {
		if (socket && timer <= 0) {
			socket.emit('submitAnswer', { lobbyId, anser: '', time: 0 })
		}
	}, [timer])

	useEffect(() => {
		if (socket) {
			socket.on('nextQuestion', data => {
				setInterference(true)
				setPassedQuestions(prevPassedQuestions => prevPassedQuestions + 1)
				if (audioRef.current && resultsAudio.current) {
					resultsAudio.current.pause()
					resultsAudio.current.currentTime = 0
					audioRef.current.play()
				}
				setTimeout(() => {
					if (goodAudio.current) {
						goodAudio.current.play()
					}
					setInterference(false)
					setQuestion(data)
					setShowResults(false)
					setTimer(40)
					setTimerActive(true)
				}, 500)
			})

			socket.on('questionResult', ({ results, scores }) => {
				setInterference(true)
				if (audioRef.current && goodAudio.current) {
					goodAudio.current.pause()
					audioRef.current.play()
				}
				setTimeout(() => {
					if (resultsAudio.current) {
						resultsAudio.current.play()
					}
					setYouChoose(false)
					setInterference(false)
					setResults(results)
					setScores(scores)
					setShowResults(true)
					setTimerActive(false)

					if (socket.id) {
						const playerResult = results[socket.id]
						if (playerResult) {
							ConfettiEffect()
						}
					}
				}, 500)
			})

			socket.on('gameOver', ({ scores }) => {
				setScores(scores)
				setGameOver(true)
			})

			socket.on('waitingForPlayers', (ready: number, total: number) => {
				setReadyPlayers(ready)
				setTotalPlayers(total)
				if (ready === total) setAllReady(true)
			})

			socket.on('gameStart', ({ allQuestions }) => {
				setCountQuestions(allQuestions)
				if (cutsceneAudio.current) {
					cutsceneAudio.current.pause()
					cutsceneAudio.current.currentTime = 0
				}
				setAllReady(true)
			})

			return () => {
				socket.off('waitingForPlayers')
				socket.off('gameStart')
				socket.off('nextQuestion')
				socket.off('questionResult')
				socket.off('gameOver')
			}
		}
	}, [socket])

	useEffect(() => {
		if (timerActive && timer > 0) {
			const interval = setInterval(() => {
				setTimer(prev => prev - 1)
			}, 1000)

			return () => clearInterval(interval)
		}
	}, [timerActive, timer])

	const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(event.target.value)
		setVolume(newVolume)
	}

	const seeVolume = () => {
		setShowVolume(!showVolume)
	}

	const handlePlayerReady = () => {
		if (!lobbyId || isReady) return
		socket?.emit('playerReady', { lobbyId })
		setIsReady(true)
	}

	const handleAnswer = (answer: string) => {
		socket?.emit('submitAnswer', { lobbyId, answer, time: timer })
		setYouChoose(true)
	}

	const getPlayerDetails = (playerId: string) => {
		return players.find(player => player.id === playerId)
	}

	return (
		<>
			<audio ref={audioRef} src={interferenseSFX} preload='auto' />
			<audio ref={cutsceneAudio} src={cutcseneSound} preload='auto' loop />
			<audio ref={goodAudio} src={goodKarma} preload='auto' loop />
			<audio ref={resultsAudio} src={resultsSound} preload='auto' />

			<StaticEffectCanvas interference={interference} />

			<Game
				allReady={allReady}
				isReady={isReady}
				handlePlayerReady={handlePlayerReady}
				readyPlayers={readyPlayers}
				totalPlayers={totalPlayers}
			/>

			<QuestionContainer
				showResults={showResults}
				question={question}
				handleAnswer={handleAnswer}
				youChoose={youChoose}
				timer={timer}
				timerActive={timerActive}
			/>

			<ResultsOverlay
				showResults={showResults}
				results={results}
				countQuestions={countQuestions}
				passedQuestions={passedQuestions}
				scores={scores}
				getPlayerDetails={getPlayerDetails}
				socket={socket}
				gameOver={gameOver}
			/>

			{gameOver && <FinalResults scores={scores} players={players} />}

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
		</>
	)
}

export default GameComponent