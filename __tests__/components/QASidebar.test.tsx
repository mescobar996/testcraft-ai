import { render, screen, fireEvent } from "@testing-library/react";
import { QASidebar } from "@/components/QASidebar";
import { LanguageProvider } from "@/lib/language-context";

const renderWithLanguage = (ui: React.ReactNode) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

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
    renderWithLanguage(<QASidebar {...mockProps} />);
    expect(screen.getByText(/Herramientas QA/i)).toBeInTheDocument();
  });

  it("shows all 4 tools", () => {
    renderWithLanguage(<QASidebar {...mockProps} />);
    expect(screen.getByText(/Validador/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimaci/i)).toBeInTheDocument();
    expect(screen.getByText(/Calidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Comparar/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderWithLanguage(<QASidebar {...mockProps} isOpen={false} />);
    expect(screen.queryByText(/Herramientas QA/i)).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    renderWithLanguage(<QASidebar {...mockProps} />);
    const closeBtn = screen.getByLabelText(/cerrar/i);
    fireEvent.click(closeBtn);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("expands tool card when clicked", () => {
    renderWithLanguage(<QASidebar {...mockProps} />);
    const validatorCard = screen.getByText(/Validador/i).closest("button");
    fireEvent.click(validatorCard!);
    // After clicking, the validator content should be visible
    expect(screen.getByText(/Requisito/i)).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    renderWithLanguage(<QASidebar {...mockProps} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("collapses tool card when clicked again", () => {
    renderWithLanguage(<QASidebar {...mockProps} />);
    const validatorCard = screen.getByText(/Validador/i).closest("button")!;
    // Expand
    fireEvent.click(validatorCard);
    // Collapse
    fireEvent.click(validatorCard);
    // After collapse, the validator content should no longer be visible
    expect(screen.queryByText(/ambiguedad/i)).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    renderWithLanguage(<QASidebar {...mockProps} />);
    const backdrop = screen.getByTestId("sidebar-backdrop");
    fireEvent.click(backdrop);
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
