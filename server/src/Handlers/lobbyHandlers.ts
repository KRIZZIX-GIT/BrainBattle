import { Socket, Server } from 'socket.io'
import Lobby from '../models/lobby-model'
import userModel from '../models/user-model'
import { QuizModel } from '../models/quiz-model'
import QuestionModel from '../models/question-model'
import axios from "axios"
import OpenTDBQuestion from 'Interfaces/IOpenTDBQuestion'
import QuizAPIQuestion from 'Interfaces/IQuizAPIQuestion'
import TheTriviaAPIQuestion from 'Interfaces/ITheTriviaAPIQuestion'
import { Types } from 'mongoose'

export class LobbyManager {
  private io: Server
  private readyPlayersMap: { [key: string]: number } = {}
  private questionIndexMap: { [key: string]: number } = {}
  private scoresMap: { [key: string]: { [playerId: string]: number } } = {}
  private playerAnswersMap: { [key: string]: { [playerId: string]: boolean } } = {}

  constructor(io: Server) {
    this.io = io
  }

  public async startGame(socket: Socket, { lobbyId }: { lobbyId: string }) {
    try {
      const lobby = await Lobby.findOne({ friendCode: lobbyId })
      if (!lobby) throw new Error("Лобби не найдено")

      this.questionIndexMap[lobbyId] = 0
      this.scoresMap[lobbyId] = {}
      this.playerAnswersMap[lobbyId] = {}
      this.io.to(lobbyId).emit('gameStart', 'Игра начинается!') 
      if (!lobby.questions || lobby.questions.length === 0) {
        const result = await this.fetchQuestionsByCategory(lobby.quizId.toString())

        if (!result.success) {
            console.error(result.message)
            throw new Error(result.message)
        }

        await lobby.save()
      }
    } catch (error) {
      console.error("Error starting game:", error)
      this.io.to(lobbyId).emit("error", { message: "Ошибка старта игры" })
    }
  }

  private prepareQuestion(question: any) {
    const answers = [...question.incorrectAnswers, question.correctAnswer]
    return {
      question: question.question,
      answers: answers.sort(() => Math.random() - 0.5), 
    }
  }

  public async submitAnswer(socket: Socket, { lobbyId, answer, time }: { lobbyId: string, answer: string, time: number }) {
    try {
      const playerId = socket.id
      const lobby = await Lobby.findOne({ friendCode: lobbyId })
      if (!lobby) throw new Error("Лобби не найдено")

      const currentQuestionIndex = this.questionIndexMap[lobbyId]
      const question = lobby.questions[currentQuestionIndex]
      const isCorrect = answer === question.correctAnswer

      this.playerAnswersMap[lobbyId][playerId] = isCorrect

      if (!this.scoresMap[lobbyId][playerId]) this.scoresMap[lobbyId][playerId] = 0
      const score = isCorrect ? Math.round(1000 / 40 * time) : 0
      this.scoresMap[lobbyId][playerId] += score

      const totalPlayers = this.io.sockets.adapter.rooms.get(lobbyId)?.size || 0
      const answeredPlayers = Object.keys(this.playerAnswersMap[lobbyId]).length
      console.log(this.playerAnswersMap[lobbyId])

      if (answeredPlayers === totalPlayers) {
        this.io.to(lobbyId).emit("questionResult", {
          results: this.playerAnswersMap[lobbyId],
          scores: this.scoresMap[lobbyId],
        })
        this.playerAnswersMap[lobbyId] = {}
        setTimeout(() => this.nextQuestion(lobbyId), 10000)
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      this.io.to(lobbyId).emit("error", { message: "Ошибка отправки ответа" })
    }
  }

  private async nextQuestion(lobbyId: string) {
    try {
        const lobby = await Lobby.findOne({ friendCode: lobbyId })
        if (!lobby) return

        // Проверяем, есть ли активные игроки
        if (lobby.players.length === 0) {
            console.log(`No players left in lobby ${lobbyId}. Ending game.`)
            this.io.to(lobbyId).emit("gameOver", { message: "Все игроки вышли из лобби. Игра завершена." })
            await Lobby.deleteOne({ friendCode: lobbyId })
            return
        }

        const nextIndex = ++this.questionIndexMap[lobbyId]
        console.log(nextIndex)

        if (nextIndex >= lobby.questions.length) {
            const finalScores = this.scoresMap[lobbyId]

            const players = Object.keys(finalScores)
            for (const playerId of players) {
                const userId = lobby.players.find((player: any) => player.id === playerId)?.MongoId
                if (!userId) continue

                const user = await userModel.findOne({ _id: userId })
                if (!user) continue

                const quiz = await QuizModel.findOne({ _id: lobby.quizId })
                if (!quiz) continue

                const finalScore = finalScores[playerId]

                if (!user.leaderboard) {
                    user.leaderboard = []
                }

                const userLeaderboardEntry = user.leaderboard.find(
                    (entry) => entry.quizId.toString() === quiz._id.toString()
                )
                if (userLeaderboardEntry) {
                    userLeaderboardEntry.score = Math.max(userLeaderboardEntry.score, finalScore)
                } else {
                    user.leaderboard.push({
                        _id: new Types.ObjectId(),
                        quiz_name: quiz.quiz_name,
                        quizId: quiz._id,
                        score: finalScore,
                    } as any) 
                }
                await user.save()

                if (!quiz.leaderboard) {
                    quiz.leaderboard = []
                }

                const quizLeaderboardEntry = quiz.leaderboard.find(
                    (entry) => entry.userId.toString() === user._id.toString()
                )
                if (quizLeaderboardEntry) {
                    quizLeaderboardEntry.score = Math.max(quizLeaderboardEntry.score, finalScore)
                } else {
                    quiz.leaderboard.push({
                        _id: new Types.ObjectId(),
                        userId: user._id,
                        username: user.username,
                        avatar: user.avatar ?? null,
                        score: finalScore,
                    } as any)
                }
                await quiz.save()
            }

            this.io.to(lobbyId).emit("gameOver", { scores: finalScores })
            return
        }

        this.io.to(lobbyId).emit("nextQuestion", this.prepareQuestion(lobby.questions[nextIndex]))
    } catch (error) {
        console.error("Error in nextQuestion:", error)
        this.io.to(lobbyId).emit("error", { message: "Ошибка обработки следующего вопроса" })
    }
}
  
  public async playerReady(socket: Socket, { lobbyId }: { lobbyId: string }) {
    try {
      if (this.readyPlayersMap[lobbyId] === undefined) {
        this.readyPlayersMap[lobbyId] = 0
      }
  
      this.readyPlayersMap[lobbyId] += 1
      const readyPlayers = this.readyPlayersMap[lobbyId]
  
      console.log(`${readyPlayers} из игроков готовы в лобби ${lobbyId}`)
  
      const clientsInRoom = this.io.sockets.adapter.rooms.get(lobbyId) || new Set()
      const totalPlayers = clientsInRoom.size
  
      this.io.to(lobbyId).emit('waitingForPlayers', readyPlayers, totalPlayers)
      console.log(readyPlayers, totalPlayers)
  
      if (readyPlayers === totalPlayers) {
        console.log('Все игроки готовы, начинаем игру!')
        const lobby = await Lobby.findOne({ friendCode: lobbyId })
        if (!lobby) {
          console.log('Lobby not found')
          this.io.to(lobbyId).emit('error', { message: 'Лобби не найдено' })
          return
        }
        const categoryId = lobby.quizId.toString()
        const result = await this.fetchQuestionsByCategory(categoryId)

        if (!result.success) {
            console.error(result.message)
            throw new Error(result.message)
        }

        const questions = result.questions

        lobby.questions = questions
        await lobby.save()
        this.io.to(lobbyId).emit("nextQuestion", this.prepareQuestion(lobby.questions[0]))
        this.io.to(lobbyId).emit('gameStart', {msg: 'Игра начинается!', allQuestions: lobby.questions.length})
      }
    } catch (error) {
      console.error('Error processing player ready:', error)
      this.io.to(lobbyId).emit('error', { message: 'Внутренняя ошибка сервера' })
    }
  }

  private async fetchQuestionsByCategory(categoryId: string) {
    try {
        const quiz = await QuizModel.findOne({ _id: categoryId })

        if (!quiz) {
            return {
                success: false,
                message: 'Quiz not found',
                questions: []
            }
        }

        let questionsData: any[] = []

        if (quiz.TYPE === 'OpenTDB') {
            const { data } = await axios.get('https://opentdb.com/api.php', {
                params: {
                    amount: 10,
                    category: quiz.category_id,
                    type: 'multiple',
                },
                timeout: 5000
            })

            questionsData = data.results.map((question: any) => ({
                question: question.question,
                hint: question.question,
                correctAnswer: question.correct_answer,
                incorrectAnswers: question.incorrect_answers,
            }))
        }
        // Запрос вопросов из quizapi.io
        else if (quiz.TYPE === 'quizapi') {
            const { data } = await axios.get<QuizAPIQuestion[]>('https://quizapi.io/api/v1/questions', {
                params: {
                    apiKey: process.env.QUIZ_API_KEY!,
                    category: quiz.quiz_name,
                    limit: 10,
                },
                timeout: 5000
            })

            questionsData = data.map((question: any) => {
                const defaultAnswer = "Все варианты ответа неправильны"
                const correctAnswer = question.correct_answer || defaultAnswer

                const answers = { ...question.answers, allWrong: defaultAnswer }

                return {
                    question: question.question,
                    hint: question.description || question.question,
                    correctAnswer: correctAnswer,
                    incorrectAnswers: Object.values(answers)
                        .filter((answer): answer is string => answer !== null && answer !== correctAnswer),
                }
            })
        }
        else if (quiz.TYPE === 'the-trivia-api') {
            const { data } = await axios.get<TheTriviaAPIQuestion[]>('https://the-trivia-api.com/api/questions', {
                params: {
                    amount: 10,
                    category: quiz.category_id,
                },
                timeout: 5000
            })

            questionsData = data.map((question) => ({
                question: question.question,
                hint: question.question,
                correctAnswer: question.correctAnswer,
                incorrectAnswers: question.incorrectAnswers,
            }))
        }
        else if (quiz.TYPE == "Workshop") {
            const questionsWorkshop = await QuestionModel.findOne({ categoryId: quiz._id })

            if (questionsWorkshop && questionsWorkshop.questions) {
                questionsData = questionsWorkshop.questions.map((question: any) => ({
                    question: question.title,
                    hint: question.title,
                    correctAnswer: question.correctAnswer,
                    incorrectAnswers: question.incorrectAnswers,
                }))
            } else {
                console.warn(`No questions found for categoryId: ${quiz._id}`)
            }
        } else {
            return {
                success: false,
                message: 'Unsupported quiz type',
                questions: []
            }
        }

        return {
            success: true,
            questions: questionsData
        }

    } catch (error) {
        console.error('Error fetching questions:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            questions: []
        }
    }
}

  public async createLobby(socket: Socket, { quizId, userId }: { quizId: string, userId: string },
    callback: (response: { success: boolean, createdLobbyId?: string, message?: string }) => void): Promise<void> {
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      callback({ success: false, message: 'User not found.' })
      return
    }

    const quiz = await QuizModel.findById(quizId)
    if (!quiz) {
      callback({ success: false, message: 'Quiz not found.' })
      return
    }

    let friendCode
    let existingLobby
    do {
      friendCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      existingLobby = await Lobby.findOne({ friendCode })
    } while (existingLobby)

    const lobby = new Lobby({
      quizId,
      category: quiz.quiz_name,
      hostId: user._id.toString(),
      friendCode,
      players: [],
      createdAt: new Date(),
      status: 'waiting',
      lastActivity: new Date(),
    })

    await lobby.save()

    socket.join(friendCode)

    this.io.to(friendCode).emit('lobbyUpdated', await this.getLobbyWithUserInfo(friendCode, socket.id))

    callback({ success: true, createdLobbyId: friendCode })
  } catch (error) {
    console.error('Error creating lobby:', error)
    callback({ success: false, message: 'Internal server error.' })
  }
}

public async joinLobby(socket: Socket, { lobbyId, userId }: { lobbyId: string, userId: string }): Promise<void> {
  try {
    const lobby = await Lobby.findOne({ friendCode: lobbyId })
    if (!lobby) {
      socket.emit('lobbyNotFound')
      return
    }

    if (lobby.players.length >= 4) {
      socket.emit('error', { success: false, message: 'В лобби уже достаточно игроков' })
      return
    }

    const existingLobby = await Lobby.findOne({ 'players.MongoId': userId })
    if (existingLobby) {
      await this.leaveLobby(socket, { lobbyId: existingLobby.friendCode })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      socket.emit('error', { success: false, message: 'User not found.' })
      return
    }

    lobby.players.push({
      id: socket.id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      avatar: user.avatar ?? null,
      MongoId: user._id.toString(),
    })

    lobby.lastActivity = new Date()

    await lobby.save()

    socket.join(lobby.friendCode)

    this.io.to(lobby.friendCode).emit('lobbyUpdated', await this.getLobbyWithUserInfo(lobby.friendCode, socket.id))
    socket.emit('joinLobbySuccess', { success: true, lobbyId: lobby.friendCode })

    if (lobby.players.length >= 4) {
      lobby.status = 'active'
      await lobby.save()
    }
  } catch (error) {
    console.error('Error joining lobby:', error)
    socket.emit('error', { success: false, message: 'Internal server error.' })
  }
}
public async leaveLobby(socket: Socket, { lobbyId }: { lobbyId: string }): Promise<void> {
  try {
    const lobby = await Lobby.findOne({ friendCode: lobbyId })
    if (!lobby) {
      return
    }

    lobby.players = lobby.players.filter((player) => player.id !== socket.id)

    if (lobby.players.length === 0) {
      delete this.readyPlayersMap[lobbyId];
      delete this.questionIndexMap[lobbyId];
      delete this.scoresMap[lobbyId];
      delete this.playerAnswersMap[lobbyId];

      const deleted = await Lobby.deleteOne({ friendCode: lobbyId })
      if (deleted.deletedCount > 0) {
        console.log(`Lobby with friendCode ${lobbyId} successfully deleted.`)
      }

      this.io.to(lobbyId).emit('lobbyClosed')

      socket.leave(lobbyId)
      return
    }

    if (lobby.hostId === socket.id) {
      lobby.hostId = lobby.players[0].id
    }

    await lobby.save()

    this.io.to(lobbyId).emit('lobbyUpdated', await this.getLobbyWithUserInfo(lobbyId, socket.id))
    this.io.to(lobbyId).emit('playerLeft', { userId: socket.id })

    socket.leave(lobbyId)
  } catch (error) {
    console.error('Error leaving lobby:', error)
    socket.emit('error', { success: false, message: 'Internal server error.' })
  }
}

  private async getLobbyWithUserInfo(lobbyId: string, socket: string) {
    const lobby = await Lobby.findOne({ friendCode: lobbyId })
      .select("players hostId quizId")
      .lean() 
  
    if (!lobby) {
      return null
    }
    return lobby
  }
}