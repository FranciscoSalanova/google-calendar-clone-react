import { createContext } from "react"
import { EVENT_COLORS } from "./useEvent"

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
}

type EventsProviderProps = {
  children: ReactNode
}

export const Context = createContext<EventsContext | null>(null)

export const EventsProvider = ({ children }: EventsProviderProps) => {
  const [events, setEvents] = useLocalStorage("EVENTS", [])

  return <Context.Provider value={events}>{children}</Context.Provider>
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
