import { FormEvent, useId, useMemo, useRef, useState } from "react"
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
import { Event } from "../context/Events"
import { EVENT_COLORS, useEvents } from "../context/useEvent"
import { OverflowContainer } from "./OverflowContainer"

type CalendarDayProps = {
  day: Date
  showWeekName: boolean
  selectedMonth: Date
  events: Event[]
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
      <EventFormModal
        event={event}
        onSubmit={(e) => {
          updateEvent(event.id, e)
        }}
      />
    </div>
  )
}

const CalendarDay = ({
  day,
  showWeekName,
  selectedMonth,
  events,
}: CalendarDayProps) => {
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [isViewMoreEventsModalOpen, setIsViewMoreEventsModalOpen] =
    useState(false)

  const { addEvent } = useEvents()

  const sortedEvents = useMemo(() => {
    const timeToNumber = (time: string) => parseFloat(time.replace(":", "."))

    return [...events].sort((a, b) => {
      if (a.allDay && b.allDay) {
        return 0
      } else if (a.allDay) {
        return -1
      } else if (b.allDay) {
        return 1
      } else {
        return timeToNumber(a.startTime) - timeToNumber(b.startTime)
      }
    })
  }, [events])

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
      {sortedEvents.length > 0 && <OverflowContainer />}
      <EventFormModal
        date={day}
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onSubmit={addEvent}
      />
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

const EventFormModal = ({
  onSubmit,
  event,
  date,
  ...modalProps
}: EventFormModalProps) => {
  const isNew = event === null
  const formId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)
  const [isAllDayChecked, setIsAllDayChecked] = useState(event?.allDay || false)
  const [selectedColor, setSelectedColor] = useState(
    event?.color || EVENT_COLORS[0]
  )
  const [startTime, setStartTime] = useState(event?.startTime || "")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const name = nameRef.current?.value
    const endTime = endTimeRef.current?.value

    if (name == null || name === "") return

    const commonProps = {
      name,
      date: date || event?.date,
      color: selectedColor,
    }

    let newEvent: UnionOmit<Event, "id">

    if (isAllDayChecked) {
      newEvent = {
        ...commonProps,
        allDay: true,
      }
    } else {
      if (
        startTime == null ||
        startTime === "" ||
        endTime == null ||
        endTime === ""
      ) {
        return
      } else {
        newEvent = {
          ...commonProps,
          allDay: false,
          startTime,
          endTime,
        }
      }
    }

    modalProps.onClose()
    onSubmit(newEvent)
  }

  return (
    <Modal {...modalProps}>
      <div className="modal-title">
        <div>{isNew ? "Add" : "Edit"} Event</div>
        <small>{formatDate(date || event?.date, { dateStyle: "short" })}</small>
        <button className="close-btn" onClick={modalProps.onClose}>
          &times;
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`${formId}-name`}>Name</label>
          <input
            type="text"
            id={`${formId}-name`}
            ref={nameRef}
            defaultValue={event?.name}
          />
        </div>
        <div className="form-group checkbox">
          <input
            checked={isAllDayChecked}
            type="checkbox"
            id={`${formId}-all-day`}
            onClick={(e) => setIsAllDayChecked(e.target.checked)}
          />
          <label htmlFor={`${formId}-all-day`}>All Day?</label>
        </div>
        <div className="row">
          <div className="form-group">
            <label htmlFor="start-time">Start Time</label>
            <input type="time" name="start-time" id="start-time" />
          </div>
          <div className="form-group">
            <label htmlFor="end-time">End Time</label>
            <input type="time" name="end-time" id="end-time" />
          </div>
        </div>
        <div className="form-group">
          <label>Color</label>
          <div className="row left">
            <input
              type="radio"
              name="color"
              value="blue"
              id="blue"
              checked
              className="color-radio"
            />
            <label htmlFor="blue">
              <span className="sr-only">Blue</span>
            </label>
            <input
              type="radio"
              name="color"
              value="red"
              id="red"
              className="color-radio"
            />
            <label htmlFor="red">
              <span className="sr-only">Red</span>
            </label>
            <input
              type="radio"
              name="color"
              value="green"
              id="green"
              className="color-radio"
            />
            <label htmlFor="green">
              <span className="sr-only">Green</span>
            </label>
          </div>
        </div>
        <div className="row">
          <button className="btn btn-success" type="submit">
            Add
          </button>
          <button className="btn btn-delete" type="button">
            Delete
          </button>
        </div>
      </form>
    </Modal>
  )
}
