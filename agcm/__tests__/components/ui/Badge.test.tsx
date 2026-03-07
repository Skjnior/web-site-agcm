// __tests__/components/ui/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-primary');
  });

  it('should apply variant styles', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should apply workflow status variants', () => {
    const { container: container1 } = render(<Badge variant="brouillon">Brouillon</Badge>);
    expect(container1.firstChild).toHaveClass('bg-gray-100');

    const { container: container2 } = render(<Badge variant="soumis">Soumis</Badge>);
    expect(container2.firstChild).toHaveClass('bg-yellow-100');

    const { container: container3 } = render(<Badge variant="approuve">Approuvé</Badge>);
    expect(container3.firstChild).toHaveClass('bg-green-100');

    const { container: container4 } = render(<Badge variant="rejete">Rejeté</Badge>);
    expect(container4.firstChild).toHaveClass('bg-red-100');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-class');
  });
});

