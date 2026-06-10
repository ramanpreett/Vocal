// ── API helper layer ──────────────────────────────────────────────────────────
// All fetch calls to the backend REST API go through here.

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res;
}

export async function getState() {
  return apiFetch('/api/state');
}

export async function getUsers() {
  return apiFetch('/api/users');
}

export async function getMe() {
  return apiFetch('/api/auth/me');
}

export async function login(username, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function signup(username, password) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export async function addSubject(name) {
  return apiFetch('/api/subjects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function uploadResource(data) {
  return apiFetch('/api/resources', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteResource(id) {
  return apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
}

export async function getMessages() {
  return apiFetch('/api/messages');
}

export async function sendMessage(recipient, content) {
  return apiFetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ recipient, content }),
  });
}

export async function updateAvatar(avatar) {
  return apiFetch('/api/users/me/avatar', {
    method: 'PUT',
    body: JSON.stringify({ avatar }),
  });
}
