import { ReactNode } from "react"
import { createPortal } from "react-dom"

export type ModalProps = {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
}

export const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  return createPortal(
    <div className="modal">
      <div className="overlay" onClick={onClose}></div>
      <div className="modal-body">{children}</div>
    </div>,
    document.querySelector("#modal-container") as HTMLElement
  )
}
