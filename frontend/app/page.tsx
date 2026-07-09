import { getHealth } from '@/lib/api';

const metrics = [
  { label: 'Frontend', value: 'Next.js' },
  { label: 'Backend', value: 'Django' },
  { label: 'Database', value: 'PostgreSQL' },
  { label: 'Architecture', value: 'Modular monolith' },
];

export default async function HomePage() {
  let healthMessage = 'Backend status unavailable';

  try {
    const health = await getHealth();
    healthMessage = `${health.service} is ${health.status}`;
  } catch {
    healthMessage = 'Backend is not reachable yet';
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="eyebrow">Chrono</div>
        <h1>Workforce scheduling in a modular monolith.</h1>
        <p>
          Next.js handles the UI, Django owns the business logic, and PostgreSQL stores the data.
          Everything lives in one repository with clean module boundaries.
        </p>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <div className="status-banner">{healthMessage}</div>
      </section>
    </main>
  );
}
