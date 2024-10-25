import { createContext, ReactNode, useEffect, useState } from "react"
import { EVENT_COLORS } from "./useEvent"
import { UnionOmit } from "../utils/types"

export type Event = {
  id: string
  name: string
  color: (typeof EVENT_COLORS)[number]
  date: Date
} & (
  | { allDay: false; startTime: string; endTime: string }
  | { allDay: true; startTime?: never; endTime?: never }
)

type EventsContext = {
  events: Event[]
  addEvent: (event: UnionOmit<Event, "id">) => void
  updateEvent: (id: string, eventDetails: UnionOmit<Event, "id">) => void
  deleteEvent: (id: string) => void
}

type EventsProviderProps = {
  children: ReactNode
}

export const Context = createContext<EventsContext | null>(null)

export const EventsProvider = ({ children }: EventsProviderProps) => {
  const [events, setEvents] = useLocalStorage("EVENTS", [])

  const addEvent = (eventDetails: UnionOmit<Event, "id">) => {
    setEvents((e) => [...e, { ...eventDetails, id: crypto.randomUUID() }])
  }

  const updateEvent = (id: string, eventDetails: UnionOmit<Event, "id">) => {
    setEvents((e) => {
      return e.map((event) => {
        return event.id === id ? { id, ...eventDetails } : event
      })
    })
  }

  const deleteEvent = (id: string) => {
    setEvents((e) => e.filter((event) => event.id !== id))
  }

  return (
    <Context.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </Context.Provider>
  )
}

const useLocalStorage = (key: string, initialValue: Event[]) => {
  const [value, setValue] = useState<Event[]>(() => {
    const jsonValue = localStorage.getItem(key)
    if (jsonValue == null) return initialValue

    return (JSON.parse(jsonValue) as Event[]).map((event) => {
      if (event.date instanceof Date) return event

      return { ...event, date: new Date(event.date) }
    })
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [value, key])

  return [value, setValue] as const
}
