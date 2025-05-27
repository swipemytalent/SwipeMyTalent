interface AuthData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  title?: string;
}

interface AuthResponse {
  token?: string;
  message?: string;
}

export async function login(data: AuthData): Promise<AuthResponse> {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

export async function register(data: AuthData): Promise<AuthResponse> {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
} 