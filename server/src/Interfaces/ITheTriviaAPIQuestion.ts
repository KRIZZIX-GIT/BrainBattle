export default interface TheTriviaAPIQuestion {
    question: string; // Вопрос
    correctAnswer: string; // Правильный ответ
    incorrectAnswers: string[]; // Массив с неправильными ответами
}