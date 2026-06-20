import { useState } from 'react'
import confetti from 'canvas-confetti'
import { ACTIVITIES, WEEK_DAYS } from '../data.js'
import './WeeklyQuizScreen.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fireConfetti() {
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
      particleCount: 100, spread: 120, origin: { x: 0.1, y: 0.6 }, scalar: 2,
      shapes: ['square'],
      colors: ['#4A8BAD','#4AA875','#E8443A','#C4A832','#9B7FD4','#F4896B','#5CB8B2','#B86070'],
    })
    confetti({
      particleCount: 100, spread: 120, origin: { x: 0.9, y: 0.6 }, scalar: 2,
      shapes: ['square'],
      colors: ['#4A8BAD','#4AA875','#E8443A','#C4A832','#9B7FD4','#F4896B','#5CB8B2','#B86070'],
    })
  }, 300)
}

function buildActivityChoices(schedule, quizOrder, currentDayId) {
  const correctActivityId = schedule[currentDayId]
  const otherIds = quizOrder
    .map(d => schedule[d])
    .filter(id => id && id !== correctActivityId)
  const pool = [...new Set(otherIds)].length >= 3
    ? [...new Set(otherIds)]
    : ACTIVITIES.filter(a => a.id !== correctActivityId).map(a => a.id)
  const distractors = shuffle(pool).slice(0, 3)
  return shuffle([correctActivityId, ...distractors])
}

function WeeklyQuizScreen({ schedule, quizOrder, subMode, onBack }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [choices, setChoices] = useState(() =>
    buildActivityChoices(schedule, quizOrder, quizOrder[0])
  )

  const currentDayId = quizOrder[questionIndex]
  const currentDay = WEEK_DAYS.find(d => d.id === currentDayId)
  const activityId = schedule[currentDayId]
  const activity = ACTIVITIES.find(a => a.id === activityId)
  const isLast = questionIndex === quizOrder.length - 1

  const handleDayAnswer = (dayId) => {
    if (answered) return
    if (dayId === currentDayId) {
      setAnswered('correct')
      fireConfetti()
    } else {
      setShaking(true)
      setAnswered('wrong')
      setTimeout(() => setShaking(false), 600)
    }
  }

  const handleActivityAnswer = (tappedActivityId) => {
    if (answered) return
    if (tappedActivityId === activityId) {
      setAnswered('correct')
      fireConfetti()
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
      const next = questionIndex + 1
      setQuestionIndex(next)
      setAnswered(null)
      setShaking(false)
      setChoices(buildActivityChoices(schedule, quizOrder, quizOrder[next]))
    }
  }

  return (
    <div className={`weekly-quiz-screen ${shaking ? 'shake' : ''}`}>
      {subMode === 'youbi' ? (
        <div className="weekly-quiz-body">
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
                    onClick={() => handleDayAnswer(day.id)}
                  >
                    <span className="weekly-day-btn-en">{day.en}</span>
                    <span className="weekly-day-btn-kanji">{day.kanji}曜日</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="weekly-quiz-body">
          <div className="weekly-quiz-left">
            <div className="weekly-quiz-today">{currentDay?.kanji}曜日</div>
            <div className="yotei-sentence">
              <div className="yotei-line">
                <span>I</span>
                <span className={`yotei-blank ${answered === 'correct' ? 'filled' : ''}`}>
                  {answered === 'correct' ? activity?.en : '...'}
                </span>
              </div>
              <div className="yotei-line">
                <span>on {currentDay?.en}s.</span>
              </div>
            </div>
          </div>

          <div className="weekly-quiz-right">
            {answered === 'wrong' && (
              <div className="weekly-wrong-overlay">
                <div className="weekly-wrong-x">✕</div>
                <button className="weekly-try-again-btn" onClick={handleTryAgain}>
                  Try Again
                </button>
              </div>
            )}
            {answered !== 'wrong' && (
              <div className="yotei-activity-grid">
                {choices.map(choiceId => {
                  const choiceActivity = ACTIVITIES.find(a => a.id === choiceId)
                  const isCorrectAndAnswered = answered === 'correct' && choiceId === activityId
                  const isDimmed = answered === 'correct' && choiceId !== activityId
                  return (
                    <button
                      key={choiceId}
                      className={`yotei-activity-btn ${isCorrectAndAnswered ? 'correct' : ''} ${isDimmed ? 'dimmed' : ''}`}
                      onClick={() => handleActivityAnswer(choiceId)}
                      disabled={!!answered}
                    >
                      {choiceActivity?.image
                        ? <img src={choiceActivity.image} alt="" />
                        : <span className="yotei-activity-fallback">{choiceActivity?.en}</span>
                      }
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

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