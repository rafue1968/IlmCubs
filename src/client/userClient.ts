import { getQfClientId, getQfUserApiBaseUrl } from "../auth/oauth";
import {
  buildBookmarkRequest,
  getBookmarksQueryString,
  type AddBookmarkInput,
  type Bookmark,
} from "../user/bookmarks";
import {
  buildActivityDayRequest,
  buildReadingSessionRequest,
  getActivityDaysQueryString,
  type ActivityDay,
  type CreateReadingSessionInput,
  type ReadingSession,
} from "../user/streaks";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  type?: string;
  error?: string;
};

type RequestMethod = "GET" | "POST";

export class QuranUserClient {
  private readonly accessToken: string;
  private readonly clientId: string;
  private readonly baseUrl: string;
  private readonly timeZone: string;

  constructor(accessToken: string) {
    if (!accessToken.trim()) {
      throw new Error("accessToken is required");
    }

    this.accessToken = accessToken;
    this.clientId = getQfClientId();
    this.baseUrl = getQfUserApiBaseUrl();
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }

  private async request<T>(
    method: RequestMethod,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = new URL(endpoint.replace(/^\/+/, ""), `${this.baseUrl}/`);
    const response = await fetch(url, {
      method,
      headers: {
        "content-type": "application/json",
        "x-auth-token": this.accessToken,
        "x-client-id": this.clientId,
        "x-timezone": this.timeZone,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(buildRequestError(method, endpoint, response, payload));
    }

    return payload as T;
  }

  async addBookmark(payload: AddBookmarkInput): Promise<Bookmark> {
    const response = await this.request<ApiEnvelope<Bookmark>>(
      "POST",
      "/bookmarks",
      buildBookmarkRequest(payload)
    );

    return response.data;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const response = await this.request<ApiEnvelope<Bookmark[]>>(
      "GET",
      `/bookmarks?${getBookmarksQueryString()}`
    );

    return response.data;
  }

  async createReadingSession(
    payload: CreateReadingSessionInput
  ): Promise<ReadingSession> {
    const readingSession = await this.request<ApiEnvelope<ReadingSession>>(
      "POST",
      "/reading-sessions",
      buildReadingSessionRequest(payload)
    );

    await this.request<ApiEnvelope<Record<string, never>>>(
      "POST",
      "/activity-days",
      buildActivityDayRequest(payload, this.timeZone)
    );

    return readingSession.data;
  }

  async getActivityDays(): Promise<ActivityDay[]> {
    const response = await this.request<ApiEnvelope<ActivityDay[]>>(
      "GET",
      `/activity-days?${getActivityDaysQueryString()}`
    );

    return response.data;
  }
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
}

function buildRequestError(
  method: RequestMethod,
  endpoint: string,
  response: Response,
  payload: unknown
): string {
  const message =
    typeof payload === "object" && payload !== null
      ? "message" in payload &&
        typeof payload.message === "string" &&
        payload.message.trim()
        ? payload.message
        : "error" in payload &&
            typeof payload.error === "string" &&
            payload.error.trim()
          ? payload.error
          : `Request failed with status ${response.status}`
      : `Request failed with status ${response.status}`;

  return `Quran user API ${method} ${endpoint} failed (${response.status} ${response.statusText}): ${message}`;
}
