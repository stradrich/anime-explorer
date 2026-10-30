// Request plumbing shared by the Jikan and AniList clients:
//
//  - fetchWithTimeout: a fetch that gives up after `timeoutMs`. A plain fetch()
//    against a server that accepts no connections waits for the browser's own
//    timeout (over a minute in Chrome), which is why a hard Jikan outage used
//    to look like an endless skeleton instead of a quick fallback.
//
//  - hedge: ask the primary source first; if it hasn't answered within
//    `hedgeAfterMs`, start the fallback too and take whichever finishes first,
//    aborting the loser. Normal days cost no extra requests; slow days feel
//    instant. If the primary is known to be unhealthy (see jikanHealth) both
//    are started at once.
//
//  - cached: session-scoped memo keyed by request (genre+page, search+page...)
//    so anything already loaded comes back instantly, survives a reload, and
//    costs neither API another call.

// ---------------------------------------------------------------- timeout

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onOuterAbort, { once: true });
  }
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (timedOut) throw new TimeoutError(timeoutMs);
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onOuterAbort);
  }
}

export const isAbort = (err: unknown) =>
  err instanceof DOMException ? err.name === "AbortError" : (err as any)?.name === "AbortError";

// ---------------------------------------------------------------- health

const UNHEALTHY_FOR_MS = 60_000;

/** Remembers that a source recently failed or was slow, so later requests
 *  don't each pay the same timeout before falling back. */
export function createHealth(name: string) {
  let unhealthyUntil = 0;
  return {
    name,
    markFailed() {
      if (Date.now() >= unhealthyUntil) {
        console.warn(`${name} marked unhealthy for ${UNHEALTHY_FOR_MS / 1000}s; racing the fallback immediately.`);
      }
      unhealthyUntil = Date.now() + UNHEALTHY_FOR_MS;
    },
    markOk() {
      unhealthyUntil = 0;
    },
    isSuspect() {
      return Date.now() < unhealthyUntil;
    },
  };
}

export const jikanHealth = createHealth("Jikan");

// ---------------------------------------------------------------- hedge

const PENDING = Symbol("pending");

export interface HedgeOptions {
  /** Start the fallback after this long if the primary hasn't answered. 0 = race both now. */
  hedgeAfterMs?: number;
  /** Called when the primary lost (failed, or was slower than the fallback). */
  onPrimaryLost?: (reason: "failed" | "slow", err?: unknown) => void;
  onPrimaryWon?: () => void;
}

export function hedge<T>(
  primary: (signal: AbortSignal) => Promise<T>,
  fallback: (signal: AbortSignal) => Promise<T>,
  { hedgeAfterMs = 2500, onPrimaryLost, onPrimaryWon }: HedgeOptions = {}
): Promise<T> {
  const pc = new AbortController();
  const fc = new AbortController();

  return new Promise<T>((resolve, reject) => {
    let settled = false;
    let fallbackStarted = false;
    let primaryError: unknown = PENDING;
    let fallbackError: unknown = PENDING;

    const finish = (value: T, loser: AbortController, primaryWon: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      loser.abort();
      if (primaryWon) onPrimaryWon?.();
      else if (primaryError === PENDING) onPrimaryLost?.("slow");
      else onPrimaryLost?.("failed", primaryError);
      resolve(value);
    };

    const rejectIfBothFailed = () => {
      if (settled || primaryError === PENDING || fallbackError === PENDING) return;
      settled = true;
      reject(primaryError);
    };

    const startFallback = () => {
      if (fallbackStarted || settled) return;
      fallbackStarted = true;
      fallback(fc.signal).then(
        (v) => finish(v, pc, false),
        (e) => {
          fallbackError = e;
          rejectIfBothFailed();
        }
      );
    };

    const timer = setTimeout(startFallback, Math.max(0, hedgeAfterMs));

    primary(pc.signal).then(
      (v) => finish(v, fc, true),
      (e) => {
        primaryError = e;
        clearTimeout(timer);
        startFallback();
        rejectIfBothFailed();
      }
    );
  });
}

// ---------------------------------------------------------------- cache

const CACHE_PREFIX = "anime-explorer:";
const DEFAULT_TTL_MS = 30 * 60_000;

interface Entry<T> {
  t: number;
  v: T;
}

const memory = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function readSession<T>(key: string): Entry<T> | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry<T>) : null;
  } catch {
    return null;
  }
}

function writeSession<T>(key: string, entry: Entry<T>) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota exceeded or storage disabled: memory cache still works
  }
}

/**
 * Memoise `loader` under `key` for the session. Concurrent callers share one
 * in-flight request. Empty / null results are not cached, so a genre that was
 * empty on the fallback is retried once the primary source recovers.
 */
export async function cached<T>(key: string, loader: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const now = Date.now();
  const hit = (memory.get(key) as Entry<T> | undefined) ?? readSession<T>(key);
  if (hit && now - hit.t < ttlMs) {
    memory.set(key, hit);
    return hit.v;
  }

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const p = loader()
    .then((v) => {
      const empty = v == null || (Array.isArray(v) && v.length === 0);
      if (!empty) {
        const entry = { t: Date.now(), v };
        memory.set(key, entry);
        writeSession(key, entry);
      }
      return v;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
