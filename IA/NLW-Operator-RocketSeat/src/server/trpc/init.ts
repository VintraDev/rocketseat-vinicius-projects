import "server-only";
import { randomUUID } from "node:crypto";
import { initTRPC } from "@trpc/server";

type CreateTRPCContextOptions = {
  req?: Request;
  resHeaders?: Headers;
};

function getCookieValue(cookieHeader: string | null, key: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookieEntries = cookieHeader.split(";").map((part) => part.trim());

  for (const entry of cookieEntries) {
    if (!entry.startsWith(`${key}=`)) {
      continue;
    }

    return entry.slice(key.length + 1);
  }

  return null;
}

export async function createTRPCContext(opts?: CreateTRPCContextOptions) {
  const cookieName = "devroast_session_id";
  const cookieHeader = opts?.req?.headers.get("cookie") ?? null;
  const existingSessionId = getCookieValue(cookieHeader, cookieName);

  if (existingSessionId) {
    return {
      sessionId: existingSessionId,
    };
  }

  const sessionId = randomUUID();

  opts?.resHeaders?.append(
    "set-cookie",
    `${cookieName}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
  );

  return {
    sessionId,
  };
}

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
