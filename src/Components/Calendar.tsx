import { useId, useMemo, useState } from "react"
import { formatDate } from "../utils/formatDate"
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isBefore,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { cc } from "../utils/cc"
import { Modal, type ModalProps } from "./Modal"
import type { UnionOmit } from "../utils/types"

type CalendarDayProps = {
  day: Date
  showWeekName: boolean
  selectedMonth: Date
}

type EventFormModalProps = {
  onSubmit: (event: UnionOmit<Event, "id">) => void
} & (
  | { onDelete: () => void; event: Event; date?: never }
  | { onDelete?: never; event?: never; date: Date }
) &
  Omit<ModalProps, "children">

export const Calendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const calendarDays = useMemo(() => {
    const firstWeekStart = startOfWeek(startOfMonth(selectedMonth))
    const lastWeekEnd = endOfWeek(endOfMonth(selectedMonth))

    return eachDayOfInterval({ start: firstWeekStart, end: lastWeekEnd })
  }, [selectedMonth])

  return (
    <div className="calendar">
      <div className="header">
        <button className="btn" onClick={() => setSelectedMonth(new Date())}>
          Today
        </button>
        <div>
          <button
            className="month-change-btn"
            onClick={() => setSelectedMonth((m) => subMonths(m, 1))}
          >
            &lt;
          </button>
          <button
            className="month-change-btn"
            onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
          >
            &gt;
          </button>
        </div>
        <span className="month-title">
          {formatDate(selectedMonth, { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="days">
        {calendarDays.map((day, index) => {
          return (
            <CalendarDay
              key={day.getTime()}
              day={day}
              showWeekName={index < 7}
              selectedMonth={selectedMonth}
            />
          )
        })}
      </div>
      <EventFormModal />
    </div>
  )
}

const CalendarDay = ({
  day,
  showWeekName,
  selectedMonth,
}: CalendarDayProps) => {
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [isViewMoreEventsModalOpen, setIsViewMoreEventsModalOpen] =
    useState(false)

  return (
    <div
      className={cc(
        "day",
        !isSameMonth(day, selectedMonth) && "non-month-day",
        isBefore(endOfDay(day), new Date()) && "old-month-day"
      )}
    >
      <div className="day-header">
        {showWeekName && (
          <div className="week-name">
            {formatDate(day, { weekday: "short" })}
          </div>
        )}
        <div className={cc("day-number", isToday(day) && "today")}>
          {formatDate(day, { day: "numeric" })}
        </div>
        <button
          className="add-event-btn"
          onClick={() => setIsNewEventModalOpen(true)}
        >
          +
        </button>
      </div>
    </div>
  )
}

const CalendarEvent = () => {
  return (
    <div className="events">
      <button className="all-day-event blue event">
        <div className="event-name">Short</div>
      </button>
      <button className="all-day-event green event">
        <div className="event-name">Long Event Name That Just Keeps Going</div>
      </button>
      <button className="event">
        <div className="color-dot blue"></div>
        <div className="event-time">7am</div>
        <div className="event-name">Event Name</div>
      </button>
    </div>
  )
}

const EventFormModal = ({ event }: EventFormModalProps) => {
  const isNew = event === null
  const formId = useId()

  return <Modal />
}
