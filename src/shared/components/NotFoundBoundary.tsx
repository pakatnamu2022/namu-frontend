// src/shared/components/NotFoundBoundary.tsx
import { Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { NotFoundError } from "../errors/NotFoundError";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class NotFoundBoundaryClass extends Component<
  Props & { navigate: () => void },
  State
> {
  constructor(props: Props & { navigate: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    if (error instanceof NotFoundError) {
      return { hasError: true, error };
    }
    throw error; // Re-lanza otros errores
  }

  componentDidCatch(error: Error) {
    if (error instanceof NotFoundError) {
      this.props.navigate();
    }
  }

  componentDidUpdate(
    _prevProps: Props & { navigate: () => void },
    prevState: State
  ) {
    if (this.state.hasError && !prevState.hasError) {
      this.props.navigate();
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Renderiza null mientras redirige
    }
    return this.props.children;
  }
}

// Wrapper con hook para pasar navigate
export function NotFoundBoundary({ children }: Props) {
  const navigate = useNavigate();

  return (
    <NotFoundBoundaryClass navigate={() => navigate("/404", { replace: true })}>
      {children}
    </NotFoundBoundaryClass>
  );
}
