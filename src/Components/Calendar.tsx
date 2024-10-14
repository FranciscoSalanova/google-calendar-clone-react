import { useState } from "react"
import { formatDate } from "../utils/formatDate"

export const Calendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  return (
    <div className="calendar">
      <div className="header">
        <button className="btn" onClick={() => setSelectedMonth(new Date())}>
          Today
        </button>
        <div>
          <button className="month-change-btn">&lt;</button>
          <button className="month-change-btn">&gt;</button>
        </div>
        <span className="month-title">
          {formatDate(selectedMonth, { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="days"></div>
    </div>
  )
}
