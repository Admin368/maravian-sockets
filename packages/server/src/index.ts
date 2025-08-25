import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server as IOServer } from "socket.io";
import { createServer } from "http";
import Database from "better-sqlite3";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const DB_PATH =
  process.env.DB_PATH || path.resolve(process.cwd(), "data", "socketmax.db");
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Database setup
const db = new Database(DB_PATH);

db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  roles TEXT NOT NULL DEFAULT '[]',
  banned INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS apps (
  app_id TEXT PRIMARY KEY,
  app_key TEXT NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS schemas (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  version TEXT NOT NULL,
  json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(app_id) REFERENCES apps(app_id)
);
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  system INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  UNIQUE(app_id, topic)
);
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  app_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS room_admins (
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (room_id, user_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  user_id TEXT,
  room TEXT,
  ts INTEGER NOT NULL
);
`);

// Bootstrap admin
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  const row = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(adminEmail);
  if (!row) {
    const bcrypt = require("bcryptjs");
    const id = nanoid();
    const password_hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
      "INSERT INTO users (id, email, password_hash, roles) VALUES (?, ?, ?, ?)"
    ).run(id, adminEmail, password_hash, JSON.stringify(["admin"]));
    console.log(`Bootstrapped admin user: ${adminEmail}`);
  }
}

const ajv = new Ajv({ allErrors: true, removeAdditional: "failing" });
addFormats(ajv);
const validatorCache = new Map<string, any>(); // key: appId|topic|type -> validate fn

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN, credentials: true })
);

const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN },
});

// Auth helpers
function signToken(user: any) {
  return jwt.sign(
    { sub: user.id, roles: JSON.parse(user.roles || "[]") },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req: any, res: any, next: any) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: "missing auth" });
  const token = hdr.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email/password required" });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const bcrypt = require("bcryptjs");
  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: "invalid credentials" });
  const token = signToken(user);
  res.json({
    accessToken: token,
    user: { id: user.id, email: user.email, roles: JSON.parse(user.roles) },
  });
});

// App key create/list (admin only)
app.post("/api/apps", authMiddleware, (req, res) => {
  const roles = (req as any).user.roles as string[];
  if (!roles.includes("admin"))
    return res.status(403).json({ error: "forbidden" });
  const { appId, name } = req.body || {};
  if (!appId) return res.status(400).json({ error: "appId required" });
  const appKey = nanoid(32);
  try {
    db.prepare(
      "INSERT INTO apps (app_id, app_key, name, created_at) VALUES (?, ?, ?, ?)"
    ).run(appId, appKey, name || appId, Date.now());
    res.json({ appId, appKey });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/apps", authMiddleware, (req, res) => {
  const roles = (req as any).user.roles as string[];
  if (!roles.includes("admin"))
    return res.status(403).json({ error: "forbidden" });
  const rows = db.prepare("SELECT app_id, name, created_at FROM apps").all();
  res.json(rows);
});

// Schema push
app.post("/api/schema/push", (req, res) => {
  const { appId, appKey, version, schema } = req.body || {};
  if (!appId || !appKey || !version || !schema)
    return res
      .status(400)
      .json({ error: "appId, appKey, version, schema required" });
  const appRow = db.prepare("SELECT * FROM apps WHERE app_id = ?").get(appId) as any;
  if (!appRow || appRow.app_key !== appKey)
    return res.status(401).json({ error: "invalid app credentials" });
  const id = nanoid();
  db.prepare(
    "INSERT INTO schemas (id, app_id, version, json, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, appId, version, JSON.stringify(schema), Date.now());

  // load topics
  if (Array.isArray(schema.topics)) {
    const insert = db.prepare(
      "INSERT OR IGNORE INTO topics (id, app_id, topic, description, system, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const t of schema.topics) {
      insert.run(
        nanoid(),
        appId,
        t.topic,
        t.description || null,
        t.system ? 1 : 0,
        Date.now()
      );
    }
  }
  res.json({ ok: true, id });
});

// Schema pull & log versions
app.get("/api/schema/versions", (req, res) => {
  const { appId } = req.query as any;
  if (!appId) return res.status(400).json({ error: "appId required" });
  const rows = db
    .prepare(
      "SELECT id, version, created_at FROM schemas WHERE app_id = ? ORDER BY created_at DESC"
    )
    .all(appId);
  res.json(rows);
});

app.get("/api/schema/latest", (req, res) => {
  const { appId } = req.query as any;
  if (!appId) return res.status(400).json({ error: "appId required" });
  const row = db
    .prepare(
      "SELECT json FROM schemas WHERE app_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(appId) as any;
  if (!row) return res.status(404).json({ error: "no schema" });
  res.json(JSON.parse(row.json));
});

// Topics/users/rooms APIs
app.get("/api/topics", (req, res) => {
  const { appId } = req.query as any;
  if (!appId) return res.status(400).json({ error: "appId required" });
  const rows = db
    .prepare(
      "SELECT topic, description, system, created_at FROM topics WHERE app_id = ?"
    )
    .all(appId);
  res.json(rows);
});

app.get("/api/rooms", (req, res) => {
  const { appId } = req.query as any;
  if (!appId) return res.status(400).json({ error: "appId required" });
  const rows = db
    .prepare("SELECT id, name, topic, created_at FROM rooms WHERE app_id = ?")
    .all(appId);
  res.json(rows);
});

app.post("/api/rooms", authMiddleware, (req, res) => {
  const { appId, name, topic } = req.body || {};
  if (!appId || !name || !topic)
    return res.status(400).json({ error: "appId, name, topic required" });
  const id = nanoid();
  db.prepare(
    "INSERT INTO rooms (id, name, topic, app_id, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, name, topic, appId, Date.now());
  res.json({ id, name, topic });
});

app.post("/api/rooms/admins", authMiddleware, (req, res) => {
  const roles = (req as any).user.roles as string[];
  if (!roles.includes("admin"))
    return res.status(403).json({ error: "forbidden" });
  const { roomId, userId, action } = req.body || {};
  if (!roomId || !userId || !action)
    return res.status(400).json({ error: "roomId, userId, action required" });
  if (action === "add")
    db.prepare(
      "INSERT OR IGNORE INTO room_admins (room_id, user_id) VALUES (?, ?)"
    ).run(roomId, userId);
  if (action === "remove")
    db.prepare("DELETE FROM room_admins WHERE room_id = ? AND user_id = ?").run(
      roomId,
      userId
    );
  res.json({ ok: true });
});

// Users API (admin)
app.get("/api/users", authMiddleware, (req, res) => {
  const roles = (req as any).user.roles as string[];
  if (!roles.includes("admin"))
    return res.status(403).json({ error: "forbidden" });
  const rows = db
    .prepare("SELECT id, email, display_name, roles, banned FROM users")
    .all();
  res.json(rows.map((r: any) => ({ ...r, roles: JSON.parse(r.roles || "[]") })));
});

app.post("/api/users/roles", authMiddleware, (req, res) => {
  const roles = (req as any).user.roles as string[];
  if (!roles.includes("admin"))
    return res.status(403).json({ error: "forbidden" });
  const { userId, add, remove } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId required" });
  const u = db.prepare("SELECT roles FROM users WHERE id = ?").get(userId) as any;
  if (!u) return res.status(404).json({ error: "user not found" });
  const r: string[] = JSON.parse(u.roles || "[]");
  if (Array.isArray(add)) for (const x of add) if (!r.includes(x)) r.push(x);
  if (Array.isArray(remove))
    for (const x of remove) {
      const i = r.indexOf(x);
      if (i >= 0) r.splice(i, 1);
    }
  db.prepare("UPDATE users SET roles = ? WHERE id = ?").run(
    JSON.stringify(r),
    userId
  );
  res.json({ ok: true, roles: r });
});

app.post("/api/users/ban", authMiddleware, (req, res) => {
  const roles = (req as any).user.roles as string[];
  if (!roles.includes("admin"))
    return res.status(403).json({ error: "forbidden" });
  const { userId, banned } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId required" });
  db.prepare("UPDATE users SET banned = ? WHERE id = ?").run(
    banned ? 1 : 0,
    userId
  );
  res.json({ ok: true });
});

app.get("/api/users/connected", (req, res) => {
  res.json(Array.from(connectedUsers.values()));
});

// Messages (recent)
app.get("/api/messages", (req, res) => {
  const { appId, topic, room, limit } = req.query as any;
  if (!appId) return res.status(400).json({ error: "appId required" });
  const lim = Math.min(Number(limit || 100), 500);
  let sql =
    "SELECT topic, type, payload, user_id, room, ts FROM messages WHERE app_id = ?";
  const params: any[] = [appId];
  if (topic) {
    sql += " AND topic = ?";
    params.push(topic);
  }
  if (room) {
    sql += " AND room = ?";
    params.push(room);
  }
  sql += " ORDER BY ts DESC LIMIT ?";
  params.push(lim);
  const rows = db
    .prepare(sql)
    .all(...params)
    .map((r: any) => ({ ...r, payload: JSON.parse(r.payload) }));
  res.json(rows);
});

// Static: dashboard
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
app.get("*", (req, res) => {
  const indexPath = path.join(publicDir, "index.html");
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(200).send("Maravian Sockets server");
});

// Socket.IO events
const connectedUsers = new Map<
  string,
  { socketId: string; userId?: string; appId?: string }
>();

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token as string | undefined;
  let userJwt: any = null;
  try {
    if (token) userJwt = jwt.verify(token, JWT_SECRET);
  } catch {}
  const userId = userJwt?.sub as string | undefined;
  const appId = socket.handshake.query?.appId as string | undefined;

  // If user is banned, disconnect immediately
  if (userId) {
    const u = db.prepare("SELECT banned FROM users WHERE id = ?").get(userId) as any;
    if (u && u.banned) {
      socket.emit("system.connection", {
        type: "status",
        payload: { status: "disconnected", reason: "banned" },
      });
      return socket.disconnect(true);
    }
  }

  connectedUsers.set(socket.id, { socketId: socket.id, userId, appId });

  // Connection status to this socket
  socket.emit("system.connection", {
    type: "status",
    payload: { status: "connected" },
  });

  // Presence join broadcast
  io.emit("system.presence", {
    type: "user.join",
    payload: {
      user: { id: userId || socket.id },
      users: Array.from(connectedUsers.values()).map((u) => ({
        id: u.userId || u.socketId,
      })),
    },
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    io.emit("system.presence", {
      type: "user.leave",
      payload: {
        userId: userId || socket.id,
        users: Array.from(connectedUsers.values()).map((u) => ({
          id: u.userId || u.socketId,
        })),
      },
    });
    io.emit("system.connection", {
      type: "status",
      payload: { status: "disconnected", userId: userId || socket.id },
    });
  });

  // Join/leave rooms
  socket.on("room.join", ({ room }) => {
    if (typeof room === "string" && room.length) {
      socket.join(room);
    }
  });
  socket.on("room.leave", ({ room }) => {
    if (typeof room === "string" && room.length) {
      socket.leave(room);
    }
  });

  // Admin actions (socket)
  socket.on("admin.ban", ({ userId: target }, cb?: Function) => {
    try {
      if (!userJwt?.roles?.includes("admin")) throw new Error("forbidden");
      if (!target) throw new Error("userId required");
      db.prepare("UPDATE users SET banned = 1 WHERE id = ?").run(target);
      cb && cb({ ok: true });
    } catch (e: any) {
      cb && cb({ ok: false, error: e.message });
    }
  });
  socket.on("admin.unban", ({ userId: target }, cb?: Function) => {
    try {
      if (!userJwt?.roles?.includes("admin")) throw new Error("forbidden");
      if (!target) throw new Error("userId required");
      db.prepare("UPDATE users SET banned = 0 WHERE id = ?").run(target);
      cb && cb({ ok: true });
    } catch (e: any) {
      cb && cb({ ok: false, error: e.message });
    }
  });

  // Publish messages
  socket.on("publish", (msg: any, cb?: Function) => {
    try {
      // msg: { appId, topic, type, payload, room? }
      if (!msg || !msg.appId || !msg.topic || !msg.type)
        throw new Error("invalid message");
      const schemaRow = db
        .prepare(
          "SELECT json FROM schemas WHERE app_id = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(msg.appId) as any;
      if (!schemaRow) throw new Error("no schema for app");
      const schema = JSON.parse(schemaRow.json);
      const topic = schema.topics.find((t: any) => t.topic === msg.topic);
      if (!topic) throw new Error("unknown topic");
      const messageDef = topic.messages.find((m: any) => m.name === msg.type);
      if (!messageDef) throw new Error("unknown message type");
      if (messageDef.direction === "subscribe")
        throw new Error("message is subscribe-only");

      // Validate payload using cached AJV validator
      const payloadSchema = messageDef.jsonSchema || null;
      if (payloadSchema) {
        const key = `${msg.appId}|${msg.topic}|${msg.type}`;
        let validate = validatorCache.get(key);
        if (!validate) {
          validate = ajv.compile(payloadSchema);
          validatorCache.set(key, validate);
        }
        const valid = validate(msg.payload);
        if (!valid)
          throw new Error(
            "payload invalid: " + ajv.errorsText(validate.errors)
          );
      }

      const rec = {
        id: nanoid(),
        app_id: msg.appId,
        topic: msg.topic,
        type: msg.type,
        payload: JSON.stringify(msg.payload ?? {}),
        user_id: userId || null,
        room: msg.room || null,
        ts: Date.now(),
      };
      db.prepare(
        "INSERT INTO messages (id, app_id, topic, type, payload, user_id, room, ts) VALUES (@id, @app_id, @topic, @type, @payload, @user_id, @room, @ts)"
      ).run(rec);

      if (msg.room) {
        io.to(msg.room).emit(msg.topic, {
          type: msg.type,
          payload: msg.payload,
          ts: rec.ts,
        });
      } else {
        io.emit(msg.topic, {
          type: msg.type,
          payload: msg.payload,
          ts: rec.ts,
        });
      }
      cb && cb({ ok: true });
    } catch (e: any) {
      cb && cb({ ok: false, error: e.message });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Maravian Sockets server listening on :${PORT}`);
});
