import { useState } from 'react'
import { SUBJECTS, DAYS, PERIODS, ACTIVITIES, WEEK_DAYS } from '../data.js'
import './SetupScreen.css'

function SetupScreen({ mode, onModeChange, onStartSubjects, onStartWeekly }) {
  const [schedule, setSchedule] = useState({
    monday: Array(6).fill(null),
    tuesday: Array(6).fill(null),
    wednesday: Array(6).fill(null),
    thursday: Array(6).fill(null),
    friday: Array(6).fill(null),
  })
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: null, tuesday: null, wednesday: null,
    thursday: null, friday: null, saturday: null, sunday: null,
  })
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [subMode, setSubMode] = useState('youbi') // 'youbi' | 'yotei' — Activities mode only

  const handleDragStart = (e, subjectId) => {
    e.dataTransfer.setData('subjectId', subjectId)
    e.dataTransfer.effectAllowed = 'copy'
  }
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }
  const handleDrop = (e, dayId, periodIndex) => {
    e.preventDefault()
    const subjectId = e.dataTransfer.getData('subjectId')
    if (!subjectId) return
    setSchedule(prev => {
      const next = { ...prev }
      const day = [...next[dayId]]
      day[periodIndex] = subjectId
      next[dayId] = day
      return next
    })
  }
  const handleSlotClick = (dayId, periodIndex) => {
    if (selectedSubject) {
      setSchedule(prev => {
        const next = { ...prev }
        const day = [...next[dayId]]
        day[periodIndex] = selectedSubject
        next[dayId] = day
        return next
      })
    } else if (schedule[dayId][periodIndex]) {
      setSchedule(prev => {
        const next = { ...prev }
        const day = [...next[dayId]]
        day[periodIndex] = null
        next[dayId] = day
        return next
      })
    }
  }

  const handleActivityDragStart = (e, activityId) => {
    e.dataTransfer.setData('activityId', activityId)
    e.dataTransfer.effectAllowed = 'copy'
  }
  const handleActivityDrop = (e, dayId) => {
    e.preventDefault()
    const activityId = e.dataTransfer.getData('activityId')
    if (!activityId) return
    setWeeklySchedule(prev => ({ ...prev, [dayId]: activityId }))
  }
  const handleDaySlotClick = (dayId) => {
    if (selectedActivity) {
      setWeeklySchedule(prev => ({ ...prev, [dayId]: selectedActivity }))
    } else if (weeklySchedule[dayId]) {
      setWeeklySchedule(prev => ({ ...prev, [dayId]: null }))
    }
  }

  const getSubject = (id) => SUBJECTS.find(s => s.id === id)
  const getActivity = (id) => ACTIVITIES.find(a => a.id === id)

  const canStartSubjects = DAYS.some(d => schedule[d.id].some(s => s !== null))
  const canStartWeekly = WEEK_DAYS.every(d => weeklySchedule[d.id] !== null)

  return (
    <div className="setup-screen">
      <div className="setup-topbar">
        <div className="setup-breadcrumb">
          <a className="bc-home" href="https://dmnfang.github.io">Home</a>
          <span className="bc-sep">›</span>
          <a className="bc-mid" href="https://dmnfang.github.io/quiz-hub/">Quiz Hub</a>
          <span className="bc-sep">›</span>
          <span className="bc-current">Schedule Quiz</span>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'subjects' ? 'active' : ''}`}
            onClick={() => onModeChange('subjects')}
          >
            Subjects
          </button>
          <button
            className={`mode-btn ${mode === 'activities' ? 'active' : ''}`}
            onClick={() => onModeChange('activities')}
          >
            Activities
          </button>
        </div>

        {mode === 'activities' && (
          <div className="submode-toggle">
            <button
              className={`submode-btn ${subMode === 'youbi' ? 'active' : ''}`}
              onClick={() => setSubMode('youbi')}
            >
              Days
            </button>
            <button
              className={`submode-btn ${subMode === 'yotei' ? 'active' : ''}`}
              onClick={() => setSubMode('yotei')}
            >
              Plans
            </button>
          </div>
        )}

        <button
          className="start-btn"
          disabled={mode === 'subjects' ? !canStartSubjects : !canStartWeekly}
          onClick={() => mode === 'subjects' ? onStartSubjects(schedule) : onStartWeekly(weeklySchedule, subMode)}
        >
          Start Quiz
        </button>
      </div>

      <div className="setup-body">
        {mode === 'subjects' ? (
          <>
            <div className="schedule-grid">
              <div className="grid-corner" />
              {DAYS.map(day => (
                <div key={day.id} className="grid-day-header">
                  <div className="grid-day-en">{day.en}</div>
                  <div className="grid-day-kanji">{day.kanji}</div>
                </div>
              ))}
              {PERIODS.map((period, pi) => (
                <>
                  <div key={`label-${period}`} className="grid-period-label">
                    <span>{period}</span>
                  </div>
                  {DAYS.map(day => {
                    const subjectId = schedule[day.id][pi]
                    const subject = subjectId ? getSubject(subjectId) : null
                    return (
                      <div
                        key={`${day.id}-${pi}`}
                        className={`grid-slot ${subject ? 'filled' : ''} ${selectedSubject && !subject ? 'paintable' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, day.id, pi)}
                        onClick={() => handleSlotClick(day.id, pi)}
                      >
                        {subject && (
                          <div
                            className="slot-subject"
                            style={{ background: subject.color, color: subject.textColor }}
                          >
                            <span className="slot-kanji">{subject.kanji}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>

            <div className="subject-palette">
              <div className="palette-title">
                {selectedSubject
                  ? `${getSubject(selectedSubject)?.kanji} selected — tap slots to fill`
                  : 'Tap a subject then tap slots, or drag and drop'}
              </div>
              <div className="palette-grid">
                {SUBJECTS.map(subject => (
                  <div
                    key={subject.id}
                    className={`palette-subject ${selectedSubject === subject.id ? 'selected' : ''}`}
                    style={{ background: subject.color, color: subject.textColor }}
                    draggable
                    onDragStart={e => handleDragStart(e, subject.id)}
                    onClick={() => setSelectedSubject(prev => prev === subject.id ? null : subject.id)}
                  >
                    <span className="palette-kanji">{subject.kanji}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="weekly-grid">
              {WEEK_DAYS.map(day => {
                const activityId = weeklySchedule[day.id]
                const activity = activityId ? getActivity(activityId) : null
                return (
                  <div key={day.id} className="weekly-day-col">
                    <div className="weekly-day-header">
                      <div className="weekly-day-en">{day.en}</div>
                      <div className="weekly-day-kanji">{day.kanji}</div>
                    </div>
                    <div
                      className={`weekly-slot ${activity ? 'filled' : ''} ${selectedActivity && !activity ? 'paintable' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={e => handleActivityDrop(e, day.id)}
                      onClick={() => handleDaySlotClick(day.id)}
                    >
                      {activity ? (
                        <div className="weekly-slot-content">
                          {activity.image && (
                            <img src={activity.image} alt={activity.en} />
                          )}
                          <span className="weekly-slot-text">{activity.sentence}</span>
                        </div>
                      ) : (
                        <span className="weekly-slot-empty">+</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="activity-palette">
              <div className="palette-title">
                {selectedActivity
                  ? `${getActivity(selectedActivity)?.en} selected — tap days to fill`
                  : 'Tap an activity then tap days, or drag and drop'}
              </div>
              <div className="activity-palette-grid">
                {ACTIVITIES.map(activity => (
                  <div
                    key={activity.id}
                    className={`activity-tile ${selectedActivity === activity.id ? 'selected' : ''}`}
                    draggable
                    onDragStart={e => handleActivityDragStart(e, activity.id)}
                    onClick={() => setSelectedActivity(prev => prev === activity.id ? null : activity.id)}
                  >
                    {activity.image
                      ? <img src={activity.image} alt={activity.en} />
                      : <span className="activity-tile-text">{activity.en}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SetupScreen