import { ArchitectureExplorer } from "./components/ArchitectureExplorer";
import { DeliveryStream } from "./components/DeliveryStream";
import { PerformanceBudgetPanel } from "./components/PerformanceBudgetPanel";
import { TraceProbe } from "./components/TraceProbe";
import { Panel, StatusBadge } from "@showcase/design-system";

const PROFILE = {
  name: "Godofredo C. Gatus II",
  oneLiner: "Platform engineer",
  github: "https://github.com/hit1st",
  email: "mailto:theimposterdeveloper@gmail.com",
  linkedin: "https://www.linkedin.com/in/theimposterdeveloper/",
} as const;

export default function HomePage() {
  return (
    <main>
      <header className="hero">
        <h1>{PROFILE.name}</h1>
        <p>{PROFILE.oneLiner}</p>
        <nav className="contact-links" aria-label="Contact">
          <a href={PROFILE.github}>github.com/hit1st</a>
          <a href={PROFILE.email}>theimposterdeveloper@gmail.com</a>
          <a href={PROFILE.linkedin}>linkedin.com/in/theimposterdeveloper</a>
        </nav>
      </header>

      <Panel id="architecture-explorer" title="Architecture Explorer">
        <StatusBadge label="live" tone="success" />
        <ArchitectureExplorer />
      </Panel>

      <Panel id="delivery-stream" title="Live Delivery Stream">
        <StatusBadge label="live" tone="success" />
        <DeliveryStream />
      </Panel>

      <Panel id="observability" title="Observability">
        <StatusBadge label="trace probe" tone="success" />
        <TraceProbe />
      </Panel>

      <Panel id="performance-budget" title="Performance Budget">
        <StatusBadge label="live" tone="success" />
        <PerformanceBudgetPanel />
      </Panel>

      <footer>
        <a className="docs-link" href="/docs/architecture">
          Under the hood → architecture docs
        </a>
      </footer>
    </main>
  );
}
