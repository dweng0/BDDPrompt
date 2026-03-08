import { useState, useRef, useCallback, useEffect } from "react";
import Peer, { type DataConnection } from "peerjs";
import type { BddDocument } from "../types";

const MAX_PEERS = 3; // host + 3 guests = 4 total

type WebRTCMessage =
  | { type: "doc-update"; doc: BddDocument }
  | { type: "chat-message"; role: "user" | "assistant"; content: string }
  | { type: "presence"; peerId: string };

type UseWebRTCOptions = {
  onDocUpdate?: (doc: BddDocument) => void;
  onChatMessage?: (role: "user" | "assistant", content: string) => void;
};

export type WebRTCState = {
  shareCode: string | null;
  connectedPeers: string[];
  isFull: boolean;
  startHost: () => Promise<string>;
  joinSession: (code: string) => Promise<void>;
  broadcastDoc: (doc: BddDocument) => void;
  broadcastChat: (role: "user" | "assistant", content: string) => void;
  disconnect: () => void;
};

function generateShareCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useWebRTC({ onDocUpdate, onChatMessage }: UseWebRTCOptions = {}): WebRTCState {
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());

  const isFull = connectedPeers.length >= MAX_PEERS;

  const handleData = useCallback(
    (data: unknown) => {
      const msg = data as WebRTCMessage;
      if (msg.type === "doc-update" && onDocUpdate) {
        onDocUpdate(msg.doc);
      } else if (msg.type === "chat-message" && onChatMessage) {
        onChatMessage(msg.role, msg.content);
      }
    },
    [onDocUpdate, onChatMessage]
  );

  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.on("open", () => {
        setConnectedPeers((prev) => [...prev, conn.peer]);
        connectionsRef.current.set(conn.peer, conn);
      });
      conn.on("data", handleData);
      conn.on("close", () => {
        setConnectedPeers((prev) => prev.filter((id) => id !== conn.peer));
        connectionsRef.current.delete(conn.peer);
      });
      conn.on("error", () => {
        setConnectedPeers((prev) => prev.filter((id) => id !== conn.peer));
        connectionsRef.current.delete(conn.peer);
      });
    },
    [handleData]
  );

  const startHost = useCallback(async (): Promise<string> => {
    const code = generateShareCode();
    // Configure with TURN server for fallback when direct connection fails
    const peer = new Peer(code, {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:global.turn.twilio.com:3478",
            username: process.env.TURN_USERNAME,
            credential: process.env.TURN_CREDENTIAL,
          },
        ],
      },
    });
    peerRef.current = peer;

    await new Promise<void>((resolve, reject) => {
      peer.on("open", () => resolve());
      peer.on("error", reject);
    });

    peer.on("connection", (conn) => {
      if (connectionsRef.current.size >= MAX_PEERS) {
        conn.on("open", () => {
          conn.send({ type: "session-full" });
          conn.close();
        });
        return;
      }
      setupConnection(conn);
    });

    setShareCode(code);
    return code;
  }, [setupConnection]);

  const joinSession = useCallback(
    async (code: string): Promise<void> => {
      // Configure with TURN server for fallback when direct connection fails
      const peer = new Peer(undefined, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
              urls: "turn:global.turn.twilio.com:3478",
              username: process.env.TURN_USERNAME,
              credential: process.env.TURN_CREDENTIAL,
            },
          ],
        },
      });
      peerRef.current = peer;

      await new Promise<void>((resolve, reject) => {
        peer.on("open", () => resolve());
        peer.on("error", reject);
      });

      const conn = peer.connect(code);
      setupConnection(conn);
    },
    [setupConnection]
  );

  const broadcastDoc = useCallback((doc: BddDocument) => {
    const msg: WebRTCMessage = { type: "doc-update", doc };
    connectionsRef.current.forEach((conn) => conn.send(msg));
  }, []);

  const broadcastChat = useCallback((role: "user" | "assistant", content: string) => {
    const msg: WebRTCMessage = { type: "chat-message", role, content };
    connectionsRef.current.forEach((conn) => conn.send(msg));
  }, []);

  const disconnect = useCallback(() => {
    connectionsRef.current.forEach((conn) => conn.close());
    connectionsRef.current.clear();
    peerRef.current?.destroy();
    peerRef.current = null;
    setShareCode(null);
    setConnectedPeers([]);
  }, []);

  useEffect(() => {
    return () => {
      peerRef.current?.destroy();
    };
  }, []);

  return {
    shareCode,
    connectedPeers,
    isFull,
    startHost,
    joinSession,
    broadcastDoc,
    broadcastChat,
    disconnect,
  };
}
