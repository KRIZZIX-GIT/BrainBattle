import { Router } from 'express'
import rateLimit from 'express-rate-limit';
import userController from '../controllers/user-controller'
import { upload } from '../middlewares/multer-middleware'
import QuizController from "../controllers/quiz-controller"
import QuestionController from '../controllers/question-controller'

const commentLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 3, 
    message: { message: 'Превышено количество запросов. Подождите не больше минуты.' },
  });
  
  // Лимитер для маршрута `/api/like`
  const likeLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10, 
    message: { message: 'Превышено количество запросов. Подождите не больше минуты.' },
  });

const router = Router()

router.get('/', async (req, res) => {
    res.send(`Hello`);
})
router.get('/checkAuth', userController.checkAuth)
router.get('/quiz/:id', QuizController.quizById)
router.get('/search/:prompt', QuizController.search)
router.get("/quizzes", QuizController.quizzes)
router.get("/getQuestions/:id/questions", QuizController.getQuestionsByCategory)
router.get('/getQuiz/:id', QuestionController.getQuiz)
router.get('/activate/:link', userController.activate)

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/existenceUser', userController.existenceUser)
router.post('/googleAuth', userController.googleAuth)
router.post(
    '/setAvatar', 
    upload.single('avatar'),
    userController.setAvatar
)
router.post('/comment', commentLimiter, QuizController.addComment)
router.post('/like', likeLimiter, QuizController.addLike)
router.post('/translate', QuizController.translate)
router.post('/logout', userController.logout)
router.post(
    '/addQuiz', 
    upload.single('avatar'),
    QuestionController.addQuiz
)

router.patch('/nicknameChange/:userId', userController.nicknameChange)
router.patch('/surnameChange/:userId', userController.surnameChange)
router.patch('/nameChange/:userId', userController.nameChange)

router.delete('/deleteUser', userController.deleteUser)

router.post('/veryfyResetCode', userController.verifyCode);
router.post('/forgotPassword', userController.forgotPassword)
router.post('/changePassword', userController.changePassword)
router.post('/newPassword', userController.newPassword)

export default router