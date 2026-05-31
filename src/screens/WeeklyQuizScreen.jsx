import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { ACTIVITIES, WEEK_DAYS } from '../data.js'
import './WeeklyQuizScreen.css'

function WeeklyQuizScreen({ schedule, quizOrder, onBack }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [shaking, setShaking] = useState(false)

  const currentDayId = quizOrder[questionIndex]
  const currentDay = WEEK_DAYS.find(d => d.id === currentDayId)
  const activityId = schedule[currentDayId]
  const activity = ACTIVITIES.find(a => a.id === activityId)

  const handleAnswer = (dayId) => {
    if (answered) return
    if (dayId === currentDayId) {
      setAnswered('correct')
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        scalar: 2,
        shapes: ['square'],
        colors: ['#4A8BAD','#4AA875','#E8443A','#C4A832','#9B7FD4','#F4896B','#5CB8B2','#B86070'],
      })
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { x: 0.1, y: 0.6 },
          scalar: 2,
          shapes: ['square'],
          colors: ['#4A8BAD','#4AA875','#E8443A','#C4A832','#9B7FD4','#F4896B','#5CB8B2','#B86070'],
        })
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { x: 0.9, y: 0.6 },
          scalar: 2,
          shapes: ['square'],
          colors: ['#4A8BAD','#4AA875','#E8443A','#C4A832','#9B7FD4','#F4896B','#5CB8B2','#B86070'],
        })
      }, 300)
    } else {
      setShaking(true)
      setAnswered('wrong')
      setTimeout(() => setShaking(false), 600)
    }
  }

  const handleTryAgain = () => {
    setAnswered(null)
    setShaking(false)
  }

  const handleNext = () => {
    if (questionIndex < quizOrder.length - 1) {
      setQuestionIndex(i => i + 1)
      setAnswered(null)
      setShaking(false)
    }
  }

  const isLast = questionIndex === quizOrder.length - 1

  return (
    <div className={`weekly-quiz-screen ${shaking ? 'shake' : ''}`}>
      <div className="weekly-quiz-body">
        {/* Left — activity display */}
        <div className="weekly-quiz-left">
          <div className="weekly-quiz-today">Today</div>
          <div className="weekly-quiz-image">
            {activity?.image
              ? <img src={activity.image} alt={activity.en} />
              : <div className="weekly-quiz-placeholder">{activity?.en}</div>
            }
          </div>
          <div className="weekly-quiz-sentence">{activity?.sentence}</div>
        </div>

        {/* Right — day buttons */}
        <div className="weekly-quiz-right">
          {answered === 'correct' && (
            <div className="weekly-answer-box">
              <div className="weekly-answer-en">{currentDay.en}</div>
              <div className="weekly-answer-kanji">{currentDay.kanji}曜日</div>
            </div>
          )}
          {answered === 'wrong' && (
            <div className="weekly-wrong-overlay">
              <div className="weekly-wrong-x">✕</div>
              <button className="weekly-try-again-btn" onClick={handleTryAgain}>
                Try Again
              </button>
            </div>
          )}
          {!answered && (
            <div className="weekly-day-buttons">
              {WEEK_DAYS.map(day => (
                <button
                  key={day.id}
                  className="weekly-day-btn"
                  onClick={() => handleAnswer(day.id)}
                >
                  <span className="weekly-day-btn-en">{day.en}</span>
                  <span className="weekly-day-btn-kanji">{day.kanji}曜日</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="weekly-quiz-controls">
        <button className="ctrl-btn" onClick={onBack}>Setup</button>
        {answered === 'correct' && !isLast && (
          <button className="ctrl-btn ctrl-btn-next" onClick={handleNext}>
            Next Question
          </button>
        )}
        {answered === 'correct' && isLast && (
          <button className="ctrl-btn ctrl-btn-next" onClick={onBack}>
            Done
          </button>
        )}
        <div className="weekly-quiz-progress">{questionIndex + 1} / {quizOrder.length}</div>
      </div>
    </div>
  )
}

export default WeeklyQuizScreen