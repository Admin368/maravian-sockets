import { io, Socket } from "socket.io-client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type UseSocketMaxOptions = {
  serverUrl: string;
  appId: string;
  token?: string;
  autoConnect?: boolean;
};

export type IncomingMessage<TPayload = any> = {
  type: string;
  payload: TPayload;
  ts?: number;
};

export type SocketMaxClient = {
  socket: Socket | null;
  connected: boolean;
  connect: (token?: string) => void;
  disconnect: () => void;
  onTopic: <TPayload = any>(
    topic: string,
    listener: (msg: IncomingMessage<TPayload>) => void
  ) => () => void;
  publish: <TPayload = any>(
    topic: string,
    type: string,
    payload: TPayload,
    room?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  login: (token: string) => void;
  logout: () => void;
  admin: {
    ban: (userId: string) => Promise<{ ok: boolean; error?: string }>;
    unban: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  };
};

const Ctx = createContext<SocketMaxClient | null>(null);

export function SocketMaxProvider({
  children,
  options,
}: {
  children: React.ReactNode;
  options: UseSocketMaxOptions;
}) {
  const { serverUrl, appId, token, autoConnect = true } = options;
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const authTokenRef = useRef<string | undefined>(token);

  const ensureSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;
    const s = io(serverUrl, {
      autoConnect: false,
      transports: ["websocket"],
      auth: () => ({ token: authTokenRef.current }),
      query: { appId },
    });
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    socketRef.current = s;
    return s;
  }, [serverUrl, appId]);

  const connect = useCallback(
    (newToken?: string) => {
      if (newToken) authTokenRef.current = newToken;
      const s = ensureSocket();
      if (!s.connected) s.connect();
    },
    [ensureSocket]
  );

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  const onTopic = useCallback(
    <TPayload = any,>(
      topic: string,
      listener: (msg: IncomingMessage<TPayload>) => void
    ) => {
      const s = ensureSocket();
      s.on(topic, listener as any);
      return () => s.off(topic, listener as any);
    },
    [ensureSocket]
  );

  const publish = useCallback(
    <TPayload = any,>(
      topic: string,
      type: string,
      payload: TPayload,
      room?: string
    ) => {
      return new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const s = ensureSocket();
        s.emit("publish", { appId, topic, type, payload, room }, (ack: any) =>
          resolve(ack)
        );
      });
    },
    [ensureSocket, appId]
  );

  const joinRoom = useCallback(
    (room: string) => {
      ensureSocket().emit("room.join", { room });
    },
    [ensureSocket]
  );

  const leaveRoom = useCallback(
    (room: string) => {
      ensureSocket().emit("room.leave", { room });
    },
    [ensureSocket]
  );

  const login = useCallback(
    (t: string) => {
      authTokenRef.current = t;
      const s = ensureSocket();
      if (s.connected) {
        s.disconnect();
        s.connect();
      }
    },
    [ensureSocket]
  );

  const logout = useCallback(() => {
    authTokenRef.current = undefined;
    const s = ensureSocket();
    if (s.connected) {
      s.disconnect();
      s.connect();
    }
  }, [ensureSocket]);

  useEffect(() => {
    const s = ensureSocket();
    if (autoConnect) s.connect();
    return () => {
      s.close();
    };
  }, [ensureSocket, autoConnect]);

  const admin = useMemo(
    () => ({
      ban: (userId: string) =>
        new Promise<{ ok: boolean; error?: string }>((resolve) => {
          ensureSocket().emit("admin.ban", { userId }, (ack: any) =>
            resolve(ack)
          );
        }),
      unban: (userId: string) =>
        new Promise<{ ok: boolean; error?: string }>((resolve) => {
          ensureSocket().emit("admin.unban", { userId }, (ack: any) =>
            resolve(ack)
          );
        }),
    }),
    [ensureSocket]
  );

  const value = useMemo<SocketMaxClient>(
    () => ({
      socket: socketRef.current,
      connected,
      connect,
      disconnect,
      onTopic,
      publish,
      joinRoom,
      leaveRoom,
      login,
      logout,
      admin,
    }),
    [
      connected,
      connect,
      disconnect,
      onTopic,
      publish,
      joinRoom,
      leaveRoom,
      login,
      logout,
      admin,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMaravianSockets() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useMaravianSockets must be used within SocketMaxProvider");
  return ctx;
}
