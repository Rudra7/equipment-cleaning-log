import { Button, Container } from "react-bootstrap";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText || `Request failed with status ${error.status}.`
    : error instanceof Error
      ? error.message
      : "Something went wrong while loading this page.";

  return (
    <main className="min-vh-100 bg-body-tertiary py-5 text-start">
      <Container className="text-center">
        <p className="text-uppercase fw-semibold text-danger">Unable to load data</p>
        <h1 className="h3">We could not open this page.</h1>
        <p className="text-body-secondary mb-4">{message}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </Container>
    </main>
  );
}
