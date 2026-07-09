const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export async function getHealth() {
  const response = await fetch(`${BACKEND_URL}/api/health/`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }

  return response.json() as Promise<{ status: string; service: string }>;
}
