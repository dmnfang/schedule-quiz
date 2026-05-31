import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { SUBJECTS, DAYS } from '../data.js'
import './QuizScreen.css'

const WORD_SPEED = 0.8
const REVEAL_INTERVAL = 2000

function QuizScreen({ schedule, quizOrder, onBack }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const [answered, setAnswered] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [words, setWords] = useState([])
  const animFrameRef = useRef(null)
  const wordsRef = useRef([])
  const revealTimerRef = useRef(null)
  const stageRef = useRef(null)

  const currentDayId = quizOrder[questionIndex]
  const currentDay = DAYS.find(d => d.id === currentDayId)
  const subjectIds = schedule[currentDayId].filter(Boolean)
  const subjects = subjectIds.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean)

  const wordList = []
  subjects.forEach(s => {
    wordList.push({ id: `${s.id}-jp`, text: s.kanji, color: s.color, font: 'jp', size: 200 })
    wordList.push({ id: `${s.id}-en`, text: s.en, color: s.color, font: 'en', size: 150 })
  })

  const allRevealed = revealedCount >= wordList.length

  const initWord = (word, stageW, stageH) => ({
    ...word,
    x: Math.random() * (stageW - 400),
    y: Math.random() * (stageH - 200),
    vx: (Math.random() > 0.5 ? 1 : -1) * (WORD_SPEED + Math.random() * 0.5),
    vy: (Math.random() > 0.5 ? 1 : -1) * (WORD_SPEED + Math.random() * 0.5),
    w: word.font === 'jp' ? word.text.length * word.size * 0.9 : word.text.length * word.size * 0.55,
    h: word.size * 1.2,
  })

  const resetQuestion = useCallback(() => {
    clearTimeout(revealTimerRef.current)
    wordsRef.current = []
    setWords([])
    setRevealedCount(0)
    setPaused(false)
    setAnswered(null)
    setShaking(false)
  }, [])

  useEffect(() => {
    resetQuestion()
  }, [questionIndex])

  useEffect(() => {
    if (answered) return
    if (paused) return
    if (revealedCount >= wordList.length) return

    revealTimerRef.current = setTimeout(() => {
      const stage = stageRef.current
      if (!stage) return
      const stageW = stage.clientWidth
      const stageH = stage.clientHeight
      const newWord = initWord(wordList[revealedCount], stageW, stageH)
      wordsRef.current = [...wordsRef.current, newWord]
      setWords([...wordsRef.current])
      setRevealedCount(c => c + 1)
    }, revealedCount === 0 ? 500 : REVEAL_INTERVAL)

    return () => clearTimeout(revealTimerRef.current)
  }, [revealedCount, answered, paused])

  useEffect(() => {
    const animate = () => {
      if (wordsRef.current.length > 0) {
        const stage = stageRef.current
        if (stage) {
          const stageW = stage.clientWidth
          const stageH = stage.clientHeight
          wordsRef.current = wordsRef.current.map(word => {
            let { x, y, vx, vy, w, h } = word
            x += vx
            y += vy
            if (x <= 0 || x + w >= stageW) { vx = -vx; x = Math.max(0, Math.min(x, stageW - w)) }
            if (y <= 0 || y + h >= stageH) { vy = -vy; y = Math.max(0, Math.min(y, stageH - h)) }
            return { ...word, x, y, vx, vy }
          })
          setWords([...wordsRef.current])
        }
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const handlePause = () => {
    if (allRevealed) return
    setPaused(p => !p)
  }

  const handleAnswer = (dayId) => {
    if (answered) return
    if (dayId === currentDayId) {
      clearTimeout(revealTimerRef.current)
      setAnswered('correct')
      const stage = stageRef.current
      if (stage) {
        const stageW = stage.clientWidth
        const stageH = stage.clientHeight
        const remaining = wordList.slice(wordsRef.current.length)
        const newWords = remaining.map(w => initWord(w, stageW, stageH))
        wordsRef.current = [...wordsRef.current, ...newWords]
        setWords([...wordsRef.current])
      }
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
    }
  }

  const isLast = questionIndex === quizOrder.length - 1

  return (
    <div className={`quiz-screen ${shaking ? 'shake' : ''}`}>
      <div className="quiz-stage" ref={stageRef}>
        {words.map(word => (
          <div
            key={word.id}
            className={`bouncing-word ${word.font === 'jp' ? 'word-jp' : 'word-en'}`}
            style={{
              left: word.x,
              top: word.y,
              color: word.color,
              fontSize: word.size,
            }}
          >
            {word.text}
          </div>
        ))}

        {answered === 'correct' && (
          <div className="answer-overlay">
            <div className="answer-box">
              <div className="answer-day-en">{currentDay.en}</div>
              <div className="answer-day-kanji">{currentDay.kanji}</div>
            </div>
          </div>
        )}

        {answered === 'wrong' && (
          <div className="wrong-overlay">
            <div className="wrong-x">✕</div>
            <button className="try-again-btn" onClick={handleTryAgain}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {!answered && (
        <div className="day-buttons">
          {DAYS.map(day => (
            <button
              key={day.id}
              className="day-btn"
              onClick={() => handleAnswer(day.id)}
            >
              <span className="day-btn-en">{day.en}</span>
              <span className="day-btn-kanji">{day.kanji}</span>
            </button>
          ))}
        </div>
      )}

      <div className="quiz-controls">
        <button className="ctrl-btn" onClick={onBack}>Setup</button>
        {!answered && (
          <button
            className="ctrl-btn ctrl-btn-pause"
            onClick={handlePause}
            disabled={allRevealed}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}
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
        <div className="quiz-progress">{questionIndex + 1} / {quizOrder.length}</div>
      </div>
    </div>
  )
}

export default QuizScreen