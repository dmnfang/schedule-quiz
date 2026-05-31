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
  const [schedule, setSchedule] = useState({})
  const [quizOrder, setQuizOrder] = useState([])
  const [weeklySchedule, setWeeklySchedule] = useState({})
  const [weeklyQuizOrder, setWeeklyQuizOrder] = useState([])

  const handleStartSubjectsQuiz = (sched) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    setSchedule(sched)
    setQuizOrder(shuffle(days))
    setScreen('quiz')
  }

  const handleStartWeeklyQuiz = (sched) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    setWeeklySchedule(sched)
    setWeeklyQuizOrder(shuffle(days))
    setScreen('weeklyquiz')
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {screen === 'setup' && (
        <SetupScreen
          mode={mode}
          onModeChange={setMode}
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
          onBack={() => setScreen('setup')}
        />
      )}
    </div>
  )
}

export default App