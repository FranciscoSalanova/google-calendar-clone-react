import { Key, ReactNode, useLayoutEffect, useRef, useState } from "react"

type OverFlowContainerProps<T> = {
  className?: string
  items: T[]
  renderItem: (item: T) => ReactNode
  renderOverflow: (overflowAmount: number) => ReactNode
  getKey: (item: T) => Key
}

export function OverflowContainer<T>({
  className,
  items,
  renderItem,
  renderOverflow,
  getKey,
}: OverFlowContainerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [overflowAmount, setOverflowAmount] = useState(0)

  useLayoutEffect(() => {
    if (containerRef.current == null) return

    const observer = new ResizeObserver((entries) => {
      const containerElement = entries[0]?.target
      if (containerElement == null) return

      const children =
        containerElement.querySelectorAll<HTMLElement>("[data-item]")
    })
  })

  return (
    <>
      <div className={className} ref={containerRef}>
        {items.map((item) => {
          return (
            <div key={getKey(item)} data-item>
              {renderItem(item)}
            </div>
          )
        })}
      </div>
      <div data-overflow></div>
    </>
  )
}
