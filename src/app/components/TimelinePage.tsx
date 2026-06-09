import { useState, useRef, useEffect } from "react";
import { Camera, ChevronLeft, X, Type, Layers, Edit2, Check } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { useCamera } from "../hooks/useCamera";
import type { NavProps, Challenge, Participant, CheckIn } from "../types";
import { getChallenge, getParticipants } from "../lib/challenges";
import { checkIn, getMyCheckins, submitChallenge } from "../lib/checkins";

const PHOTO_GRADIENTS = [
  "linear-gradient(135deg, #F5D4DC, #E8C4D4)",
  "linear-gradient(135deg, #D4DCF0, #C4CCEC)",
  "linear-gradient(135deg, #D4E8E0, #C4D8D0)",
  "linear-gradient(135deg, #F5E6C8, #E8D8B8)",
  "linear-gradient(135deg, #E0D4F0, #D0C4E8)",
];

const EMOJIS = ["🌿", "🌸", "🌺", "🍀", "🌻", "🍁", "🌙", "⭐", "💫"];

function avatarEmoji(seed: string) {
  return EMOJIS[Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % EMOJIS.length];
}

/* ── Bottom Sheet ── */
function CheckInSheet({
  hour,
  onClose,
  onConfirm,
}: {
  hour: string;
  onClose: () => void;
  onConfirm: (caption: string, photoFile?: File) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [showBackdrops, setShowBackdrops] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedBackdrop, setSelectedBackdrop] = useState<{emoji: string; desc: string} | null>(null);
  const [currentText, setCurrentText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const { openCamera, CameraInput } = useCamera();

  const backdrops = [
    { emoji: "💼", desc: "又双叒叕开会" }, { emoji: "😴", desc: "睡梦中" },
    { emoji: "🚗", desc: "老司机上路" }, { emoji: "🍜", desc: "干饭人干饭魂" },
    { emoji: "🏃", desc: "汗流浃背" }, { emoji: "✈️", desc: "在路上飞" },
    { emoji: "☕", desc: "咖啡续命中" }, { emoji: "📚", desc: "埋头学习" },
    { emoji: "🎮", desc: "游戏快乐时光" }, { emoji: "🎵", desc: "音乐环绕" },
    { emoji: "🌙", desc: "夜猫子出没" }, { emoji: "🌅", desc: "早起看日出" },
    { emoji: "🍕", desc: "美食诱惑" }, { emoji: "💻", desc: "码字中" },
    { emoji: "🎬", desc: "追剧追到停不下来" },
  ];

  const [backdropPage, setBackdropPage] = useState(0);
  const backdropPages = Math.ceil(backdrops.length / 6);
  const currentBackdrops = backdrops.slice(backdropPage * 6, (backdropPage + 1) * 6);
  const hasImage = !!selectedBackdrop || !!photoFile;

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      if (selectedBackdrop) setCurrentText(selectedBackdrop.desc);
      textInputRef.current.focus();
      setTimeout(() => { if (textInputRef.current) { const l = textInputRef.current.value.length; textInputRef.current.setSelectionRange(l, l); } }, 0);
    }
  }, [showTextInput, selectedBackdrop]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };
  const handleCancel = () => { setSelectedBackdrop(null); setPhotoFile(null); setPhotoPreview(null); setCurrentText(""); setShowTextInput(false); };

  const handleConfirm = () => {
    if (!hasImage) { alert("请选择底图或拍照"); return; }
    setVisible(false);
    const caption = photoPreview ? (currentText || "记录了此刻") : selectedBackdrop ? `${selectedBackdrop.emoji} ${selectedBackdrop.desc}` : "记录了此刻";
    setTimeout(() => onConfirm(caption, photoFile || undefined), 280);
  };

  const handlePhotoCapture = (file: File) => { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); setSelectedBackdrop(null); };
  const handleTextConfirm = () => { if (currentText.trim() && selectedBackdrop) { setSelectedBackdrop({ ...selectedBackdrop, desc: currentText }); setCurrentText(""); } setShowTextInput(false); };

  return (
    <div onClick={handleClose} style={{ position: "absolute", inset: 0, zIndex: 200, background: `rgba(45,40,35,${visible ? 0.38 : 0})`, transition: "background 0.28s ease" }}>
      <CameraInput onCapture={handlePhotoCapture} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFCF8",
        borderRadius: "24px 24px 0 0", borderTop: "1px solid #F0E8E0",
        boxShadow: "0 -8px 40px rgba(232,200,190,0.30)", padding: "12px 20px 32px",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><div style={{ width: 40, height: 4, borderRadius: 2, background: "#D8D0C8" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px" }}>记录 {hour}</div>
          <button onClick={handleClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#EDE6DC", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={14} color="#8A7A70" strokeWidth={2} /></button>
        </div>

        {/* Photo area */}
        <div style={{
          height: 240, borderRadius: 16,
          background: (photoPreview || selectedBackdrop) ? "#FEF0ED" : "#F5F0E8",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 16, border: (photoPreview || selectedBackdrop) ? "1.5px solid #F5D4DC" : "1.5px dashed #E0D8D0",
          position: "relative", overflow: "hidden",
        }}>
          {photoPreview && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" }}><div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.30) 100%)" }} /></div>}

          {showTextInput && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(45,40,35,0.75)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <input ref={textInputRef} type="text" value={currentText} onChange={(e) => setCurrentText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleTextConfirm(); } e.stopPropagation(); }} onClick={(e) => e.stopPropagation()} placeholder="说点什么..." style={{ width: "100%", background: "transparent", border: "none", borderBottom: "2px solid rgba(255,255,255,0.5)", outline: "none", color: "#FFF", fontSize: 18, fontWeight: 600, textAlign: "center", fontFamily: "inherit", padding: "8px 0", caretColor: "#FFF" }} />
              <button onClick={handleTextConfirm} style={{ marginTop: 20, padding: "10px 28px", borderRadius: 20, background: "#F5A89A", color: "#FFF", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,168,154,0.40)" }}>确定</button>
            </div>
          )}

          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>
            <button onClick={openCamera} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(138,122,112,0.75)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Camera size={16} color="#FFF" strokeWidth={2} /></button>
            <button onClick={() => setShowBackdrops(!showBackdrops)} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(138,122,112,0.75)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Layers size={16} color="#FFF" strokeWidth={2} /></button>
            {hasImage && <button onClick={() => setShowTextInput(true)} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(138,122,112,0.75)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Type size={16} color="#FFF" strokeWidth={2} /></button>}
          </div>

          {!photoPreview && !selectedBackdrop && (<><div style={{ width: 52, height: 52, borderRadius: "50%", background: "#F0D4D0", display: "flex", alignItems: "center", justifyContent: "center" }}><Camera size={24} color="#F08070" strokeWidth={1.8} /></div><div style={{ fontSize: 13, color: "#C0B8B0" }}>拍照或选图</div><div style={{ fontSize: 11, color: "#D4C8BE" }}>点击右上角📷拍照或🖼选择底图</div></>)}
          {!photoPreview && selectedBackdrop && (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}><div style={{ fontSize: 72 }}>{selectedBackdrop.emoji}</div><div style={{ fontSize: 15, color: "#6A5A50", fontWeight: 600, textAlign: "center", lineHeight: 1.4 }}>{selectedBackdrop.desc}</div></div>)}
        </div>

        {/* Backdrop selector */}
        {showBackdrops && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ padding: "12px", borderRadius: 14, background: "#FFFCF8", border: "1px solid #F0E8E0", boxShadow: "0 2px 10px rgba(232,224,216,0.35)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {currentBackdrops.map(bd => (
                  <button key={bd.desc} onClick={() => { setSelectedBackdrop(bd); setShowBackdrops(false); setPhotoFile(null); setPhotoPreview(null); }} style={{ padding: "12px 8px", borderRadius: 12, background: selectedBackdrop?.desc === bd.desc ? "#FEF0ED" : "#F5F0E8", border: selectedBackdrop?.desc === bd.desc ? "2px solid #F5A89A" : "none", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                    <div style={{ fontSize: 32 }}>{bd.emoji}</div><div style={{ fontSize: 12, color: "#6A5A50", fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>{bd.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {backdropPages > 1 && (<div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>{Array.from({ length: backdropPages }).map((_, idx) => (<button key={idx} onClick={() => setBackdropPage(idx)} style={{ width: backdropPage === idx ? 20 : 6, height: 6, borderRadius: 3, background: backdropPage === idx ? "#F5A89A" : "#E0D8D0", border: "none", cursor: "pointer", transition: "all 0.3s" }} />))}</div>)}
          </div>
        )}

        {/* Bottom action buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, paddingTop: 8 }}>
          <button onClick={handleCancel} disabled={!hasImage} style={{ width: 44, height: 44, borderRadius: "50%", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: hasImage ? "pointer" : "not-allowed", opacity: hasImage ? 1 : 0.3 }}><X size={28} color="#8A7A70" strokeWidth={2.5} /></button>
          <button onClick={handleConfirm} disabled={!hasImage} style={{ width: 64, height: 64, borderRadius: "50%", background: hasImage ? "#F5A89A" : "#E8E0D8", border: hasImage ? "4px solid #F5D4DC" : "4px solid #E8E0D8", display: "flex", alignItems: "center", justifyContent: "center", cursor: hasImage ? "pointer" : "not-allowed", boxShadow: hasImage ? "0 6px 24px rgba(245,168,154,0.40)" : "none", transition: "all 0.2s" }}><Check size={32} color="#FFF" strokeWidth={3} /></button>
          <div style={{ width: 44 }} />
        </div>
      </div>
    </div>
  );
}

/* ── Photo block ── */
function PhotoBlock({ done, caption, gradientIdx, photoUrl, onEdit }: {
  done: boolean; caption?: string; gradientIdx: number; photoUrl?: string; onEdit?: () => void;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        height: 80, borderRadius: 10,
        background: done ? (photoUrl ? "transparent" : PHOTO_GRADIENTS[gradientIdx % PHOTO_GRADIENTS.length]) : "#F5F0E8",
        backgroundImage: done && photoUrl ? `url(${photoUrl})` : undefined,
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 5, position: "relative", overflow: "hidden",
      }}>
        {!done && <Camera size={16} color="#E0C8C0" strokeWidth={1.5} />}
        {done && (<>
          {photoUrl && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.30) 100%)" }} />}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: 6 }}><div style={{ fontSize: 8, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.18)", borderRadius: 4, padding: "2px 5px" }}>我</div></div>
          {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.90)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}><Edit2 size={10} color="#8A7A70" strokeWidth={2.5} /></button>}
        </>)}
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.45, color: done ? "#4A4A4A" : "#C4B8A8", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{done ? (caption ?? "—") : "记录此刻..."}</div>
    </div>
  );
}

/* ── Main page ── */
export function TimelinePage({ navigate, challengeId }: NavProps & { challengeId?: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myCheckins, setMyCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [justDone, setJustDone] = useState<string | null>(null);
  const currentCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!challengeId) { setLoading(false); return; }
    (async () => {
      try {
        const [ch, parts, checkins] = await Promise.all([getChallenge(challengeId), getParticipants(challengeId), getMyCheckins(challengeId)]);
        if (ch) setChallenge(ch);
        setParticipants(parts);
        setMyCheckins(checkins);
      } catch (err) { console.error("Failed to load challenge:", err); }
      finally { setLoading(false); }
    })();
  }, [challengeId]);

  useEffect(() => { if (currentCardRef.current) currentCardRef.current.scrollIntoView({ behavior: "auto", block: "center" }); }, [loading]);

  const checkpoints = challenge?.checkpoints ?? [];
  const checkinMap = new Map(myCheckins.map(c => [c.checkpoint, c]));
  const doneCount = myCheckins.length;
  const totalCheckpoints = checkpoints.length;
  const allDone = totalCheckpoints > 0 && doneCount >= totalCheckpoints;
  const currentCheckpointIdx = checkpoints.findIndex(cp => !checkinMap.has(cp));

  const handleConfirm = async (hour: string, caption: string, photoFile?: File) => {
    setOpenSheet(null);
    if (!challengeId) return;
    try {
      if (photoFile) {
        await checkIn(challengeId, hour, photoFile, caption);
      } else {
        // Generate a placeholder image for text-only checkins
        const canvas = document.createElement("canvas");
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext("2d")!;
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, "#F5D4DC"); gradient.addColorStop(1, "#E8C4D4");
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = "#FFF"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(caption, 200, 210);
        const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/jpeg", 0.8));
        const file = new File([blob], `checkin_${hour}.jpg`, { type: "image/jpeg" });
        await checkIn(challengeId, hour, file, caption);
      }
      const updated = await getMyCheckins(challengeId);
      setMyCheckins(updated);
      setJustDone(hour);
      setTimeout(() => setJustDone(null), 400);
    } catch (err) { console.error("Check-in failed:", err); alert("打卡失败，请重试"); }
  };

  const handleSubmit = async () => {
    if (!challengeId || !challenge) return;
    setSubmitting(true);
    try { await submitChallenge(challengeId, checkpoints); navigate(`/results/${challengeId}`); }
    catch (err: any) { alert(err.message || "提交失败"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", alignItems: "center", justifyContent: "center", color: "#B0A898", fontSize: 14 }}>加载中...</div>;

  if (!challenge) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", alignItems: "center", justifyContent: "center", color: "#B0A898", gap: 12 }}>
      <div>挑战不存在</div>
      <button onClick={() => navigate("/")} style={{ padding: "8px 20px", borderRadius: 20, background: "#F5A89A", color: "#FFF", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>返回首页</button>
    </div>
  );

  const progressPct = totalCheckpoints > 0 ? (doneCount / totalCheckpoints) * 100 : 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FDF8F3", position: "relative", overflow: "hidden" }}>
      <StatusBar />

      {/* Fixed top header */}
      <div style={{ flexShrink: 0, background: "#FDF8F3", borderBottom: "1px solid #F0E8E0", padding: "0 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/")} style={{ width: 34, height: 34, borderRadius: 10, background: "#F7F2EA", border: "1px solid #E8DED0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 12px rgba(200,185,165,0.30)" }}><ChevronLeft size={17} color="#9B8B7E" strokeWidth={2.5} /></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px" }}>{challenge.name}</div>
            <div style={{ fontSize: 10, color: "#B0A898", marginTop: 1 }}>{challenge.challenge_date} · {checkpoints.length} 个时刻</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex" }}>
            {participants.slice(0, 3).map((p, i) => (
              <div key={p.id} style={{ width: 40, height: 40, borderRadius: "50%", background: p.is_host ? "#F5A89A" : "#A8D5C8", border: "2.5px solid #FFFCF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginLeft: i === 0 ? 0 : -10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 3 - i, position: "relative" }}>{avatarEmoji(p.avatar_seed)}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#8A7A70", marginBottom: 5 }}>已打卡 <span style={{ color: "#F5A89A", fontWeight: 700 }}>{doneCount}</span> / {totalCheckpoints}</div>
            <div style={{ height: 5, background: "#F0E8E0", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #F5A89A, #F5C8A0)", borderRadius: 3, transition: "width 0.4s ease" }} /></div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 2, background: `linear-gradient(180deg, #F5A89A 0%, #F5A89A ${progressPct}%, #E8E0D8 ${progressPct}%, #E8E0D8 100%)`, borderRadius: 1, zIndex: 0 }} />
          {checkpoints.map((hour, idx) => {
            const checkin = checkinMap.get(hour);
            const isDone = !!checkin;
            const isCurrent = idx === currentCheckpointIdx;
            const isLocked = idx > currentCheckpointIdx;
            const isAnimating = justDone === hour;
            const isClickable = isCurrent || isDone;
            const dotBg = isDone ? "#F5A89A" : isCurrent ? "#F08070" : "transparent";
            const dotBorder = (!isDone && !isCurrent) ? "2px solid #D8D0C8" : "none";

            return (
              <div key={hour} ref={isCurrent ? currentCardRef : null} style={{ display: "flex", gap: 12, marginBottom: 10, position: "relative", zIndex: 1 }}>
                <div style={{ width: 18, height: 18, flexShrink: 0, marginTop: 14, borderRadius: "50%", background: dotBg, border: dotBorder, boxShadow: isCurrent ? "0 0 0 5px rgba(240,128,112,0.18), 0 0 0 9px rgba(240,128,112,0.07)" : "none", transition: "all 0.25s" }} />
                <div onClick={() => isClickable && setOpenSheet(hour)} style={{
                  flex: 1, background: "#FFFCF8", borderRadius: 16,
                  border: isCurrent ? "2px solid #F5A89A" : "1px solid #F0E8E0",
                  boxShadow: isCurrent ? "0 4px 20px rgba(245,168,154,0.22)" : "0 3px 16px rgba(232,224,216,0.40)",
                  padding: "12px 14px", cursor: isClickable ? "pointer" : "default",
                  transform: isAnimating ? "scale(1.015)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border 0.2s, box-shadow 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isCurrent && <div style={{ fontSize: 10, color: "#FFF", fontWeight: 700, background: "#F08070", borderRadius: 8, padding: "2px 7px" }}>现在</div>}
                      <span style={{ fontSize: 14, fontWeight: 700, color: isLocked ? "#C4B8A8" : "#2D2D2D" }}>{hour}</span>
                    </div>
                    {isDone && <div style={{ fontSize: 11, fontWeight: 600, color: "#2A6B5C", background: "#D4E8E0", borderRadius: 12, padding: "3px 9px" }}>已打卡</div>}
                    {isCurrent && <div style={{ fontSize: 11, fontWeight: 600, color: "#C05040", background: "#F5D4D0", borderRadius: 12, padding: "3px 9px" }}>立即记录</div>}
                    {isLocked && <div style={{ fontSize: 11, color: "#C4B8A8", background: "#EDE6DC", borderRadius: 12, padding: "3px 9px" }}>未到时间</div>}
                  </div>
                  <PhotoBlock done={isDone} caption={checkin?.caption} gradientIdx={idx} photoUrl={checkin?.photo_url} onEdit={isDone ? () => setOpenSheet(hour) : undefined} />
                  {isCurrent && <button onClick={e => { e.stopPropagation(); setOpenSheet(hour); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#A8D5C8", color: "#2A6B5C", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 3px 14px rgba(168,213,200,0.50)", fontFamily: "inherit", marginTop: 10 }}><Camera size={15} />立即打卡</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom submit button */}
      {allDone && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px 24px", background: "rgba(253,248,243,0.97)", backdropFilter: "blur(24px)", borderTop: "1px solid #F0E8E0" }}>
          <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", height: 52, borderRadius: 48, border: "none", background: submitting ? "#E8E0D8" : "#F5A89A", color: "#FFF", fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 6px 28px rgba(245,168,154,0.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{submitting ? "提交中..." : "✨ 生成报告"}</button>
        </div>
      )}

      {/* Bottom sheet */}
      {openSheet && <CheckInSheet hour={openSheet} onClose={() => setOpenSheet(null)} onConfirm={(caption, photoFile) => handleConfirm(openSheet, caption, photoFile)} />}
    </div>
  );
}
