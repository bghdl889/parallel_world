import { useState, useEffect } from "react";
import { ChevronLeft, Plus, X, Copy, Check } from "lucide-react";
import { StatusBar } from "./StatusBar";
import type { NavProps, AppState } from "../types";
import type { Participant } from "../lib/challenges";
import { createChallenge, getParticipants, confirmGroup } from "../lib/challenges";

const TAG_LIBRARY = [
  {
    category: "🧠 MBTI",
    color: "#E8E0F4",
    tags: ["INTJ", "INFP", "ENFJ", "ENTP"],
  },
  {
    category: "💼 职场",
    color: "#D0E4F0",
    tags: ["大厂人", "程序员", "设计师", "产品经理", "创业者"],
  },
  {
    category: "🎓 学生",
    color: "#F0D4D0",
    tags: ["学生党", "大学生", "研究生", "留学生"],
  },
  {
    category: "🏠 生活",
    color: "#D4E8E0",
    tags: ["健身达人", "早起党", "摄影爱好者", "美食探店", "旅行控"],
  },
];

const ALL_CHECKPOINTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00",
];

interface TagItem { text: string; color: string }

function getTagColor(text: string): string {
  for (const { color, tags } of TAG_LIBRARY) {
    if (tags.includes(text)) return color;
  }
  const work = ["厂", "程序", "设计", "产品", "创业", "职", "运营", "销售", "市场"];
  const edu  = ["学生", "大学", "研究", "高中", "留学", "备考", "艺术", "教"];
  const life = ["健身", "早起", "摄影", "美食", "旅行", "宠物", "读书", "手账"];
  if (work.some(k => text.includes(k))) return "#D0E4F0";
  if (edu.some(k  => text.includes(k))) return "#F0D4D0";
  if (life.some(k => text.includes(k))) return "#D4E8E0";
  return "#F5E6C8";
}

/* ── Step 1: Form ── */
function FormStep({
  count, setCount, input, setInput, tags, setTags, onNext, navigate,
  challengeName, setChallengeName, challengeDate, setChallengeDate,
  checkpoints, setCheckpoints, submitting,
}: {
  count: 2 | 3 | 4 | 6 | 9;
  setCount: (n: 2 | 3 | 4 | 6 | 9) => void;
  input: string;
  setInput: (v: string) => void;
  tags: TagItem[];
  setTags: (fn: (prev: TagItem[]) => TagItem[]) => void;
  onNext: () => void;
  navigate: NavProps["navigate"];
  challengeName: string;
  setChallengeName: (v: string) => void;
  challengeDate: string;
  setChallengeDate: (v: string) => void;
  checkpoints: string[];
  setCheckpoints: (fn: (prev: string[]) => string[]) => void;
  submitting: boolean;
}) {
  const MAX_TAGS = 2;

  const addTag = (text?: string) => {
    if (tags.length >= MAX_TAGS) {
      alert("标签最多添加2个哦");
      return;
    }
    const val = (text ?? input).trim();
    if (!val || tags.some(t => t.text === val)) return;
    setTags(prev => [...prev, { text: val, color: getTagColor(val) }]);
    if (!text) setInput("");
  };
  const removeTag = (i: number) => setTags(prev => prev.filter((_, idx) => idx !== i));

  const toggleCheckpoint = (cp: string) => {
    setCheckpoints(prev =>
      prev.includes(cp) ? prev.filter(c => c !== cp) : [...prev, cp]
    );
  };

  // Sort checkpoints in display order
  const sortedCheckpoints = [...checkpoints].sort((a, b) => {
    const idxA = ALL_CHECKPOINTS.indexOf(a);
    const idxB = ALL_CHECKPOINTS.indexOf(b);
    return idxA - idxB;
  });

  const checkpointCount = checkpoints.length;
  const valid = challengeName.trim() !== "" && challengeDate !== "" && checkpointCount >= 2 && tags.length > 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", overflow: "hidden" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "2px 20px 12px", gap: 12 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            width: 36, height: 36, borderRadius: 11,
            background: "#F7F2EA", border: "1px solid #E8DED0",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 3px 12px rgba(200,185,165,0.30)",
          }}
        >
          <ChevronLeft size={18} color="#9B8B7E" strokeWidth={2.5} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#2D2D2D" }}>创建挑战</div>
          <div style={{ fontSize: 11, color: "#B0A898", marginTop: 1 }}>
            {checkpointCount >= 2
              ? `${sortedCheckpoints[0]} → ${sortedCheckpoints[sortedCheckpoints.length - 1]} · ${checkpointCount} 个时刻`
              : "选择打卡时刻"
            }
          </div>
        </div>
      </div>

      {/* Content — scrollable */}
      <div style={{ flex: 1, padding: "0 20px", overflowY: "auto", paddingBottom: 80 }}>
        <div style={{
          background: "#FFFCF8", borderRadius: 20, padding: "18px 18px",
          border: "1px solid #F0E8E0", boxShadow: "0 4px 24px rgba(232,224,216,0.45)",
        }}>

          {/* 挑战名称 */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D", marginBottom: 10, letterSpacing: "-0.3px" }}>
            挑战名称
          </div>
          <input
            value={challengeName}
            onChange={e => setChallengeName(e.target.value)}
            placeholder="给挑战起个名字，如：工作日挑战"
            style={{
              width: "100%", height: 44, borderRadius: 12,
              background: "#FFFFFF", border: "1px solid #F0E8E0",
              padding: "0 14px", fontSize: 14, color: "#2D2D2D",
              outline: "none", fontFamily: "inherit",
              boxSizing: "border-box",
              boxShadow: "0 1px 6px rgba(232,224,216,0.50)",
              marginBottom: 16,
            }}
          />

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E8E0", margin: "0 -2px 16px" }} />

          {/* 挑战日期 */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D", marginBottom: 10, letterSpacing: "-0.3px" }}>
            挑战日期
          </div>
          <input
            type="date"
            value={challengeDate}
            onChange={e => setChallengeDate(e.target.value)}
            style={{
              width: "100%", height: 44, borderRadius: 12,
              background: "#FFFFFF", border: "1px solid #F0E8E0",
              padding: "0 14px", fontSize: 14, color: "#2D2D2D",
              outline: "none", fontFamily: "inherit",
              boxSizing: "border-box",
              boxShadow: "0 1px 6px rgba(232,224,216,0.50)",
              marginBottom: 16,
              colorScheme: "light",
            }}
          />

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E8E0", margin: "0 -2px 16px" }} />

          {/* 打卡时刻 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px" }}>
              打卡时刻
            </div>
            <div style={{ fontSize: 11, color: checkpointCount >= 2 ? "#9B8B7E" : "#E8A090", fontWeight: 500 }}>
              已选 {checkpointCount} 个{checkpointCount < 2 ? "（至少2个）" : ""}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {ALL_CHECKPOINTS.map(cp => {
              const selected = checkpoints.includes(cp);
              return (
                <button
                  key={cp}
                  onClick={() => toggleCheckpoint(cp)}
                  style={{
                    padding: "6px 12px", borderRadius: 20,
                    background: selected ? "#FEF0ED" : "#FDF8F3",
                    border: selected ? "2px solid #F5A89A" : "2px solid #F0E8E0",
                    fontSize: 12, color: selected ? "#2D2D2D" : "#8A7A70",
                    fontWeight: selected ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                    boxShadow: selected ? "0 2px 10px rgba(245,168,154,0.20)" : "none",
                  }}
                >
                  {cp}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E8E0", margin: "0 -2px 16px" }} />

          {/* 拼图模板 */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D", marginBottom: 10, letterSpacing: "-0.3px" }}>
            拼图模板
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {([
              { count: 2, label: "2人", desc: "2×1", grid: "2×1" },
              { count: 3, label: "3人", desc: "2×2", grid: "2×2" },
              { count: 4, label: "4人", desc: "2×2", grid: "2×2" },
              { count: 6, label: "6人", desc: "3×2", grid: "3×2" },
              { count: 9, label: "9人", desc: "3×3", grid: "3×3" },
            ] as const).slice(0, 3).map(({ count: n, label, desc, grid }) => {
              const on = count === n;
              return (
                <button key={n} onClick={() => setCount(n)} style={{
                  padding: "10px 8px", borderRadius: 14,
                  border: `2.5px solid ${on ? "#F5A89A" : "transparent"}`,
                  background: on ? "#FEF0ED" : "#FDF8F3",
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                  boxShadow: on ? "0 3px 16px rgba(245,168,154,0.25)" : "0 1px 6px rgba(232,224,216,0.40)",
                }}>
                  {/* 网格预览 */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: n === 2 ? "1fr" : "1fr 1fr",
                    gridTemplateRows: n === 2 ? "1fr 1fr" : "1fr 1fr",
                    gap: 2,
                    width: n === 2 ? 16 : 32,
                    height: 32,
                  }}>
                    {Array.from({ length: n === 2 ? 2 : 4 }).map((_, i) => (
                      <div key={i} style={{
                        background: on ? "#F5A89A" : "#E8E0D8",
                        borderRadius: 2,
                        transition: "all 0.15s",
                      }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: on ? 700 : 500, color: on ? "#2D2D2D" : "#8A7A70", textAlign: "center" }}>{label}</div>
                    <div style={{ fontSize: 9, color: "#B0A898", textAlign: "center", marginTop: 1 }}>{grid}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {([
              { count: 6, label: "6人", desc: "3×2", grid: "3×2" },
              { count: 9, label: "9人", desc: "3×3", grid: "3×3" },
            ] as const).map(({ count: n, label, desc, grid }) => {
              const on = count === n;
              return (
                <button key={n} onClick={() => setCount(n)} style={{
                  padding: "10px 8px", borderRadius: 14,
                  border: `2.5px solid ${on ? "#F5A89A" : "transparent"}`,
                  background: on ? "#FEF0ED" : "#FDF8F3",
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                  boxShadow: on ? "0 3px 16px rgba(245,168,154,0.25)" : "0 1px 6px rgba(232,224,216,0.40)",
                }}>
                  {/* 网格预览 */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: n === 6 ? "1fr 1fr 1fr" : "1fr 1fr 1fr",
                    gridTemplateRows: n === 6 ? "1fr 1fr" : "1fr 1fr 1fr",
                    gap: 2,
                    width: 36,
                    height: n === 6 ? 24 : 36,
                  }}>
                    {Array.from({ length: n }).map((_, i) => (
                      <div key={i} style={{
                        background: on ? "#F5A89A" : "#E8E0D8",
                        borderRadius: 2,
                        transition: "all 0.15s",
                      }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: on ? 700 : 500, color: on ? "#2D2D2D" : "#8A7A70", textAlign: "center" }}>{label}</div>
                    <div style={{ fontSize: 9, color: "#B0A898", textAlign: "center", marginTop: 1 }}>{grid}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E8E0", margin: "0 -2px 16px" }} />

          {/* 你的标签 */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D", marginBottom: 10, letterSpacing: "-0.3px" }}>
            你的标签
          </div>

          {/* Tag input with chips inside */}
          <div style={{
            minHeight: 44,
            borderRadius: 12,
            background: "#FFFFFF",
            border: "1px solid #F0E8E0",
            padding: "6px 10px",
            boxShadow: "0 1px 6px rgba(232,224,216,0.50)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 10,
          }}>
            {/* Selected tags as chips */}
            {tags.map((t, i) => (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 6px 3px 8px",
                borderRadius: 40, background: t.color,
                border: "1px solid rgba(0,0,0,0.04)",
              }}>
                <span style={{ fontSize: 11, color: "#4A4A4A", fontWeight: 500, lineHeight: 1 }}>{t.text}</span>
                <button
                  onClick={() => removeTag(i)}
                  style={{
                    width: 14, height: 14, flexShrink: 0,
                    borderRadius: "50%", background: "rgba(0,0,0,0.10)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0,
                  }}
                >
                  <X size={8} color="#6A5A50" strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {/* Input field */}
            {tags.length < MAX_TAGS && (
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder={tags.length === 0 ? "输入你的标签，如：大厂人" : ""}
                style={{
                  flex: 1,
                  minWidth: 100,
                  height: 28,
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "#2D2D2D",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            )}
          </div>

          {/* Tag library — flat always-visible grid */}
          <div style={{ marginTop: 2 }}>
            {TAG_LIBRARY.map(({ category, color, tags: libTags }) => (
              <div key={category} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#C4B8A8", fontWeight: 600, letterSpacing: "0.4px", marginBottom: 6 }}>
                  {category}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {libTags.map(lt => {
                    const already = tags.some(t => t.text === lt);
                    return (
                      <button
                        key={lt}
                        onClick={() => !already && addTag(lt)}
                        style={{
                          padding: "5px 11px", borderRadius: 40, border: "none",
                          background: already ? color : "#EDE6DC",
                          fontSize: 11, color: "#4A4A4A",
                          fontWeight: already ? 600 : 400,
                          cursor: already ? "default" : "pointer",
                          transition: "background 0.18s",
                          fontFamily: "inherit",
                          opacity: already ? 0.7 : 1,
                        }}
                      >
                            {lt}{already ? " ✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
          </div>

          {/* Spacer pushes button to bottom */}
          <div style={{ flex: 1 }} />

          {/* Start button */}
          <button
            onClick={valid && !submitting ? onNext : undefined}
            disabled={!valid || submitting}
            style={{
              width: "100%", height: 52, borderRadius: 48, border: "none",
              background: valid && !submitting ? "#F5A89A" : "#E0D8D0",
              color: "#FFF",
              fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px",
              cursor: valid && !submitting ? "pointer" : "not-allowed",
              boxShadow: valid && !submitting ? "0 6px 28px rgba(245,168,154,0.45)" : "none",
              marginTop: 14,
              transition: "all 0.15s",
            }}
          >
            {submitting ? "创建中..." : "开始挑战 →"}
          </button>
        </div>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}

function AvatarCard({ emoji, tags, isHost, size = 52 }: {
  emoji: string; tags: TagItem[]; isHost?: boolean; size?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: isHost
          ? "linear-gradient(135deg, #F5A89A, #F0C8A0)"
          : "linear-gradient(135deg, #D4E8E0, #C4D8D0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.44,
        boxShadow: isHost
          ? "0 4px 14px rgba(245,168,154,0.40)"
          : "0 4px 14px rgba(168,213,200,0.30)",
      }}>{emoji}</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, maxWidth: size + 16 }}>
        {tags.slice(0, 1).map((t, i) => (
          <span key={i} style={{
            fontSize: 9, color: "#4A4A4A", fontWeight: 500,
            background: t.color, borderRadius: 20, padding: "2px 6px",
            whiteSpace: "nowrap",
          }}>#{t.text}</span>
        ))}
      </div>
      {isHost && (
        <div style={{ fontSize: 9, background: "#F5A89A", color: "#FFF", borderRadius: 20, padding: "2px 7px", fontWeight: 600, marginTop: -2 }}>发起者</div>
      )}
    </div>
  );
}

function EmptySlot({ size = 52 }: { size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "#FDF8F3", border: "2.5px dashed #E8E0D8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: size * 0.38, opacity: 0.28 }}>😊</div>
      </div>
      <div style={{ fontSize: 9, color: "#C4B8A8" }}>等待中</div>
    </div>
  );
}

function AvatarSection({ count, participants, hostTags, expanded, onToggle }: {
  count: 2 | 3 | 4 | 6 | 9;
  participants: Participant[];
  hostTags: TagItem[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const hostEntry = { emoji: "🌿", tags: hostTags.length > 0 ? hostTags : [{ text: "发起者", color: "#F5D4DC" }], isHost: true };
  const otherParticipants = participants.filter(p => !p.is_host);
  const filledCount = 1 + otherParticipants.length; // host + joined members
  const emptyCount = Math.max(0, count - filledCount);

  // Map participants to avatar entries
  const participantEntries = otherParticipants.map(p => ({
    emoji: p.avatar_seed ? String.fromCodePoint(...[0x1F338 + (parseInt(p.avatar_seed.slice(0, 2), 36) % 12)]) : "😊",
    tags: p.tags.map(t => ({ text: t, color: getTagColor(t) })),
    isHost: false,
  }));

  const allSlots: Array<{ type: "filled"; emoji: string; tags: TagItem[]; isHost: boolean } | { type: "empty" }> = [
    { type: "filled", ...hostEntry },
    ...participantEntries.map(m => ({ type: "filled" as const, ...m })),
    ...Array.from({ length: emptyCount }).map(() => ({ type: "empty" as const })),
  ];

  const STACK_SHOW = 3;
  const hiddenCount = count - STACK_SHOW;
  const needsStack = count > STACK_SHOW;

  if (expanded) {
    // Grid layout: 3 cols for ≤9, 2 cols for ≤4
    const cols = count <= 4 ? 2 : 3;
    return (
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "14px 8px",
          justifyItems: "center",
        }}>
          {allSlots.map((slot, i) =>
            slot.type === "filled"
              ? <AvatarCard key={i} emoji={slot.emoji} tags={slot.tags} isHost={slot.isHost} size={48} />
              : <EmptySlot key={i} size={48} />
          )}
        </div>
        <button
          onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 4, margin: "12px auto 0",
            background: "rgba(255,255,255,0.6)", border: "1px solid #E8DED0",
            borderRadius: 20, padding: "5px 14px", cursor: "pointer",
            fontSize: 11, color: "#9B8B7E", fontWeight: 500,
          }}
        >收起 ▲</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
      {/* Stacked avatars: first STACK_SHOW, overlapping */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {allSlots.slice(0, STACK_SHOW).map((slot, i) => (
          <div key={i} style={{ marginLeft: i === 0 ? 0 : -16, zIndex: STACK_SHOW - i }}>
            {slot.type === "filled"
              ? (
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: slot.isHost
                    ? "linear-gradient(135deg, #F5A89A, #F0C8A0)"
                    : "linear-gradient(135deg, #D4E8E0, #C4D8D0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                  boxShadow: "0 0 0 2.5px #FFFCF8, 0 4px 12px rgba(0,0,0,0.10)",
                }}>{slot.emoji}</div>
              )
              : (
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "#FDF8F3", border: "2.5px dashed #E8E0D8",
                  boxShadow: "0 0 0 2px #FFFCF8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 20, opacity: 0.28 }}>😊</div>
                </div>
              )
            }
          </div>
        ))}
      </div>

      {/* +N badge */}
      {needsStack && (
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#9B8B7E",
          background: "rgba(255,255,255,0.65)", border: "1px solid #E8DED0",
          borderRadius: 20, padding: "3px 10px",
          whiteSpace: "nowrap",
        }}>+{hiddenCount} 人</div>
      )}

      {/* Expand button */}
      <button
        onClick={onToggle}
        style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: 3,
          background: "rgba(255,255,255,0.6)", border: "1px solid #E8DED0",
          borderRadius: 20, padding: "5px 12px", cursor: "pointer",
          fontSize: 11, color: "#9B8B7E", fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >展开 ▼</button>
    </div>
  );
}

/* ── Step 2: Invite ── */
function InviteStep({
  count, tags, onBack, navigate, challengeId, challengeName, checkpoints,
}: {
  count: 2 | 3 | 4 | 6 | 9;
  tags: TagItem[];
  onBack: () => void;
  navigate: NavProps["navigate"];
  challengeId: string;
  challengeName: string;
  checkpoints: string[];
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [confirming, setConfirming] = useState(false);

  // Load participants on mount
  useEffect(() => {
    getParticipants(challengeId).then(setParticipants).catch(console.error);
  }, [challengeId]);

  const sortedCheckpoints = [...checkpoints].sort((a, b) => {
    const idxA = ALL_CHECKPOINTS.indexOf(a);
    const idxB = ALL_CHECKPOINTS.indexOf(b);
    return idxA - idxB;
  });

  const inviteLink = `${window.location.origin}/join/${challengeId}`;

  const handleCopy = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: challengeName || "挑战邀请",
          text: `来加入「${challengeName}」挑战吧！`,
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(inviteLink);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // User cancelled share, or clipboard failed — fall back silently
      if ((err as DOMException).name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(inviteLink);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Final fallback — do nothing
        }
      }
    }
  };

  const handleConfirmGroup = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      await confirmGroup(challengeId);
      navigate(`/challenge/${challengeId}`);
    } catch (err) {
      alert("成团失败，请重试");
      console.error(err);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", overflow: "hidden" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "2px 20px 12px", gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 11,
            background: "#F7F2EA", border: "1px solid #E8DED0",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 3px 12px rgba(200,185,165,0.30)",
          }}
        >
          <ChevronLeft size={18} color="#9B8B7E" strokeWidth={2.5} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px" }}>邀请好友</div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Content — no scroll */}
      <div style={{ flex: 1, padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Invite card */}
        <div style={{
          background: "#FFFCF8", borderRadius: 20,
          border: "1px solid #F0E8E0",
          boxShadow: "0 4px 24px rgba(232,224,216,0.55)",
          overflow: "hidden", flex: 1,
          display: "flex", flexDirection: "column",
        }}>

          {/* Top gradient area */}
          <div style={{
            background: "linear-gradient(135deg, #FEF0ED 0%, #F3EEFF 100%)",
            padding: "20px 20px 22px",
            position: "relative", overflow: "hidden",
            flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(245,168,154,0.10)" }} />
            <div style={{ position: "absolute", left: -16, bottom: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(168,213,200,0.10)" }} />

            {/* Challenge badge */}
            <div style={{ textAlign: "center", marginBottom: 18, position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.65)", borderRadius: 20,
                padding: "5px 14px", marginBottom: 5,
                border: "1px solid #F0E8E0",
              }}>
                <span style={{ fontSize: 13 }}>⏱️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A" }}>{challengeName} · {count} 人</span>
              </div>
              <div style={{ fontSize: 11, color: "#B0A898" }}>
                {sortedCheckpoints.length >= 2
                  ? `${sortedCheckpoints[0]} → ${sortedCheckpoints[sortedCheckpoints.length - 1]} · ${sortedCheckpoints.length} 个时刻`
                  : ""
                }
              </div>
            </div>

            {/* Avatar Stack / Grid */}
            <AvatarSection count={count} participants={participants} hostTags={tags} expanded={expanded} onToggle={() => setExpanded(v => !v)} />

          </div>

          {/* Bottom: QR + time slots */}
          <div style={{ padding: "14px 18px 16px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Mini QR */}
              <div style={{
                width: 60, height: 60, borderRadius: 10,
                background: "#FDF8F3", border: "1px solid #F0E8E0",
                padding: 6, flexShrink: 0, boxSizing: "border-box",
              }}>
                <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1.2 }}>
                  {[1,1,1,1,1,1,1, 1,0,0,0,0,0,1, 1,0,1,1,1,0,1, 1,0,1,0,1,0,1, 1,0,1,1,1,0,1, 1,0,0,0,0,0,1, 1,1,1,1,1,1,1].map((f, i) => (
                    <div key={i} style={{ background: f ? "#2D2D2D" : "transparent", borderRadius: 1 }} />
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#2D2D2D", marginBottom: 3 }}>扫码加入挑战</div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {sortedCheckpoints.map(h => (
                    <div key={h} style={{ fontSize: 8, color: "#B0A898", background: "#F5E6C8", borderRadius: 4, padding: "2px 4px" }}>{h}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            width: "100%", height: 52, borderRadius: 48, border: "none",
            background: "#F5A89A", color: "#FFF",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 6px 28px rgba(245,168,154,0.45)",
            letterSpacing: "-0.2px",
            flexShrink: 0,
          }}
        >
          {copied ? <><Check size={17} /> 已复制链接</> : <><Copy size={15} /> 复制邀请链接</>}
        </button>

        {/* 直接成团 button */}
        <button
          onClick={handleConfirmGroup}
          disabled={confirming}
          style={{
            width: "100%", height: 44, borderRadius: 48, border: "none",
            background: "#EDE6DC", color: "#6A5A50",
            fontSize: 14, fontWeight: 600, cursor: confirming ? "not-allowed" : "pointer",
            flexShrink: 0,
            opacity: confirming ? 0.6 : 1,
          }}
        >
          {confirming ? "成团中..." : "直接成团 →"}
        </button>
      </div>
    </div>
  );
}

/* ── Main export ── */
export function CreatePage({ navigate, appState }: NavProps & { appState: AppState }) {
  const [step, setStep]   = useState<"form" | "invite">("form");
  const [count, setCount] = useState<2 | 3 | 4 | 6 | 9>(2);
  const [challengeId, setChallengeId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // 当count改变时，同步到全局状态
  const handleCountChange = (n: 2 | 3 | 4 | 6 | 9) => {
    setCount(n);
    appState.setTemplate(n);
  };
  const [input, setInput] = useState("");
  const [tags, setTags]   = useState<TagItem[]>([{ text: "大厂人", color: "#D0E4F0" }]);
  const [challengeName, setChallengeName] = useState("");
  const [challengeDate, setChallengeDate] = useState("");
  const [checkpoints, setCheckpoints] = useState<string[]>([]);

  const handleNext = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const sortedCheckpoints = [...checkpoints].sort((a, b) => {
        const idxA = ALL_CHECKPOINTS.indexOf(a);
        const idxB = ALL_CHECKPOINTS.indexOf(b);
        return idxA - idxB;
      });

      const id = await createChallenge({
        name: challengeName.trim(),
        challengeDate,
        checkpoints: sortedCheckpoints,
        template: count,
        tags: tags.map(t => t.text),
      });
      setChallengeId(id);
      navigate(`/invite/${id}`);
    } catch (err) {
      alert("创建挑战失败，请重试");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "invite" && challengeId) {
    return (
      <InviteStep
        count={count}
        tags={tags}
        onBack={() => setStep("form")}
        navigate={navigate}
        challengeId={challengeId}
        challengeName={challengeName}
        checkpoints={checkpoints}
      />
    );
  }

  return (
    <FormStep
      count={count}
      setCount={handleCountChange}
      input={input}
      setInput={setInput}
      tags={tags}
      setTags={setTags}
      onNext={handleNext}
      navigate={navigate}
      challengeName={challengeName}
      setChallengeName={setChallengeName}
      challengeDate={challengeDate}
      setChallengeDate={setChallengeDate}
      checkpoints={checkpoints}
      setCheckpoints={setCheckpoints}
      submitting={submitting}
    />
  );
}
