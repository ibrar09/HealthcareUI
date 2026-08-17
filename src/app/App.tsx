import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { AppRouter } from "./routes";

/**
 * Provider composition order matters: Query wraps Theme wraps Auth wraps Router.
 * All three are currently pass-through placeholders (see each file) —
 * this is where they get "turned on" as the project needs them, without
 * changing this composition shape.
 */
export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
