const crypto = require("crypto");
const fs = require("fs/promises");
const http = require("http");
const path = require("path");
const { MongoClient } = require("mongodb");

const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;
// Local file storage removed; using MongoDB exclusively
const sessions = new Map();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const mongoDbName = process.env.MONGODB_DB || "vocal";
const client = new MongoClient(mongoUri);
const starterSubjects = [
  "Electrical Wiring",
  "Carpentry",
  "Plumbing",
  "Automotive Repair",
  "Tailoring",
  "Computer Applications",
];
const appStateId = "main";

const server = http.createServer(async (request, response) => {
  try {
    const route = new URL(request.url, `http://${request.headers.host}`).pathname;
    if (route.startsWith("/api/")) {
      await handleApi(request, response, route);
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Server error" });
  }
});

server.listen(port, () => {
  console.log(`Vocal server running at http://localhost:${port}`);
});

let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    await client.connect();
    dbInstance = client.db(mongoDbName);

    // Run one-time migration from users.json if it exists
    try {
      const usersFilePath = path.join(rootDir, "data", "users.json");
      const data = await fs.readFile(usersFilePath, "utf8");
      const usersList = JSON.parse(data);
      if (Array.isArray(usersList) && usersList.length > 0) {
        const usersCol = dbInstance.collection("users");
        for (const u of usersList) {
          await usersCol.updateOne({ id: u.id }, { $set: u }, { upsert: true });
        }
        console.log(`Migrated ${usersList.length} users to MongoDB.`);
        // Rename the file so it won't be migrated again
        await fs.rename(usersFilePath, path.join(rootDir, "data", "users.json.bak"));
      }
    } catch (err) {
      // Ignore errors (file doesn't exist, etc.)
    }
  }
  return dbInstance;
}

getDatabase().catch((error) => {
  console.error("MongoDB initialization failed:", error);
});

async function getCollections() {
  const db = await getDatabase();
  return {
    appState: db.collection("appState"),
    resources: db.collection("resources"),
    users: db.collection("users"),
  };
}

async function readWorkspaceState() {
  const { appState, resources } = await getCollections();
  const stateDoc = await appState.findOne({ _id: appStateId });
  const allResources = await resources.find({}).sort({ createdAt: -1 }).toArray();

  return {
    subjects: stateDoc?.subjects || starterSubjects,
    resources: allResources.map(publicResource),
  };
}

function publicResource(resource) {
  const { _id, ...rest } = resource;
  return rest;
}

async function handleApi(request, response, route) {
  if (request.method === "GET" && route === "/api/state") {
    const state = await readWorkspaceState();
    sendJson(response, 200, state);
    return;
  }

  if (route.startsWith("/api/auth/")) {
    await handleAuth(request, response, route);
    return;
  }

  if (request.method === "POST" && route === "/api/subjects") {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      sendJson(response, 401, { error: "Not signed in" });
      return;
    }

    const body = await readJson(request);
    const name = normalizeSubject(body.name);
    if (!name) {
      sendJson(response, 400, { error: "Subject name is required." });
      return;
    }

    const { appState } = await getCollections();
    await appState.updateOne(
      { _id: appStateId },
      {
        $addToSet: { subjects: name },
        $set: { updatedAt: new Date().toISOString() },
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true },
    );

    const state = await readWorkspaceState();
    sendJson(response, 201, state);
    return;
  }

  if (request.method === "POST" && route === "/api/resources") {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      sendJson(response, 401, { error: "Not signed in" });
      return;
    }

    const body = await readJson(request);
    const title = String(body.title || "").trim();
    const subject = normalizeSubject(body.subject);
    const fileName = String(body.fileName || "").trim();
    const fileType = String(body.fileType || "application/octet-stream");
    const dataUrl = String(body.dataUrl || "");
    const description = String(body.description || "").trim();

    if (!title || !subject || !fileName || !fileType || !dataUrl) {
      sendJson(response, 400, { error: "Missing resource details." });
      return;
    }

    const resource = {
      id: crypto.randomUUID(),
      subject,
      title,
      teacher: currentUser.username,
      teacherLower: currentUser.username.toLowerCase(),
      description,
      fileName,
      fileType,
      dataUrl,
      createdAt: new Date().toISOString(),
    };

    const { resources, appState } = await getCollections();
    await resources.insertOne(resource);
    await appState.updateOne(
      { _id: appStateId },
      {
        $addToSet: { subjects: subject },
        $set: { updatedAt: new Date().toISOString() },
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true },
    );

    sendJson(response, 201, { resource: publicResource(resource) });
    return;
  }

  if (request.method === "DELETE" && route.startsWith("/api/resources/")) {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      sendJson(response, 401, { error: "Not signed in" });
      return;
    }

    const resourceId = route.slice("/api/resources/".length).trim();
    if (!resourceId) {
      sendJson(response, 400, { error: "Resource id is required." });
      return;
    }

    const { resources } = await getCollections();
    const resource = await resources.findOne({ id: resourceId });

    if (!resource) {
      sendJson(response, 404, { error: "Resource not found." });
      return;
    }

    if (resource.teacherLower !== currentUser.username.toLowerCase()) {
      sendJson(response, 403, { error: "You can only delete your own resources." });
      return;
    }

    await resources.deleteOne({ id: resourceId });
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

async function handleAuth(request, response, route) {
  if (request.method === "GET" && route === "/api/auth/me") {
    const user = await getCurrentUser(request);
    sendJson(response, user ? 200 : 401, user ? { user } : { error: "Not signed in" });
    return;
  }

  if (request.method === "POST" && route === "/api/auth/signup") {
    const body = await readJson(request);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    if (!isValidUsername(username) || password.length < 8) {
      sendJson(response, 400, { error: "Use a valid username and a password with at least 8 characters." });
      return;
    }

    const { users } = await getCollections();
    const existing = await users.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } });
    if (existing) {
      sendJson(response, 409, { error: "That account already exists." });
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      username,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await users.insertOne(user);
    createSession(response, user);
    sendJson(response, 201, { user: publicUser(user) });
    return;
  }

  if (request.method === "POST" && route === "/api/auth/login") {
    const body = await readJson(request);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");
    const { users } = await getCollections();
    const user = await users.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(response, 401, { error: "Incorrect username or password." });
      return;
    }

    createSession(response, user);
    sendJson(response, 200, { user: publicUser(user) });
    return;
  }

  if (request.method === "POST" && route === "/api/auth/logout") {
    const sessionId = getCookie(request, "vocal_session");
    if (sessionId) {
      sessions.delete(sessionId);
    }

    response.setHeader("Set-Cookie", expiredSessionCookie());
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

async function serveStatic(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed");
    return;
  }

  const requestedPath = new URL(request.url, `http://${request.headers.host}`).pathname;
  const safePath = requestedPath === "/" ? "/index.html" : decodeURIComponent(requestedPath);
  const filePath = path.normalize(path.join(rootDir, safePath));

  if (!filePath.startsWith(rootDir) || filePath.includes(`${path.sep}data${path.sep}`)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : file);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 20_000) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}



function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256").toString("hex");
  return `pbkdf2$sha256$310000$${salt}$${hash}`;
}

function verifyPassword(password, savedHash) {
  const [, digest, iterations, salt, hash] = savedHash.split("$");
  if (digest !== "sha256" || !iterations || !salt || !hash) return false;

  const candidate = crypto.pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
  const original = Buffer.from(hash, "hex");
  return original.length === candidate.length && crypto.timingSafeEqual(original, candidate);
}

async function getCurrentUser(request) {
  const sessionId = getCookie(request, "vocal_session");
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session || session.expiresAt < Date.now()) return null;

  const { users } = await getCollections();
  const user = await users.findOne({ id: session.userId });
  return user ? publicUser(user) : null;
}

function createSession(response, user) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  sessions.set(sessionId, {
    userId: user.id,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  response.setHeader("Set-Cookie", sessionCookie(sessionId));
}

function sessionCookie(sessionId) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `vocal_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`;
}

function expiredSessionCookie() {
  return "vocal_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

function getCookie(request, name) {
  const cookies = request.headers.cookie || "";
  return cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
  };
}

function normalizeUsername(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function normalizeSubject(value) {
  return String(value || "").trim();
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_.@-]{3,60}$/.test(username);
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}
