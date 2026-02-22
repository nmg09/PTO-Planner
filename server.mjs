import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.join(__dirname, "dist");
const port = Number(process.env.PORT || 4173);

const authUser = process.env.APP_BASIC_AUTH_USER;
const authPassword = process.env.APP_BASIC_AUTH_PASSWORD;
const authMode = (process.env.APP_BASIC_AUTH_MODE ?? "required").toLowerCase();
const hasCredentials = Boolean(authUser && authPassword);
const hasPartialCredentials =
  (authUser && !authPassword) || (!authUser && authPassword);

if (!["required", "optional", "off"].includes(authMode)) {
  console.error(
    "Invalid APP_BASIC_AUTH_MODE value. Use 'required', 'optional', or 'off'."
  );
  process.exit(1);
}

if (hasPartialCredentials) {
  console.error(
    "Set both APP_BASIC_AUTH_USER and APP_BASIC_AUTH_PASSWORD, or neither."
  );
  process.exit(1);
}

if (authMode === "required" && !hasCredentials) {
  console.error(
    "APP_BASIC_AUTH_MODE is 'required' but APP_BASIC_AUTH_USER and APP_BASIC_AUTH_PASSWORD are not both set."
  );
  process.exit(1);
}

const authEnabled =
  authMode === "required" || (authMode === "optional" && hasCredentials);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const parseBasicAuth = (headerValue) => {
  if (!headerValue || !headerValue.startsWith("Basic ")) {
    return null;
  }

  try {
    const payload = Buffer.from(headerValue.slice(6), "base64").toString("utf8");
    const separatorIndex = payload.indexOf(":");
    if (separatorIndex === -1) {
      return null;
    }
    return {
      user: payload.slice(0, separatorIndex),
      password: payload.slice(separatorIndex + 1)
    };
  } catch (_error) {
    return null;
  }
};

const send = (res, statusCode, message, extraHeaders = {}) => {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    ...extraHeaders
  });
  res.end(message);
};

const safeResolve = (requestPath) => {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(distRoot, normalized);
};

const pathExists = async (filePath) => {
  try {
    const details = await stat(filePath);
    return details.isFile();
  } catch (_error) {
    return false;
  }
};

createServer(async (req, res) => {
  if (!req.url) {
    send(res, 400, "Bad request");
    return;
  }

  const basePath = req.url.split("?")[0];
  const decodedPath = decodeURIComponent(basePath);

  // Keep health checks unauthenticated so deployment platforms can probe status.
  if (decodedPath === "/healthz") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (authEnabled) {
    const auth = parseBasicAuth(req.headers.authorization);
    if (!auth || auth.user !== authUser || auth.password !== authPassword) {
      send(res, 401, "Authentication required", {
        "WWW-Authenticate": 'Basic realm="PTO Planner"'
      });
      return;
    }
  }

  const requestPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const requestedFile = safeResolve(requestPath);
  const wantsAsset = path.extname(requestPath) !== "";

  let filePath = requestedFile;
  if (!(await pathExists(filePath))) {
    if (wantsAsset) {
      send(res, 404, "Not found");
      return;
    }
    filePath = path.join(distRoot, "index.html");
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] ?? "application/octet-stream";
  const cacheControl =
    extension === ".html"
      ? "no-cache"
      : "public, max-age=31536000, immutable";

  res.writeHead(200, {
    "Cache-Control": cacheControl,
    "Content-Type": contentType,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  });

  createReadStream(filePath).pipe(res);
}).listen(port, "0.0.0.0", () => {
  console.log(`PTO Planner listening on http://0.0.0.0:${port}`);
});
