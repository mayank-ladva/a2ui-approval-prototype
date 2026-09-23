import { useEffect, useState } from "react";
import {
  A2uiSurface,
  basicCatalog,
  type ReactComponentImplementation,
} from "@a2ui/react/v0_9";
import {
  MessageProcessor,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import { initialWorkflowMessages } from "./workflowMessage";

function cloneMessages<T>(messages: T): T {
  return JSON.parse(JSON.stringify(messages)) as T;
}

export default function WorkflowDemo() {
  const [surface, setSurface] =
    useState<SurfaceModel<ReactComponentImplementation> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processor = new MessageProcessor<ReactComponentImplementation>(
      [basicCatalog],
      () => {},
      { version: "v0.9.1" },
    );

    const subscription = processor.onSurfaceCreated((createdSurface) => {
      setSurface(createdSurface);
    });

    try {
      processor.processMessages(cloneMessages(initialWorkflowMessages));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }

    return () => {
      subscription.unsubscribe();
      processor.model.dispose();
    };
  }, []);

  return (
    <main className="app-shell login-shell">
      <section className="intro">
        <p className="eyebrow">A2UI workflow prototype</p>
        <h1>Order Management</h1>
        <p>This screen is rendered from A2UI messages.</p>
      </section>

      <section className="workspace login-workspace">
        <div className="renderer-panel">
          {error ? <pre className="error">{error}</pre> : null}

          <div className="a2ui-renderer login-renderer">
            {surface ? (
              <A2uiSurface surface={surface} />
            ) : (
              <p>Loading A2UI surface...</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
