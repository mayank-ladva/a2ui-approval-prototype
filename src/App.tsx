import { useEffect, useRef, useState } from "react";
import { A2uiSurface, basicCatalog, type ReactComponentImplementation } from "@a2ui/react/v0_9";
import { MessageProcessor, type A2uiClientAction, type SurfaceModel } from "@a2ui/web_core/v0_9";
import {
  initialLoginMessages,
  loginStatusMessage,
  loginValidationMessage,
  resetLoginMessages,
} from "./loginMessages";

type Status = "loading" | "ready" | "failed";
type LoginResult = "idle" | "success" | "failed";

const VALID_USERNAME = "demo@example.com";
const VALID_PASSWORD = "password123";

function cloneMessages<T>(messages: T): T {
  return JSON.parse(JSON.stringify(messages)) as T;
}

function formatEvidence(value: unknown) {
  return JSON.stringify(
    value,
    (key, nestedValue) => {
      if (key === "password" && typeof nestedValue === "string") {
        return nestedValue ? "<redacted>" : "";
      }

      return nestedValue;
    },
    2,
  );
}

export default function App() {
  const processorRef = useRef<MessageProcessor<ReactComponentImplementation> | null>(null);
  const dataSubscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);
  const [surface, setSurface] = useState<SurfaceModel<ReactComponentImplementation> | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<A2uiClientAction | null>(null);
  const [bindingChangeCount, setBindingChangeCount] = useState(0);
  const [loginAttemptCount, setLoginAttemptCount] = useState(0);
  const [loginResult, setLoginResult] = useState<LoginResult>("idle");

  useEffect(() => {
    const processor = new MessageProcessor<ReactComponentImplementation>(
      [basicCatalog],
      (action) => {
        setLastAction(action);

        if (action.name === "login_submitted") {
          handleLoginAction(processor, action);
        }
      },
      { version: "v0.9.1" },
    );

    processorRef.current = processor;
    const surfaceSubscription = processor.onSurfaceCreated((createdSurface) => {
      setSurface(createdSurface);

      for (const subscription of dataSubscriptionsRef.current) {
        subscription.unsubscribe();
      }

      const watchedPaths = ["/login/username", "/login/password", "/login/rememberMe"];
      dataSubscriptionsRef.current = watchedPaths.map((path) =>
        createdSurface.dataModel.subscribe(path, () => {
          setBindingChangeCount((count) => count + 1);
        }),
      );
    });

    try {
      processor.processMessages(cloneMessages(initialLoginMessages));
      setBindingChangeCount(0);
      setStatus("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setStatus("failed");
    }

    return () => {
      surfaceSubscription.unsubscribe();
      for (const subscription of dataSubscriptionsRef.current) {
        subscription.unsubscribe();
      }
      dataSubscriptionsRef.current = [];
      processor.model.dispose();
      processorRef.current = null;
    };
  }, []);

  function handleLoginAction(
    processor: MessageProcessor<ReactComponentImplementation>,
    action: A2uiClientAction,
  ) {
    const username = String(action.context?.username ?? "").trim();
    const password = String(action.context?.password ?? "");
    const rememberMe = Boolean(action.context?.rememberMe);

    setLoginAttemptCount((count) => count + 1);

    if (!username || !password) {
      processor.processMessages([
        loginValidationMessage({
          usernameError: username ? undefined : "Email is required.",
          passwordError: password ? undefined : "Password is required.",
        }),
        loginStatusMessage("Enter an email and password to continue."),
      ]);
      setLoginResult("failed");
      return;
    }

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      processor.processMessages([
        loginValidationMessage({}),
        loginStatusMessage(
          rememberMe
            ? "Login successful. This device would be remembered."
            : "Login successful. This is a standard session.",
        ),
      ]);
      setLoginResult("success");
      return;
    }

    processor.processMessages([
      loginValidationMessage({
        usernameError: "Check the demo email address.",
        passwordError: "Check the demo password.",
      }),
      loginStatusMessage("Login failed. Use demo@example.com and password123."),
    ]);
    setLoginResult("failed");
  }

  function resetLogin() {
    const processor = processorRef.current;
    if (!processor) return;

    processor.processMessages(resetLoginMessages());
    setBindingChangeCount(0);
    setLoginAttemptCount(0);
    setLoginResult("idle");
    setLastAction(null);
  }

  return (
    <main className="app-shell login-shell">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">A2UI protocol prototype - v0.9.1</p>
        <h1 id="page-title">Login Page</h1>
        <p>
          This is a normal login screen rendered from A2UI messages. The host app validates the
          submitted action and updates the same A2UI surface with success or error state.
        </p>
      </section>

      {/* <section className="check-panel login-checks" aria-label="Prototype checks">
        <div className={`check ${status === "ready" ? "pass" : ""}`}>
          <strong>1. Protocol parse</strong>
          <span>{status === "ready" ? "PASS - login surface created" : status === "failed" ? "FAIL" : "Loading..."}</span>
        </div>
        <div className={`check ${bindingChangeCount > 0 ? "pass" : ""}`}>
          <strong>2. Bound inputs</strong>
          <span>{bindingChangeCount > 0 ? `PASS - ${bindingChangeCount} data change(s)` : "Type email, password, or remember me"}</span>
        </div>
        <div className={`check ${lastAction ? "pass" : ""}`}>
          <strong>3. Submit action</strong>
          <span>{lastAction ? "PASS - login action received" : "Click Login to test"}</span>
        </div>
        <div className={`check ${loginResult === "success" ? "pass" : loginResult === "failed" ? "fail" : ""}`}>
          <strong>4. Host auth</strong>
          <span>
            {loginResult === "success"
              ? "PASS - credentials accepted"
              : loginResult === "failed"
                ? "FAIL - credentials rejected"
                : "Waiting for login attempt"}
          </span>
        </div>
      </section> */}

      <section className="workspace login-workspace" aria-label="A2UI login workspace">
        <div className="renderer-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Official renderer output</p>
              <h2>A2UI login surface</h2>
            </div>
            <div className="panel-actions">
              <button className="test-button secondary" type="button" onClick={resetLogin} disabled={status !== "ready"}>
                Reset demo
              </button>
            </div>
          </div>
          {error ? <pre className="error">{error}</pre> : null}
          <div className="a2ui-renderer login-renderer">
            {surface ? <A2uiSurface surface={surface} /> : <p>Loading A2UI surface...</p>}
          </div>
        </div>

        <aside className="debug-panel" aria-label="Protocol evidence">
          <h2>Protocol evidence</h2>
          <p>The login form is defined by fixed A2UI messages, not JSX form markup.</p>
          <pre>{formatEvidence(initialLoginMessages)}</pre>
          <h3>Last client action</h3>
          <pre>{lastAction ? formatEvidence(lastAction) : "No action received yet."}</pre>
          <h3>Login attempts</h3>
          <pre>{String(loginAttemptCount)}</pre>
        </aside>
      </section>
    </main>
  );
}
