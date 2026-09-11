import { useState, type FormEvent } from "react";
import {
  Link,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  createCleaningRecord,
  getAuditHistory,
  updateCleaningRecord,
  type AuditEntry,
  type CleaningRecord,
  type CleaningRecordInput,
  type CleaningRecordStatus,
} from "../api/cleaning-record";
import { AppOffcanvas } from "../components/AppOffcanvas";
import { DataTable, type TableColumn } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { PaginationControls } from "../components/PaginationControls";
import type { CleaningRecordsLoaderData } from "../api/cleaning-record";

const pageSize = 20;
const emptyForm: CleaningRecordInput = {
  cleanedBy: "",
  cleanedAt: "",
  method: "",
  notes: null,
  status: "pending",
};

export default function EquipmentCleaningRecordsPage() {
  const { equipment, records } = useLoaderData() as CleaningRecordsLoaderData;
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRecord, setEditingRecord] = useState<CleaningRecord | null>();
  const [formValues, setFormValues] = useState<CleaningRecordInput>(emptyForm);
  const [auditRecord, setAuditRecord] = useState<CleaningRecord | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: TableColumn<CleaningRecord>[] = [
    { header: "Cleaned by", render: (item) => item.cleanedBy },
    {
      header: "Cleaned at",
      render: (item) => formatDateTime(item.cleanedAt),
    },
    { header: "Method", render: (item) => item.method },
    {
      header: "Status",
      render: (item) => (
        <Badge bg={item.status === "verified" ? "success" : "warning"} text={item.status === "pending" ? "dark" : undefined}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Notes",
      render: (item) => item.notes || <span className="text-body-secondary">—</span>,
    },
    {
      header: "Actions",
      className: "text-end",
      render: (item) => (
        <ButtonGroup size="sm" aria-label={`Actions for cleaning record from ${item.cleanedAt}`}>
          <Button variant="outline-secondary" onClick={() => openEditForm(item)}>
            Edit
          </Button>
          <Button variant="outline-primary" onClick={() => openAuditHistory(item)}>
            Audit history
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  function updateSearchParams(nextValues: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(nextValues)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    setSearchParams(next);
  }

  function openCreateForm() {
    setError(null);
    setFormValues(emptyForm);
    setEditingRecord(null);
  }

  function openEditForm(record: CleaningRecord) {
    setError(null);
    setFormValues({
      cleanedBy: record.cleanedBy,
      cleanedAt: toDateTimeLocal(record.cleanedAt),
      method: record.method,
      notes: record.notes,
      status: record.status,
    });
    setEditingRecord(record);
  }

  function closeForm() {
    setEditingRecord(undefined);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const input = {
      ...formValues,
      cleanedAt: new Date(formValues.cleanedAt).toISOString(),
      notes: formValues.notes?.trim() || null,
    };

    try {
      if (editingRecord) {
        await updateCleaningRecord(editingRecord.id, input);
      } else {
        await createCleaningRecord(equipment.id, input);
      }
      closeForm();
      revalidator.revalidate();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save record.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openAuditHistory(record: CleaningRecord) {
    setAuditRecord(record);
    setAuditEntries(null);
    setError(null);

    try {
      setAuditEntries(await getAuditHistory(record.id));
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load audit history.",
      );
    }
  }

  return (
    <main className="min-vh-100 bg-body-tertiary py-4 text-start">
      <Container>
        <Link className="link-secondary text-decoration-none" to="/">
          ← Back to equipment
        </Link>

        <Row className="align-items-center gy-3 my-3">
          <Col>
            <p className="text-uppercase fw-semibold text-primary mb-1">Cleaning records</p>
            <h1 className="h2 mb-1">{equipment.name}</h1>
            <div className="d-flex align-items-center gap-2 text-body-secondary">
              <span>{equipment.code}</span>
              <Badge bg={equipment.status === "active" ? "success" : "secondary"}>
                {equipment.status}
              </Badge>
            </div>
          </Col>
          <Col xs="auto">
            <Button disabled={equipment.status === "retired"} onClick={openCreateForm}>
              Add cleaning record
            </Button>
          </Col>
        </Row>

        {equipment.status === "retired" ? (
          <Alert variant="secondary">
            This equipment is retired. Its history remains available, but new cleaning records are disabled.
          </Alert>
        ) : null}
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center gap-3">
            <span className="fw-semibold">Records</span>
            <Form.Group controlId="record-status-filter" className="d-flex align-items-center gap-2 mb-0">
              <Form.Label className="mb-0 text-nowrap">Status</Form.Label>
              <Form.Select
                size="sm"
                value={searchParams.get("status") ?? ""}
                onChange={(event) => updateSearchParams({ status: event.target.value || undefined, page: "1" })}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
              </Form.Select>
            </Form.Group>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              columns={columns}
              emptyMessage="No cleaning records match this filter."
              getRowKey={(item) => item.id}
              items={records.items}
            />
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
            <small className="text-body-secondary">
              {records.pagination.totalItems} {records.pagination.totalItems === 1 ? "record" : "records"}
            </small>
            <PaginationControls
              page={records.pagination.page}
              pageSize={pageSize}
              totalItems={records.pagination.totalItems}
              onPageChange={(page) => updateSearchParams({ page: String(page) })}
            />
          </Card.Footer>
        </Card>
      </Container>

      <FormModal
        show={editingRecord !== undefined}
        title={editingRecord ? "Edit cleaning record" : "Add cleaning record"}
        submitLabel={editingRecord ? "Save changes" : "Add record"}
        isSubmitting={isSubmitting}
        onHide={closeForm}
        onSubmit={handleSubmit}
      >
        <Form.Group className="mb-3" controlId="cleaned-by">
          <Form.Label>Cleaned by</Form.Label>
          <Form.Control
            required
            value={formValues.cleanedBy}
            onChange={(event) => setFormValues({ ...formValues, cleanedBy: event.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="cleaned-at">
          <Form.Label>Cleaned at</Form.Label>
          <Form.Control
            required
            type="datetime-local"
            value={formValues.cleanedAt}
            onChange={(event) => setFormValues({ ...formValues, cleanedAt: event.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="cleaning-method">
          <Form.Label>Method</Form.Label>
          <Form.Control
            required
            value={formValues.method}
            onChange={(event) => setFormValues({ ...formValues, method: event.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="record-status">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={formValues.status}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                status: event.target.value as CleaningRecordStatus,
              })
            }
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="record-notes">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formValues.notes ?? ""}
            onChange={(event) => setFormValues({ ...formValues, notes: event.target.value })}
          />
        </Form.Group>
      </FormModal>

      <AppOffcanvas
        show={Boolean(auditRecord)}
        title="Audit history"
        onHide={() => {
          setAuditRecord(null);
          setAuditEntries(null);
        }}
      >
        {auditRecord ? (
          <>
            <p className="small text-body-secondary">
              {auditRecord.method} · {formatDateTime(auditRecord.cleanedAt)}
            </p>
            {auditEntries === null ? (
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" /> Loading history…
              </div>
            ) : auditEntries.length === 0 ? (
              <p className="text-body-secondary">No audit entries were found.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {auditEntries.map((entry) => (
                  <article key={entry.id} className="border-bottom pb-3">
                    <div className="d-flex justify-content-between gap-2">
                      <span className="fw-semibold">{formatField(entry.field)}</span>
                      <Badge bg={entry.action === "CREATED" ? "primary" : "secondary"}>
                        {entry.action.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="mb-1 small">
                      {formatAuditValue(entry.field, entry.oldValue)} → {formatAuditValue(entry.field, entry.newValue)}
                    </p>
                    <small className="text-body-secondary">
                      {entry.changedBy} · {formatDateTime(entry.changedAt)}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}
      </AppOffcanvas>
    </main>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatField(field: string): string {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function formatAuditValue(field: string, value: string | null): string {
  if (value === null) {
    return "None";
  }

  return field === "cleanedAt" ? formatDateTime(value) : value;
}
