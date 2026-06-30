const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const usersPath = path.join(dataDir, "users.json");
const clicksPath = path.join(dataDir, "clicks.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, JSON.stringify({}, null, 2));
if (!fs.existsSync(clicksPath)) fs.writeFileSync(clicksPath, JSON.stringify([], null, 2));

let users = {};
let clicks = [];
const ADMIN_KEY = process.env.ADMIN_KEY || null;

function loadData() {
  try {
    users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  } catch (_) {
    users = {};
  }
  try {
    clicks = JSON.parse(fs.readFileSync(clicksPath, "utf-8"));
  } catch (_) {
    clicks = [];
  }
}

function saveUsers() {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function genToken(len = 8) {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < len; i++) t += c[Math.floor(Math.random() * c.length)];
  return t;
}

loadData();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function authorized(req) {
  const key = (req.query.key || req.headers["x-admin-key"] || "").toString();
  return ADMIN_KEY && key && key === ADMIN_KEY;
}

app.get("/admin/add-user", (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const name = (req.query.name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });
  let token = genToken();
  while (users[token]) token = genToken();
  users[token] = name;
  saveUsers();
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "http").toString();
  const host = req.headers.host;
  const url = `${proto}://${host}/r/${token}`;
  res.json({ name, token, url });
});

app.get("/admin/links", (req, res) => {
  if (!authorized(req)) return res.status(401).type("text").send("unauthorized");
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "http").toString();
  const host = req.headers.host;
  const list = Object.entries(users).map(([token, name]) => ({ name, token, url: `${proto}://${host}/r/${token}` }));
  const rows = list.map(x => `<tr><td>${x.name}</td><td>${x.token}</td><td><a href="${x.url}" target="_blank">${x.url}</a></td></tr>`).join("");
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>唯一連結</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans TC",sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f7f7f7}input{padding:8px;margin-right:8px}</style></head><body><h1>唯一連結</h1><form method="GET" action="/admin/add-user"><input name="name" placeholder="姓名"/><input name="key" placeholder="管理密鑰"/><button type="submit">新增</button></form><table><thead><tr><th>姓名</th><th>Token</th><th>URL</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  res.type("html").send(html);
});

app.get("/config", (req, res) => {
  const liffId = process.env.LIFF_ID || null;
  res.json({ liffId });
});

app.post("/track", (req, res) => {
  const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.socket.remoteAddress || null;
  const ua = req.headers["user-agent"] || null;
  const { lineUserId, lineName } = req.body || {};
  const entry = { source: lineUserId ? "liff" : "unknown", lineUserId: lineUserId || null, lineName: lineName || null, ip, ua, ts: new Date().toISOString() };
  clicks.push(entry);
  fs.writeFileSync(clicksPath, JSON.stringify(clicks, null, 2));
  res.json({ ok: true });
});

app.get("/r/:token", (req, res) => {
  const token = req.params.token;
  const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.socket.remoteAddress || null;
  const ua = req.headers["user-agent"] || null;
  const name = users[token] || null;

  const entry = { token, name, ip, ua, ts: new Date().toISOString() };
  clicks.push(entry);
  fs.writeFileSync(clicksPath, JSON.stringify(clicks, null, 2));

  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/report", (req, res) => {
  const rows = clicks
    .slice()
    .reverse()
    .map(c => `<tr><td>${c.lineName || c.name || "未識別"}</td><td>${c.lineUserId || c.token || ""}</td><td>${c.ip || ""}</td><td>${c.ua || ""}</td><td>${c.ts}</td><td>${c.source || ""}</td></tr>`) 
    .join("");
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>點擊報表</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans TC",sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f7f7f7}</style></head><body><h1>點擊報表</h1><table><thead><tr><th>姓名</th><th>使用者ID/Token</th><th>IP</th><th>User-Agent</th><th>時間</th><th>來源</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  res.type("html").send(html);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});