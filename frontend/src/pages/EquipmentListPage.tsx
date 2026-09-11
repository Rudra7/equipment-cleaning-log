import { useState, type FormEvent } from "react";
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from "react-router";
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
} from "react-bootstrap";
import {
  createEquipment,
  retireEquipment,
  updateEquipment,
  type Equipment,
  type EquipmentInput,
  type PaginatedEquipment,
} from "../api/equipment";
import { AppOffcanvas } from "../components/AppOffcanvas";
import { DataTable, type TableColumn } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { PaginationControls } from "../components/PaginationControls";

const pageSize = 10;
const emptyForm: EquipmentInput = { name: "", code: "" };

export default function EquipmentListPage() {
  const equipment = useLoaderData() as PaginatedEquipment;
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>();
  const [formValues, setFormValues] = useState<EquipmentInput>(emptyForm);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [retiringEquipment, setRetiringEquipment] = useState<Equipment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: TableColumn<Equipment>[] = [
    {
      header: "Code",
      render: (item) => <span className="fw-semibold">{item.code}</span>,
    },
    { header: "Name", render: (item) => item.name },
    {
      header: "Status",
      render: (item) => (
        <Badge bg={item.status === "active" ? "success" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-end",
      render: (item) => (
        <ButtonGroup size="sm" aria-label={`Actions for ${item.name}`}>
          <Button variant="outline-primary" onClick={() => navigate(`/equipment/${item.id}`)}>
            Records
          </Button>
          <Button variant="outline-secondary" onClick={() => setViewingEquipment(item)}>
            View
          </Button>
          <Button variant="outline-secondary" onClick={() => openEditForm(item)}>
            Edit
          </Button>
          <Button
            variant="outline-danger"
            disabled={item.status === "retired"}
            onClick={() => setRetiringEquipment(item)}
          >
            Retire
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  function openCreateForm() {
    setError(null);
    setFormValues(emptyForm);
    setEditingEquipment(null);
  }

  function openEditForm(item: Equipment) {
    setError(null);
    setFormValues({ name: item.name, code: item.code });
    setEditingEquipment(item);
  }

  function closeForm() {
    setEditingEquipment(undefined);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, formValues);
      } else {
        await createEquipment(formValues);
      }
      closeForm();
      revalidator.revalidate();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save equipment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmRetirement() {
    if (!retiringEquipment) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await retireEquipment(retiringEquipment.id);
      setRetiringEquipment(null);
      revalidator.revalidate();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to retire equipment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-vh-100 bg-body-tertiary py-4 text-start">
      <Container>
        <Row className="align-items-center gy-3 mb-4">
          <Col>
            <p className="text-uppercase fw-semibold text-primary mb-1">Equipment cleaning log</p>
            <h1 className="h2 mb-1">Equipment</h1>
            <p className="text-body-secondary mb-0">
              Manage equipment and open its cleaning-record history.
            </p>
          </Col>
          <Col xs="auto">
            <Button onClick={openCreateForm}>Create equipment</Button>
          </Col>
        </Row>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <DataTable
              columns={columns}
              emptyMessage="No equipment has been created yet."
              getRowKey={(item) => item.id}
              items={equipment.items}
            />
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
            <small className="text-body-secondary">
              {equipment.pagination.totalItems}{" "}
              {equipment.pagination.totalItems === 1 ? "item" : "items"}
            </small>
            <PaginationControls
              page={equipment.pagination.page}
              pageSize={pageSize}
              totalItems={equipment.pagination.totalItems}
              onPageChange={(page) => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(page));
                setSearchParams(next);
              }}
            />
          </Card.Footer>
        </Card>
      </Container>

      <FormModal
        show={editingEquipment !== undefined}
        title={editingEquipment ? "Edit equipment" : "Create equipment"}
        submitLabel={editingEquipment ? "Save changes" : "Create equipment"}
        isSubmitting={isSubmitting}
        onHide={closeForm}
        onSubmit={handleSubmit}
      >
        <Form.Group className="mb-3" controlId="equipment-code">
          <Form.Label>Code</Form.Label>
          <Form.Control
            required
            value={formValues.code}
            onChange={(event) => setFormValues({ ...formValues, code: event.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="equipment-name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            required
            value={formValues.name}
            onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
          />
        </Form.Group>
      </FormModal>

      <AppOffcanvas
        show={Boolean(viewingEquipment)}
        title="Equipment details"
        onHide={() => setViewingEquipment(null)}
        footer={
          viewingEquipment ? (
            <Button className="w-100" onClick={() => navigate(`/equipment/${viewingEquipment.id}`)}>
              View cleaning records
            </Button>
          ) : null
        }
      >
        {viewingEquipment ? (
          <dl className="row mb-0">
            <dt className="col-5">Code</dt>
            <dd className="col-7">{viewingEquipment.code}</dd>
            <dt className="col-5">Name</dt>
            <dd className="col-7">{viewingEquipment.name}</dd>
            <dt className="col-5">Status</dt>
            <dd className="col-7 text-capitalize">{viewingEquipment.status}</dd>
          </dl>
        ) : null}
      </AppOffcanvas>

      <AppOffcanvas
        show={Boolean(retiringEquipment)}
        title="Retire equipment"
        onHide={() => setRetiringEquipment(null)}
        footer={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={() => setRetiringEquipment(null)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={isSubmitting} onClick={confirmRetirement}>
              {isSubmitting ? "Retiring…" : "Retire equipment"}
            </Button>
          </div>
        }
      >
        <p>
          Retire <strong>{retiringEquipment?.name}</strong>? Its cleaning history will remain
          available, but no new cleaning records can be added.
        </p>
      </AppOffcanvas>
    </main>
  );
}
