import { useState } from 'react'
import SetupScreen from './screens/SetupScreen'
import QuizScreen from './screens/QuizScreen'
import WeeklyQuizScreen from './screens/WeeklyQuizScreen'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function App() {
  const [screen, setScreen] = useState('setup')
  const [mode, setMode] = useState('subjects') // 'subjects' | 'activities'

  // Subjects-mode schedule — lifted so it survives setup <-> quiz navigation
  const [schedule, setSchedule] = useState({
    monday: Array(6).fill(null),
    tuesday: Array(6).fill(null),
    wednesday: Array(6).fill(null),
    thursday: Array(6).fill(null),
    friday: Array(6).fill(null),
  })
  const [quizOrder, setQuizOrder] = useState([])

  // Activities-mode schedule — lifted so it survives setup <-> quiz navigation
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: null, tuesday: null, wednesday: null,
    thursday: null, friday: null, saturday: null, sunday: null,
  })
  const [weeklyQuizOrder, setWeeklyQuizOrder] = useState([])
  const [weeklySubMode, setWeeklySubMode] = useState('youbi') // 'youbi' | 'yotei'

  const handleStartSubjectsQuiz = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    setQuizOrder(shuffle(days))
    setScreen('quiz')
  }

  const handleStartWeeklyQuiz = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    setWeeklyQuizOrder(shuffle(days))
    setScreen('weeklyquiz')
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {screen === 'setup' && (
        <SetupScreen
          mode={mode}
          onModeChange={setMode}
          schedule={schedule}
          setSchedule={setSchedule}
          weeklySchedule={weeklySchedule}
          setWeeklySchedule={setWeeklySchedule}
          subMode={weeklySubMode}
          setSubMode={setWeeklySubMode}
          onStartSubjects={handleStartSubjectsQuiz}
          onStartWeekly={handleStartWeeklyQuiz}
        />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          schedule={schedule}
          quizOrder={quizOrder}
          onBack={() => setScreen('setup')}
        />
      )}
      {screen === 'weeklyquiz' && (
        <WeeklyQuizScreen
          schedule={weeklySchedule}
          quizOrder={weeklyQuizOrder}
          subMode={weeklySubMode}
          onBack={() => setScreen('setup')}
        />
      )}
    </div>
  )
}

export default App