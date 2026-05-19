import { CheckCircle2 } from "lucide-react";
import type { AppText } from "../../../shared/i18n";

type WorkflowPanelProps = {
  text: AppText;
};

export function WorkflowPanel({ text }: WorkflowPanelProps) {
  return (
    <section className="home-section workflow-panel">
      <div className="home-section-head">
        <div>
          <p>{text.home.workflow.eyebrow}</p>
          <h2>{text.home.workflow.title}</h2>
        </div>
      </div>

      <div className="workflow-list">
        {text.home.workflow.steps.map((step, index) => (
          <article className="workflow-step" key={step.title}>
            <span className="workflow-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
            <CheckCircle2 size={18} strokeWidth={2.25} />
          </article>
        ))}
      </div>
    </section>
  );
}
