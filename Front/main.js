const API = "http://localhost:3000";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Login incorrecto");
    return;
  }

  const { token } = await res.json();
  localStorage.setItem("token", token);
  loadProfile();
}

async function loadProfile() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/market/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    renderLogin();
    return;
  }

  const user = await res.json();
  document.getElementById("app").innerHTML = `
    <h2>Bienvenido ${user.nickname}</h2>
    <p>${user.email}</p>
  `;
}

function renderLogin() {
  document.getElementById("app").innerHTML = `
    <input id="email" placeholder="Email">
    <input id="password" type="password" placeholder="Password">
    <button onclick="login()">Login</button>
  `;
}

localStorage.getItem("token") ? loadProfile() : renderLogin();
