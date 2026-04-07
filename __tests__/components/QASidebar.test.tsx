import { render, screen, fireEvent } from "@testing-library/react";
import { QASidebar } from "@/components/QASidebar";

describe("QASidebar", () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    requirement: "User can login with email and password",
    testCases: [
      {
        id: "TC001",
        title: "Valid login",
        preconditions: "User exists",
        steps: ["Enter email", "Enter password", "Click login"],
        expectedResult: "Redirect to dashboard",
        priority: "Alta" as const,
        type: "Positivo" as const,
      },
    ],
    engine: "template" as const,
    onGenerateWithEngine: jest.fn(),
  };

  it("renders when isOpen is true", () => {
    render(<QASidebar {...mockProps} />);
    expect(screen.getByText(/Herramientas QA/i)).toBeInTheDocument();
  });

  it("shows all 4 tools", () => {
    render(<QASidebar {...mockProps} />);
    expect(screen.getByText(/Validador/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimaci/i)).toBeInTheDocument();
    expect(screen.getByText(/Calidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Comparar/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<QASidebar {...mockProps} isOpen={false} />);
    expect(screen.queryByText(/Herramientas QA/i)).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<QASidebar {...mockProps} />);
    const closeBtn = screen.getByLabelText(/cerrar/i);
    fireEvent.click(closeBtn);
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
