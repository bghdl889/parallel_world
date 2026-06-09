import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Download, RefreshCw } from "lucide-react";
import { StatusBar } from "./StatusBar";
import type { NavProps, AppState, Challenge, Participant, CheckIn } from "../types";
import { getChallenge, getParticipants } from "../lib/challenges";
import { getAllCheckins } from "../lib/checkins";

const EMOJIS = ["🌿", "🌸", "🌺", "🍀", "🌻", "🍁", "🌙", "⭐", "💫"];
const GRADIENTS = [
  "linear-gradient(135deg,#F5A89A,#F0C8A0)",
  "linear-gradient(135deg,#A8D5C8,#80C4B8)",
  "linear-gradient(135deg,#D4DCEC,#B8C8E8)",
  "linear-gradient(135deg,#F5E6C8,#E8D8B8)",
  "linear-gradient(135deg,#E8D4F0,#D8C4E8)",
  "linear-gradient(135deg,#F0D4C8,#E8C4B8)",
  "linear-gradient(135deg,#D4F0E8,#C4E8D8)",
  "linear-gradient(135deg,#F0E8D4,#E8D8C4)",
  "linear-gradient(135deg,#D4E8F0,#C4D8E8)",
];

function avatarEmoji(seed: string) {
  return EMOJIS[Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % EMOJIS.length];
}

const TEMPLATE_CONFIG: Record<number, { cols: number; rows: number; centerTime: boolean }> = {
  2: { cols: 2, rows: 1, centerTime: false },
  3: { cols: 2, rows: 2, centerTime: false },
  4: { cols: 2, rows: 2, centerTime: true },
  6: { cols: 3, rows: 2, centerTime: true },
  9: { cols: 3, rows: 3, centerTime: true },
};

function StitchedImageCard({ checkpoint, template, participants, checkinsMap }: {
  checkpoint: string; template: number; participants: Participant[];
  checkinsMap: Map<string, Map<string, CheckIn>>;
}) {
  const config = TEMPLATE_CONFIG[template] ?? TEMPLATE_CONFIG[4];
  const totalSlots = template === 3 ? 4 : template;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "0 40px" }}>
      <div style={{ width: "100%", maxWidth: 280, aspectRatio: "3 / 4", borderRadius: 20, overflow: "hidden", background: "#FFF", boxShadow: "0 12px 48px rgba(0,0,0,0.18)", border: "1px solid #F0E8E0", display: "grid", gridTemplateColumns: `repeat(${config.cols}, 1fr)`, gridTemplateRows: `repeat(${config.rows}, 1fr)`, gap: 3, position: "relative" }}>
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const isTimeSlot = template === 3 && idx === 0;
          if (isTimeSlot) return (<div key={idx} style={{ background: "#FFF", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px" }}><div style={{ fontSize: 18, fontWeight: 800, color: "#2D2D2D", letterSpacing: "0.5px" }}>{checkpoint}</div></div>);
          const pIdx = template === 3 && idx > 0 ? idx - 1 : idx;
          const participant = participants[pIdx];
          const checkpointCheckins = checkinsMap.get(checkpoint);
          const checkin = participant ? checkpointCheckins?.get(participant.user_id) : undefined;
          const tag = participant?.tags?.[0] ?? "???";
          const caption = checkin?.caption ?? "";
          const photoUrl = checkin?.photo_url;
          const isEmpty = !checkin;
          return (
            <div key={idx} style={{ background: isEmpty ? "#F5F0E8" : (photoUrl ? "transparent" : GRADIENTS[pIdx % GRADIENTS.length]), backgroundImage: photoUrl ? `url(${photoUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px" }}>
              {isEmpty ? (<div style={{ fontSize: 24, opacity: 0.15 }}>📷</div>) : (<>
                {!photoUrl && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.45) 100%)" }} />}
                {photoUrl && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.30) 100%)" }} />}
                <div style={{ position: "relative", zIndex: 2, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: template === 9 ? 2 : 4 }}>
                  <div style={{ fontSize: template === 9 ? 9 : 11, color: "#FFF", fontWeight: 800, background: "rgba(0,0,0,0.65)", padding: template === 9 ? "3px 8px" : "4px 10px", borderRadius: 20, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.20)", letterSpacing: "0.3px", boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }}>#{tag}</div>
                  {caption && <div style={{ fontSize: template === 9 ? 8 : 10, color: "#FFF", fontWeight: 500, lineHeight: 1.3, textShadow: "0 2px 10px rgba(0,0,0,0.6)", maxWidth: "85%" }}>{caption}</div>}
                </div>
              </>)}
            </div>
          );
        })}
        {config.centerTime && (<div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(45,45,45,0.92)", color: "#FFF", fontSize: 15, fontWeight: 800, borderRadius: 24, padding: "8px 18px", letterSpacing: "0.5px", boxShadow: "0 6px 20px rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", zIndex: 10 }}>{checkpoint}</div>)}
      </div>
    </div>
  );
}

export function ResultsPage({ navigate, appState, challengeId }: NavProps & { appState: AppState; challengeId?: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const startX = useRef(0);

  useEffect(() => {
    if (!challengeId) { setLoading(false); return; }
    (async () => {
      try {
        const [ch, parts, allCheckins] = await Promise.all([getChallenge(challengeId), getParticipants(challengeId), getAllCheckins(challengeId)]);
        if (ch) setChallenge(ch);
        setParticipants(parts);
        setCheckins(allCheckins);
      } catch (err) { console.error("Failed to load results:", err); }
      finally { setLoading(false); }
    })();
  }, [challengeId]);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex((prev) => Math.min(checkpoints.length - 1, prev + 1));

  if (loading) return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", alignItems: "center", justifyContent: "center", color: "#B0A898", fontSize: 14 }}>加载中...</div>;
  if (!challenge) return (<div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", alignItems: "center", justifyContent: "center", color: "#B0A898", gap: 12 }}><div>报告不存在</div><button onClick={() => navigate("/")} style={{ padding: "8px 20px", borderRadius: 20, background: "#F5A89A", color: "#FFF", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>返回首页</button></div>);

  const checkpoints = challenge.checkpoints;
  const template = challenge.template;
  const checkinsMap = new Map<string, Map<string, CheckIn>>();
  for (const ci of checkins) { if (!checkinsMap.has(ci.checkpoint)) checkinsMap.set(ci.checkpoint, new Map()); checkinsMap.get(ci.checkpoint)!.set(ci.user_id, ci); }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", position: "relative" }}>
      <StatusBar />
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "2px 20px 12px", gap: 10, borderBottom: "1px solid #F0E8E0", background: "#FDF8F3" }}>
        <button onClick={() => navigate(`/challenge/${challengeId}`)} style={{ width: 34, height: 34, borderRadius: 10, background: "#F7F2EA", border: "1px solid #E8DED0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 12px rgba(200,185,165,0.30)" }}><ChevronLeft size={17} color="#9B8B7E" strokeWidth={2.5} /></button>
        <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.4px" }}>挑战报告</div><div style={{ fontSize: 12, color: "#A8A0A0", marginTop: 1 }}>{challenge.challenge_date} · {challenge.name}</div></div>
      </div>
      <div style={{ padding: "16px 20px 12px", flexShrink: 0 }}>
        <div style={{ background: "linear-gradient(135deg, #FEF0ED 0%, #F3EEFF 100%)", borderRadius: 16, padding: "16px 18px", border: "1px solid #F0E8E0", boxShadow: "0 4px 16px rgba(232,224,216,0.40)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {participants.map((p, idx) => (<div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: GRADIENTS[idx % GRADIENTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 3px 10px rgba(0,0,0,0.15)" }}>{avatarEmoji(p.avatar_seed)}</div><div style={{ fontSize: 9, fontWeight: 600, color: "#2D2D2D" }}>{p.tags?.[0] ?? ""}</div></div>))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }} onTouchStart={(e) => { startX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - startX.current; if (dx < -50) handleNext(); if (dx > 50) handlePrev(); }}>
        <div style={{ display: "flex", height: "100%", width: `${checkpoints.length * 100}%`, transform: `translateX(-${(currentIndex * 100) / checkpoints.length}%)`, transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)" }}>
          {checkpoints.map((cp) => (<div key={cp} style={{ width: `${100 / checkpoints.length}%`, height: "100%", flexShrink: 0 }}><StitchedImageCard checkpoint={cp} template={template} participants={participants} checkinsMap={checkinsMap} /></div>))}
        </div>
        <div onClick={handlePrev} style={{ position: "absolute", left: 0, top: 0, width: "30%", height: "100%", zIndex: 20, cursor: currentIndex > 0 ? "pointer" : "default" }} />
        <div onClick={handleNext} style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "100%", zIndex: 20, cursor: currentIndex < checkpoints.length - 1 ? "pointer" : "default" }} />
      </div>
      <div style={{ padding: "12px 0 16px", display: "flex", justifyContent: "center", gap: 5, background: "#FDF8F3" }}>
        {checkpoints.map((_, idx) => (<div key={idx} onClick={() => setCurrentIndex(idx)} style={{ width: idx === currentIndex ? 20 : 6, height: 6, borderRadius: 3, background: idx === currentIndex ? "#F5A89A" : "#E8E0D8", transition: "all 0.3s", cursor: "pointer" }} />))}
      </div>
      <div style={{ padding: "0 20px 20px", background: "#FDF8F3", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <button style={{ width: "100%", height: 52, borderRadius: 48, border: "none", background: "#F5A89A", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 24px rgba(245,168,154,0.45)", fontFamily: "inherit" }}><Download size={16} />保存所有图片</button>
        <button onClick={() => navigate("/")} style={{ width: "100%", height: 44, borderRadius: 48, border: "1px solid #F5A89A", background: "#FFFCF8", color: "#2D2D2D", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}><RefreshCw size={14} color="#F5A89A" />再玩一次</button>
      </div>
    </div>
  );
}
