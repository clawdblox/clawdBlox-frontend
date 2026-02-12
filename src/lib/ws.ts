import { config } from './config';
import { getStoredApiKey } from './api';

// ─── Types ───────────────────────────────────────────────────

/** Close codes returned by the MemoryWeave WebSocket server (must match packages/shared/constants/ws-codes.ts). */
const WS_CLOSE_CODES = {
  AUTH_FAILED: 4000,
  INACTIVITY_TIMEOUT: 4001,
  CONNECTION_LIMIT: 4002,
  RATE_LIMITED: 4003,
  INVALID_FORMAT: 4004,
  SERVER_SHUTDOWN: 4005,
} as const;

/** Close codes that indicate a permanent failure -- do NOT reconnect. */
const NO_RECONNECT_CODES = new Set([
  WS_CLOSE_CODES.AUTH_FAILED,
  WS_CLOSE_CODES.CONNECTION_LIMIT,
]);

type DisconnectReason =
  | 'manual'
  | 'auth_timeout'
  | 'auth_failed'
  | 'rate_limited'
  | 'invalid_message'
  | 'connection_limit'
  | 'inactivity_timeout'
  | 'error'
  | 'unknown';

interface ChatTokenData {
  token: string;
}

interface ChatEndData {
  conversation_id: string;
}

interface ChatErrorData {
  code: string;
  message: string;
}

interface WsMessage {
  type: string;
  data?: unknown;
}

interface WebSocketServiceCallbacks {
  /** Fires once the connection is open and authenticated. */
  onConnected?: () => void;
  /** Fires when the connection closes for any reason. */
  onDisconnected?: (reason: DisconnectReason, code?: number) => void;
  /** Fires for each streamed token from the NPC response. */
  onChatToken?: (data: ChatTokenData) => void;
  /** Fires when the NPC response stream is complete. */
  onChatEnd?: (data: ChatEndData) => void;
  /** Fires when a chat-level error occurs. */
  onChatError?: (data: ChatErrorData) => void;
  /** Fires when the service begins a reconnection attempt. */
  onReconnecting?: (attempt: number, maxAttempts: number) => void;
}

// ─── Reconnection constants ──────────────────────────────────

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const MAX_RECONNECT_ATTEMPTS = 10;
const HEARTBEAT_INTERVAL_MS = 25_000;

// ─── Service ─────────────────────────────────────────────────

class WebSocketService {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private intentionalClose = false;
  private _connected = false;

  // Public callback hooks -- consumers assign these directly.
  public onConnected: WebSocketServiceCallbacks['onConnected'] = undefined;
  public onDisconnected: WebSocketServiceCallbacks['onDisconnected'] = undefined;
  public onChatToken: WebSocketServiceCallbacks['onChatToken'] = undefined;
  public onChatEnd: WebSocketServiceCallbacks['onChatEnd'] = undefined;
  public onChatError: WebSocketServiceCallbacks['onChatError'] = undefined;
  public onReconnecting: WebSocketServiceCallbacks['onReconnecting'] = undefined;

  /** Whether the socket is currently open and authenticated. */
  get connected(): boolean {
    return this._connected;
  }

  // ── Public API ───────────────────────────────────────────

  /**
   * Open the WebSocket connection.
   * If already connected this is a no-op.
   */
  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;
    this.openSocket();
  }

  /**
   * Gracefully close the connection. No reconnection will be attempted.
   */
  disconnect(): void {
    this.intentionalClose = true;
    this.cleanup();
  }

  /**
   * Send a chat message to an NPC via the WebSocket.
   *
   * @param npcId   - The target NPC's UUID.
   * @param message - The player's message text.
   * @param playerId - Optional player identifier (for player-auth flows).
   */
  sendChatMessage(npcId: string, message: string, playerId?: string): void {
    const payload: WsMessage = {
      type: 'chat',
      data: {
        npc_id: npcId,
        message,
        ...(playerId !== undefined && { player_id: playerId }),
      },
    };
    this.send(payload);
  }

  // ── Internal: socket lifecycle ───────────────────────────

  private openSocket(): void {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      console.error('[WS] Cannot connect: no API key stored.');
      return;
    }

    const url = `${config.wsUrl}?api_key=${encodeURIComponent(apiKey)}`;

    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.error('[WS] Failed to create WebSocket:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  // ── Event handlers (arrow fns to preserve `this`) ────────

  private handleOpen = (): void => {
    this._connected = true;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.onConnected?.();
  };

  private handleMessage = (event: MessageEvent): void => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(event.data as string) as WsMessage;
    } catch {
      console.warn('[WS] Received non-JSON message:', event.data);
      return;
    }

    switch (msg.type) {
      case 'pong':
        // Heartbeat acknowledged -- nothing to do.
        break;

      case 'chat:token':
        this.onChatToken?.(msg.data as ChatTokenData);
        break;

      case 'chat:end':
        this.onChatEnd?.(msg.data as ChatEndData);
        break;

      case 'chat:error':
        this.onChatError?.(msg.data as ChatErrorData);
        break;

      default:
        // Ignore unknown message types gracefully.
        break;
    }
  };

  private handleClose = (event: CloseEvent): void => {
    const reason = closeCodeToReason(event.code);
    this._connected = false;
    this.stopHeartbeat();

    this.onDisconnected?.(reason, event.code);

    if (this.intentionalClose) {
      return;
    }

    // Do not reconnect on permanent auth / limit failures.
    if (NO_RECONNECT_CODES.has(event.code)) {
      return;
    }

    this.scheduleReconnect();
  };

  private handleError = (): void => {
    // The browser fires `onerror` before `onclose`, so we let `onclose`
    // drive the reconnection logic. Nothing extra needed here.
  };

  // ── Heartbeat ────────────────────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ── Reconnection ────────────────────────────────────────

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WS] Maximum reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;

    const backoff = Math.min(
      INITIAL_BACKOFF_MS * Math.pow(2, this.reconnectAttempts - 1),
      MAX_BACKOFF_MS,
    );

    this.onReconnecting?.(this.reconnectAttempts, MAX_RECONNECT_ATTEMPTS);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, backoff);
  }

  // ── Helpers ──────────────────────────────────────────────

  private send(msg: WsMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send -- socket is not open.');
      return;
    }
    this.ws.send(JSON.stringify(msg));
  }

  /**
   * Full teardown: close socket, clear timers, reset state.
   */
  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Remove handlers to prevent stale callbacks during close.
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this._connected = false;
    this.reconnectAttempts = 0;
  }
}

// ─── Utility ─────────────────────────────────────────────────

function closeCodeToReason(code: number): DisconnectReason {
  switch (code) {
    case WS_CLOSE_CODES.AUTH_FAILED:
      return 'auth_failed';
    case WS_CLOSE_CODES.INACTIVITY_TIMEOUT:
      return 'inactivity_timeout';
    case WS_CLOSE_CODES.CONNECTION_LIMIT:
      return 'connection_limit';
    case WS_CLOSE_CODES.RATE_LIMITED:
      return 'rate_limited';
    case WS_CLOSE_CODES.INVALID_FORMAT:
      return 'invalid_message';
    case WS_CLOSE_CODES.SERVER_SHUTDOWN:
      return 'unknown';
    default:
      return 'unknown';
  }
}

// ─── Singleton export ────────────────────────────────────────

export const wsService = new WebSocketService();
export type { ChatTokenData, ChatEndData, ChatErrorData, DisconnectReason, WebSocketServiceCallbacks };
