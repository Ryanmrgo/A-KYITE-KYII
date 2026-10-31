import React from "react";
import { STREAMING_SERVERS } from "../data/streamingServers";

const S = {
  surface: "#1a1a1a",
  surfaceHigh: "#242424",
  border: "#2a2a2a",
  borderActive: "#e50914",
  text: "#e5e2e1",
  muted: "#9ca3af",
  red: "#e50914",
  redDim: "rgba(229, 9, 20, 0.15)",
};

export default function ServerSelector({ currentServerId, onSelectServer }) {
  return (
    <div
      style={{
        marginTop: "1rem",
        marginBottom: "1rem",
        padding: "0.85rem 1rem",
        backgroundColor: S.surface,
        borderRadius: "10px",
        border: `1px solid ${S.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
            }}
          />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: S.text }}>
            Streaming Server
          </span>
        </div>
        <span style={{ fontSize: "0.75rem", color: S.muted }}>
          If the video is slow or not playing, switch to a backup server
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          scrollbarWidth: "thin",
        }}
      >
        {STREAMING_SERVERS.map((server) => {
          const isActive = server.id === currentServerId;
          return (
            <button
              key={server.id}
              onClick={() => onSelectServer(server.id)}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                border: `1px solid ${isActive ? S.borderActive : S.border}`,
                backgroundColor: isActive ? S.redDim : S.surfaceHigh,
                color: isActive ? "#ffffff" : S.muted,
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#444";
                  e.currentTarget.style.color = S.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = S.border;
                  e.currentTarget.style.color = S.muted;
                }
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                {isActive && <span style={{ color: S.red }}>▶</span>}
                {server.name}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: isActive ? "#fca5a5" : "#6b7280",
                  marginTop: "0.15rem",
                }}
              >
                {server.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
