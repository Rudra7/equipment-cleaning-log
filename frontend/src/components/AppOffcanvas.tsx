import type { ReactNode } from "react";
import { Offcanvas } from "react-bootstrap";

type AppOffcanvasProps = {
  children: ReactNode;
  footer?: ReactNode;
  onHide: () => void;
  show: boolean;
  title: string;
};

export function AppOffcanvas({
  children,
  footer,
  onHide,
  show,
  title,
}: AppOffcanvasProps) {
  return (
    <Offcanvas placement="end" show={show} onHide={onHide}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{title}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column gap-3">
        <div>{children}</div>
        {footer ? <div className="mt-auto border-top pt-3">{footer}</div> : null}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
