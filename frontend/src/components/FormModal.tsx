import type { FormEvent, ReactNode } from "react";
import { Button, Form, Modal } from "react-bootstrap";

type FormModalProps = {
  children: ReactNode;
  isSubmitting?: boolean;
  onHide: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  show: boolean;
  submitLabel: string;
  title: string;
};

export function FormModal({
  children,
  isSubmitting = false,
  onHide,
  onSubmit,
  show,
  submitLabel,
  title,
}: FormModalProps) {
  return (
    <Modal centered show={show} onHide={onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
