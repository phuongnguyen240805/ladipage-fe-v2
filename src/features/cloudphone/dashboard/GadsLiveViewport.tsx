"use client";

import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { DeviceData } from "./types";

type StreamStatus = "connecting" | "webrtc" | "mjpeg" | "error";

interface GadsLiveViewportProps {
  device: DeviceData;
  gadsUrl: string;
  token: string;
  onLog: (message: string) => void;
}

const proxyUrl = (path: string, gadsUrl: string, token?: string) => {
  const params = new URLSearchParams({ gadsUrl });
  if (token) params.set("token", token);
  return `/api/gads/${path}?${params.toString()}`;
};

const websocketUrl = (gadsUrl: string, path: string, token: string) => {
  const url = new URL(gadsUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = path;
  url.search = new URLSearchParams({ token }).toString();
  return url.toString();
};

export default function GadsLiveViewport({
  device,
  gadsUrl,
  token,
  onLog,
}: GadsLiveViewportProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const signalRef = useRef<WebSocket | null>(null);
  const lockRef = useRef<WebSocket | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [status, setStatus] = useState<StreamStatus>("connecting");

  const udid = device.gads?.udid || device.serial;
  const dimensions = {
    width: device.gads?.screenWidth || 1080,
    height: device.gads?.screenHeight || 1920,
  };

  const callDevice = useCallback(
    async (action: string, body?: Record<string, unknown>) => {
      const response = await fetch(
        proxyUrl(`device/${encodeURIComponent(udid)}/${action}`, gadsUrl),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : "{}",
        },
      );
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`${response.status}: ${detail}`);
      }
    },
    [gadsUrl, token, udid],
  );

  useEffect(() => {
    if (!token || !udid) return;
    const lock = new WebSocket(
      websocketUrl(
        gadsUrl,
        `/devices/control/${encodeURIComponent(udid)}/in-use`,
        token,
      ),
    );
    lock.onmessage = () => {
      if (lock.readyState === WebSocket.OPEN) lock.send("pong");
    };
    lock.onerror = () => onLog("Không thể giữ khóa phiên điều khiển GADS.");
    lockRef.current = lock;
    return () => {
      lock.close();
      lockRef.current = null;
    };
  }, [gadsUrl, onLog, token, udid]);

  useEffect(() => {
    let disposed = false;

    const fallbackToMjpeg = (reason: string) => {
      if (disposed) return;
      onLog(`${reason} Chuyển sang MJPEG.`);
      setStatus("mjpeg");
    };

    const start = async () => {
      setStatus("connecting");
      if (!token) {
        fallbackToMjpeg("Chưa có token để mở WebRTC.");
        return;
      }

      try {
        const iceResponse = await fetch(proxyUrl("ice-config", gadsUrl), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!iceResponse.ok) throw new Error(`ICE config ${iceResponse.status}`);
        const { iceServers = [] } = await iceResponse.json();
        const peer = new RTCPeerConnection({ iceServers });
        peerRef.current = peer;

        peer.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            void videoRef.current.play();
          }
          setStatus("webrtc");
          onLog("WebRTC đã nhận luồng video.");
        };
        peer.onconnectionstatechange = () => {
          if (peer.connectionState === "failed") {
            fallbackToMjpeg("WebRTC thất bại.");
          }
        };

        const signal = new WebSocket(
          websocketUrl(
            gadsUrl,
            `/device/${encodeURIComponent(udid)}/${
              device.os.toLowerCase().includes("ios")
                ? "ios-webrtc"
                : "android-webrtc"
            }`,
            token,
          ),
        );
        signalRef.current = signal;

        signal.onmessage = async ({ data }) => {
          const message = JSON.parse(String(data));
          if (message.type === "answer") {
            await peer.setRemoteDescription({ type: "answer", sdp: message.sdp });
          } else if (message.type === "candidate" && message.candidate) {
            await peer.addIceCandidate(message.candidate);
          } else if (message.type === "error") {
            fallbackToMjpeg(`GADS WebRTC: ${message.message || "lỗi signaling"}.`);
          }
        };
        signal.onerror = () => fallbackToMjpeg("Không mở được signaling WebRTC.");
        signal.onopen = async () => {
          peer.onicecandidate = ({ candidate }) => {
            if (candidate && signal.readyState === WebSocket.OPEN) {
              signal.send(JSON.stringify({ type: "candidate", candidate }));
            }
          };
          peer.addTransceiver("video", { direction: "recvonly" });
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          signal.send(JSON.stringify({ type: "offer", sdp: offer.sdp }));
          onLog("Đã gửi WebRTC offer đến GADS.");
        };
      } catch (error) {
        fallbackToMjpeg(
          `Không khởi tạo được WebRTC: ${
            error instanceof Error ? error.message : "unknown error"
          }.`,
        );
      }
    };

    void start();
    return () => {
      disposed = true;
      if (signalRef.current?.readyState === WebSocket.OPEN) {
        signalRef.current.send(JSON.stringify({ type: "hangup" }));
      }
      signalRef.current?.close();
      signalRef.current = null;
      peerRef.current?.close();
      peerRef.current = null;
    };
  }, [device.os, gadsUrl, onLog, token, udid]);

  const toDevicePoint = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.round(((event.clientX - rect.left) / rect.width) * dimensions.width),
      y: Math.round(((event.clientY - rect.top) / rect.height) * dimensions.height),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = toDevicePoint(event);
  };

  const handlePointerUp = async (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;
    const end = toDevicePoint(event);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    try {
      if (distance > 24) {
        await callDevice("swipe", {
          x: start.x,
          y: start.y,
          endX: end.x,
          endY: end.y,
        });
        onLog(`Swipe (${start.x}, ${start.y}) → (${end.x}, ${end.y}).`);
      } else {
        await callDevice("tap", start);
        onLog(`Tap (${start.x}, ${start.y}).`);
      }
    } catch (error) {
      onLog(`Điều khiển thất bại: ${error instanceof Error ? error.message : error}`);
    }
  };

  const mjpegPath = device.os.toLowerCase().includes("ios")
    ? "ios-stream-mjpeg"
    : "android-stream-mjpeg";

  return (
    <div
      className="relative h-full w-full touch-none select-none overflow-hidden bg-black"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStartRef.current = null;
      }}
      title="Nhấn để tap, kéo để swipe"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`h-full w-full object-contain ${status === "webrtc" ? "block" : "hidden"}`}
      />
      {status === "mjpeg" && (
        // GADS returns multipart JPEG frames; an img element renders this stream natively.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxyUrl(
            `device/${encodeURIComponent(udid)}/${mjpegPath}`,
            gadsUrl,
            token,
          )}
          alt={`Màn hình ${device.name}`}
          className="h-full w-full object-contain"
          onError={() => setStatus("error")}
        />
      )}
      {(status === "connecting" || status === "error") && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[10px] font-bold text-white/75">
          {status === "connecting"
            ? "Đang kết nối màn hình trực tiếp…"
            : "Không nhận được hình ảnh. Kiểm tra provider và stream của thiết bị."}
        </div>
      )}
      <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/65 px-2 py-1 text-[8px] font-black uppercase text-white">
        {status}
      </div>
    </div>
  );
}
