import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders restaurants heading", () => {
  render(<App />);
  const heading = screen.getByText(/Restaurants/i);
  expect(heading).toBeInTheDocument();
});
