// src/api/auth.js

// Simule un délai réseau
const fakeDelay = (ms = 500) => new Promise(res => setTimeout(res, ms));

export async function registerUser(userData) {
  await fakeDelay();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === userData.email)) {
    return { success: false, error: 'Cet email est déjà utilisé.' };
  }
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true };
}

export async function loginUser(email, password) {
  await fakeDelay();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const found = users.find(u => u.email === email && u.password === password);
  if (found) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(found));
    return { success: true, user: found };
  }
  return { success: false, error: 'Email ou mot de passe incorrect.' };
}

export async function logoutUser() {
  await fakeDelay(200);
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  return { success: true };
}

export function getCurrentUser() {
  const u = localStorage.getItem('currentUser');
  return u ? JSON.parse(u) : null;
}

export function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
} 