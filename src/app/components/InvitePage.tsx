import { useState, useEffect } from "react";
import { Check, Copy, ImageDown, ChevronLeft } from "lucide-react";
import { StatusBar } from "./StatusBar";
import type { NavProps } from "../types";
import type { Challenge, Participant } from "../types";
import { getChallenge, getParticipants, confirmGroup } from "../lib/challenges";
import { subscribeToChallenge, unsubscribeChannel } from "../lib/realtime";

/* ── Deterministic emoji from avatar_seed ── */
const EMOJI_POOL = [
  "🌿", "🌸", "🐱", "🎨", "🍄", "🦊", "🌻", "🐰",
  "🍃", "🌙", "🐝", "🌊", "🍀", "🦋", "🌺", "🐻",
  "🍊", "🦉", "🌈", "🌵", "🐥", "🍎", "🐧", "🌴",
];

function seedToEmoji(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return EMOJI_POOL[Math.abs(hash) % EMOJI_POOL.length];
}

/* ── Format date/time helpers ── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatCheckpoints(checkpoints: string[]): { display: string; count: number } {
  if (!checkpoints || checkpoints.length === 0) return { display: "", count: 0 };
  return {
    display: checkpoints.join(" → "),
    count: checkpoints.length,
  };
}

/* ── Main export ── */
export function InvitePage({ navigate, challengeId }: NavProps & { challengeId?: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  /* ── Load data on mount ── */
  useEffect(() => {
    if (!challengeId) {
      setError("缺少挑战 ID");
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof subscribeToChallenge> | null = null;

    (async () => {
      try {
        const [ch, pts] = await Promise.all([
          getChallenge(challengeId),
          getParticipants(challengeId),
        ]);

        if (!ch) {
          setError("挑战不存在");
          setLoading(false);
          return;
        }

        setChallenge(ch);
        setParticipants(pts);
        setLoading(false);

        // Subscribe to realtime participant changes
        channel = subscribeToChallenge(challengeId, {
          onStatusChange: (status) => {
            if (status === "active") {
              navigate(`/challenge/${challengeId}`);
            }
          },
          onParticipantJoin: (participant) => {
            setParticipants((prev) => {
              // Avoid duplicates
              if (prev.some((p) => p.id === participant.id)) return prev;
              return [...prev, participant as Participant];
            });
          },
        });
      } catch (err: any) {
        setError(err.message || "加载失败");
        setLoading(false);
      }
    })();

    return () => {
      if (channel) {
        unsubscribeChannel(channel);
      }
    };
  }, [challengeId]);

  /* ── Copy / share invite link ── */
  const handleCopy = async () => {
    const url = `${window.location.origin}/join/${challengeId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: challenge?.name || "加入挑战", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User cancelled share or clipboard failed — ignore
    }
  };

  /* ── Confirm group (直接成团) ── */
  const handleConfirmGroup = async () => {
    if (!challengeId || confirming) return;
    setConfirming(true);
    try {
      await confirmGroup(challengeId);
      navigate(`/challenge/${challengeId}`);
    } catch (err: any) {
      setError(err.message || "成团失败");
    } finally {
      setConfirming(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3" }}>
        <StatusBar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, color: "#B0A898" }}>加载中...</div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !challenge) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3" }}>
        <StatusBar />
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "2px 20px 16px", gap: 12 }}>
          <button
            onClick={() => navigate("/create")}
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: "#FFFCF8", border: "1px solid #F0E8E0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(232,224,216,0.50)",
            }}
          >
            <ChevronLeft size={18} color="#6A5A50" />
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px" }}>邀请好友</div>
          </div>
          <div style={{ width: 36 }} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ fontSize: 14, color: "#A8A0A0", textAlign: "center" }}>{error || "挑战不存在"}</div>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const { display: checkpointDisplay, count: checkpointCount } = formatCheckpoints(challenge.checkpoints);
  const host = participants.find((p) => p.is_host);
  const friends = participants.filter((p) => !p.is_host);
  const spotsLeft = challenge.template - participants.length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3" }}>
      <StatusBar />

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "2px 20px 16px", gap: 12 }}>
        <button
          onClick={() => navigate("/create")}
          style={{
            width: 36, height: 36, borderRadius: 11,
            background: "#FFFCF8", border: "1px solid #F0E8E0",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(232,224,216,0.50)",
          }}
        >
          <ChevronLeft size={18} color="#6A5A50" />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px" }}>邀请好友</div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>

        {/* ── Big invite card ── */}
        <div style={{
          background: "#FFFCF8",
          borderRadius: 20,
          border: "1px solid #F0E8E0",
          boxShadow: "0 4px 24px rgba(232,224,216,0.55)",
          overflow: "hidden",
          marginBottom: 20,
        }}>
          {/* Card top gradient strip */}
          <div style={{
            background: "linear-gradient(135deg, #FEF0ED 0%, #F3EEFF 100%)",
            padding: "20px 20px 24px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 120, height: 120, borderRadius: "50%", background: "rgba(245,168,154,0.10)" }} />
            <div style={{ position: "absolute", left: -16, bottom: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(168,213,200,0.10)" }} />

            {/* Challenge info */}
            <div style={{ textAlign: "center", marginBottom: 22, position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.65)", borderRadius: 20,
                padding: "5px 14px", marginBottom: 6,
                border: "1px solid #F0E8E0",
              }}>
                <span style={{ fontSize: 14 }}>🏢</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A" }}>{challenge.name}</span>
              </div>
              <div style={{ fontSize: 12, color: "#B0A898" }}>{formatDate(challenge.challenge_date)} &nbsp;·&nbsp; {checkpointDisplay} · {checkpointCount} 个时刻</div>
            </div>

            {/* Avatars row: host + friends + empty spots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
              {/* Host avatar */}
              {host && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg, #F5A89A, #F0C8A0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34,
                    boxShadow: "0 4px 16px rgba(245,168,154,0.40)",
                  }}>{seedToEmoji(host.avatar_seed)}</div>
                  {host.tags.length > 0 && (
                    <span style={{
                      fontSize: 10, color: "#4A4A4A", fontWeight: 500,
                      background: "#F5D4DC", borderRadius: 20, padding: "2px 8px",
                    }}>#{host.tags[0]}</span>
                  )}
                  <div style={{
                    fontSize: 10, background: "#F5A89A", color: "#FFF",
                    borderRadius: 20, padding: "2px 10px", fontWeight: 600,
                  }}>发起者</div>
                </div>
              )}

              {/* Friend avatars — joined participants */}
              {friends.map((friend) => (
                <div key={friend.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg, #A8D5C8, #C8E8D8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34,
                    boxShadow: "0 4px 16px rgba(168,213,200,0.40)",
                  }}>{seedToEmoji(friend.avatar_seed)}</div>
                  {friend.tags.length > 0 && (
                    <span style={{
                      fontSize: 10, color: "#2A6B5C", fontWeight: 500,
                      background: "#D4E8E0", borderRadius: 20, padding: "2px 8px",
                    }}>#{friend.tags[0]}</span>
                  )}
                  <div style={{
                    fontSize: 10, background: "#A8D5C8", color: "#2A6B5C",
                    borderRadius: 20, padding: "2px 10px", fontWeight: 600,
                  }}>已加入</div>
                </div>
              ))}

              {/* Empty spots (dashed waiting avatars) */}
              {Array.from({ length: Math.max(0, spotsLeft) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "#FDF8F3",
                    border: "2.5px dashed #E8E0D8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontSize: 28, opacity: 0.35 }}>😊</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#A8A0A0" }}>好友</div>
                  <div style={{
                    fontSize: 10, background: "#EDE6DC", color: "#A8A0A0",
                    borderRadius: 20, padding: "2px 10px",
                  }}>等待中</div>
                </div>
              ))}
            </div>

            {/* Waiting hint */}
            {spotsLeft > 0 && (
              <div style={{ textAlign: "center", marginTop: 20, position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, color: "#A8A0A0" }}>等待好友加入... 还差 {spotsLeft} 人</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#E8D8D0",
                      animation: `pulse ${0.9 + i * 0.3}s ease-in-out infinite alternate`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* All slots filled hint */}
            {spotsLeft <= 0 && (
              <div style={{ textAlign: "center", marginTop: 20, position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, color: "#2A6B5C", fontWeight: 600 }}>已满员，可以成团啦！</div>
              </div>
            )}
          </div>

          {/* Card bottom — QR + time slots */}
          <div style={{ padding: "16px 20px 18px" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              {/* Mini QR */}
              <div style={{
                width: 72, height: 72, borderRadius: 12,
                background: "#FDF8F3", border: "1px solid #F0E8E0",
                padding: 8, flexShrink: 0, boxSizing: "border-box",
              }}>
                <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1.5 }}>
                  {[1,1,1,1,1,1,1, 1,0,0,0,0,0,1, 1,0,1,1,1,0,1, 1,0,1,0,1,0,1, 1,0,1,1,1,0,1, 1,0,0,0,0,0,1, 1,1,1,1,1,1,1].map((f, i) => (
                    <div key={i} style={{ background: f ? "#2D2D2D" : "transparent", borderRadius: 1 }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2D2D2D", marginBottom: 4 }}>扫码加入挑战</div>
                <div style={{ fontSize: 11, color: "#B0A898", lineHeight: 1.6 }}>好友扫码即可进入加入页<br />开始同步记录今天</div>
              </div>
            </div>

            {/* Time slot chips */}
            <div style={{ marginTop: 12, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {challenge.checkpoints.map(t => (
                <div key={t} style={{ fontSize: 9, color: "#B0A898", background: "#F5E6C8", borderRadius: 5, padding: "3px 5px" }}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <button
          onClick={handleCopy}
          style={{
            width: "100%", height: 56, borderRadius: 48, border: "none",
            background: "#F5A89A", color: "#FFF",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 6px 28px rgba(245,168,154,0.45)",
            marginBottom: 12,
            letterSpacing: "-0.2px",
          }}
        >
          {copied
            ? <><Check size={18} /> 已复制链接</>
            : <><Copy size={16} /> 复制邀请链接</>
          }
        </button>

        {/* ── 直接成团 button ── */}
        <button
          onClick={handleConfirmGroup}
          disabled={confirming}
          style={{
            width: "100%", height: 48, borderRadius: 48, border: "none",
            background: confirming ? "#C8E0D8" : "#A8D5C8",
            color: confirming ? "#6A8A80" : "#2A6B5C",
            fontSize: 15, fontWeight: 700, cursor: confirming ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(168,213,200,0.45)",
            marginBottom: 12,
          }}
        >
          {confirming ? "成团中..." : "直接成团"}
        </button>

        <button
          onClick={() => navigate(`/challenge/${challengeId}`)}
          style={{
            width: "100%", height: 48, borderRadius: 48,
            background: "#FFFCF8", color: "#6A5A50",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: "1px solid #F0E8E0",
            boxShadow: "0 2px 12px rgba(232,224,216,0.40)",
            marginBottom: 12,
          }}
        >
          <ImageDown size={16} />
          保存邀请海报
        </button>

        <div style={{ textAlign: "center", fontSize: 11, color: "#C4B8A8", marginTop: 14, lineHeight: 1.7 }}>
          好友收到链接后即可加入挑战<br />挑战开始后双方同步打卡
        </div>
      </div>

    </div>
  );
}
