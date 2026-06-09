import { useState, useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { StatusBar } from "./StatusBar";
import type { NavProps, AppState, Challenge, Participant } from "../types";
import { getChallenge, getParticipants, joinChallenge } from "../lib/challenges";

const TAG_LIBRARY = [
  { category: "🧠 MBTI", color: "#E8E0F4", tags: ["INTJ", "INFP", "ENFJ", "ENTP"] },
  { category: "💼 职场", color: "#D0E4F0", tags: ["大厂人", "程序员", "设计师", "产品经理", "创业者"] },
  { category: "🎓 学生", color: "#F0D4D0", tags: ["学生党", "大学生", "研究生", "留学生"] },
  { category: "🏠 生活", color: "#D4E8E0", tags: ["健身达人", "早起党", "摄影爱好者", "美食探店", "旅行控"] },
];

const EMOJIS = ["🌿", "🌸", "🌺", "🍀", "🌻", "🍁", "🌙", "⭐", "💫"];

function avatarEmoji(seed: string) {
  return EMOJIS[Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % EMOJIS.length];
}

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

export function JoinPage({ navigate, appState, challengeId }: NavProps & { appState: AppState; challengeId?: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [host, setHost] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<TagItem[]>([]);
  const MAX_TAGS = 2;

  // Load challenge data
  useEffect(() => {
    if (!challengeId) { setLoading(false); return; }
    (async () => {
      try {
        const [ch, parts] = await Promise.all([getChallenge(challengeId), getParticipants(challengeId)]);
        if (ch) setChallenge(ch);
        const h = parts.find(p => p.is_host);
        if (h) setHost(h);
      } catch (err) { console.error("Failed to load challenge:", err); }
      finally { setLoading(false); }
    })();
  }, [challengeId]);

  const addTag = (text?: string) => {
    if (tags.length >= MAX_TAGS) { alert("标签最多添加2个哦"); return; }
    const val = (text ?? input).trim();
    if (!val || tags.some(t => t.text === val)) return;
    setTags(prev => [...prev, { text: val, color: getTagColor(val) }]);
    if (!text) setInput("");
  };

  const removeTag = (i: number) => setTags(prev => prev.filter((_, idx) => idx !== i));

  const handleJoin = async () => {
    if (tags.length === 0) { alert("请至少选择一个标签"); return; }
    if (!challengeId) return;
    setJoining(true);
    try {
      await joinChallenge(challengeId, tags.map(t => t.text));
      navigate(`/invite/${challengeId}`);
    } catch (err: any) {
      alert(err.message || "加入失败，请重试");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", alignItems: "center", justifyContent: "center", color: "#B0A898", fontSize: 14 }}>加载中...</div>;
  }

  if (!challenge) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", alignItems: "center", justifyContent: "center", color: "#B0A898", gap: 12 }}>
        <div>挑战不存在或链接已失效</div>
        <button onClick={() => navigate("/")} style={{ padding: "8px 20px", borderRadius: 20, background: "#F5A89A", color: "#FFF", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>返回首页</button>
      </div>
    );
  }

  const checkpointInfo = challenge.checkpoints.length >= 2
    ? `${challenge.checkpoints[0]} → ${challenge.checkpoints[challenge.checkpoints.length - 1]} · ${challenge.checkpoints.length} 个时刻`
    : `${challenge.checkpoints.length} 个时刻`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", overflow: "hidden" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "2px 20px 12px", gap: 12 }}>
        <button onClick={() => navigate("/")} style={{ width: 36, height: 36, borderRadius: 11, background: "#F7F2EA", border: "1px solid #E8DED0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 12px rgba(200,185,165,0.30)" }}>
          <ChevronLeft size={18} color="#9B8B7E" strokeWidth={2.5} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#2D2D2D" }}>加入挑战</div>
          <div style={{ fontSize: 11, color: "#B0A898", marginTop: 1 }}>选择你的身份标签</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ background: "#FFFCF8", borderRadius: 20, padding: "18px 18px", border: "1px solid #F0E8E0", boxShadow: "0 4px 24px rgba(232,224,216,0.45)", flex: 1, display: "flex", flexDirection: "column" }}>

          {/* 挑战信息 */}
          <div style={{ background: "linear-gradient(135deg, #FEF0ED 0%, #F3EEFF 100%)", borderRadius: 16, padding: "16px", marginBottom: 20, border: "1px solid #F0E8E0" }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.65)", borderRadius: 20, padding: "5px 14px", marginBottom: 5, border: "1px solid #F0E8E0" }}>
                <span style={{ fontSize: 13 }}>⏱️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A" }}>{challenge.name} · {challenge.template} 人</span>
              </div>
              <div style={{ fontSize: 11, color: "#B0A898" }}>{checkpointInfo}</div>
            </div>

            {/* 发起者信息 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#F5A89A,#F0C8A0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 14px rgba(245,168,154,0.40)" }}>
                  {host ? avatarEmoji(host.avatar_seed) : "🌿"}
                </div>
                {host && host.tags.length > 0 && (
                  <div style={{ fontSize: 10, background: "#F5A89A", color: "#FFF", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>#{host.tags[0]}</div>
                )}
                <div style={{ fontSize: 10, background: "#F5A89A", color: "#FFF", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>发起者</div>
              </div>
              <div style={{ fontSize: 16, color: "#D4C8BE" }}>邀请你</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FDF8F3", border: "2.5px dashed #E8E0D8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 20, opacity: 0.30 }}>😊</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#A8A0A0" }}>你</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E8E0", margin: "0 -2px 16px" }} />

          {/* 你的标签 */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D", marginBottom: 10, letterSpacing: "-0.3px" }}>你的标签</div>

          {/* Tag input */}
          <div style={{ minHeight: 44, borderRadius: 12, background: "#FFFFFF", border: "1px solid #F0E8E0", padding: "6px 10px", boxShadow: "0 1px 6px rgba(232,224,216,0.50)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {tags.map((t, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 6px 3px 8px", borderRadius: 40, background: t.color, border: "1px solid rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: 11, color: "#4A4A4A", fontWeight: 500, lineHeight: 1 }}>{t.text}</span>
                <button onClick={() => removeTag(i)} style={{ width: 14, height: 14, flexShrink: 0, borderRadius: "50%", background: "rgba(0,0,0,0.10)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><X size={8} color="#6A5A50" strokeWidth={2.5} /></button>
              </div>
            ))}
            {tags.length < MAX_TAGS && (
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder={tags.length === 0 ? "输入你的标签，如：学生党" : ""} style={{ flex: 1, minWidth: 100, height: 28, border: "none", background: "transparent", fontSize: 13, color: "#2D2D2D", outline: "none", fontFamily: "inherit" }} />
            )}
          </div>

          {/* Tag library */}
          <div style={{ marginTop: 2 }}>
            {TAG_LIBRARY.map(({ category, color, tags: libTags }) => (
              <div key={category} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#C4B8A8", fontWeight: 600, letterSpacing: "0.4px", marginBottom: 6 }}>{category}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {libTags.map(lt => {
                    const already = tags.some(t => t.text === lt);
                    return (
                      <button key={lt} onClick={() => !already && addTag(lt)} style={{ padding: "5px 11px", borderRadius: 40, border: "none", background: already ? color : "#EDE6DC", fontSize: 11, color: "#4A4A4A", fontWeight: already ? 600 : 400, cursor: already ? "default" : "pointer", transition: "background 0.18s", fontFamily: "inherit", opacity: already ? 0.7 : 1 }}>
                        {lt}{already ? " ✓" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Join button */}
          <button onClick={handleJoin} disabled={joining} style={{ width: "100%", height: 52, borderRadius: 48, border: "none", background: tags.length === 0 ? "#E8E0D8" : "#F5A89A", color: "#FFF", fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", cursor: tags.length === 0 || joining ? "not-allowed" : "pointer", boxShadow: tags.length === 0 ? "none" : "0 6px 28px rgba(245,168,154,0.45)", marginTop: 14, transition: "all 0.2s" }}>
            {joining ? "加入中..." : "加入挑战 →"}
          </button>
        </div>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}
