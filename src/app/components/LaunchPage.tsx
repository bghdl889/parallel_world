import { useState, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { StatusBar } from "./StatusBar";
import type { NavProps } from "../types";

/* ── 4 fixed personas — position never changes across slides ── */
const PERSONAS = [
  {
    emoji: "🧑‍💻",
    label: "大厂人",
    type: "INTJ",
    bg: "linear-gradient(145deg,#E8F0FD,#D4E0F8)",
    dot: "#6A8FD8",
  },
  {
    emoji: "🎨",
    label: "设计师",
    type: "INFP",
    bg: "linear-gradient(145deg,#FDE8EE,#F8D4E0)",
    dot: "#D87090",
  },
  {
    emoji: "📚",
    label: "学生党",
    type: "ISFJ",
    bg: "linear-gradient(145deg,#E8FDF0,#D4F0E0)",
    dot: "#60B880",
  },
  {
    emoji: "☕",
    label: "自由职",
    type: "ENFP",
    bg: "linear-gradient(145deg,#FDF5E0,#F8EAC8)",
    dot: "#C89840",
  },
];

/* ── Per-slide data: each cell [0-3] matches PERSONAS order ── */
const SLIDES: {
  time?: string;
  cells: { photo?: string; caption: string }[];
}[] = [
  // Slide 0 — cover (no photos, pure MBTI)
  {
    cells: [
      { caption: "每天在格子间的人" },
      { caption: "睡到自然醒的灵魂" },
      { caption: "图书馆里的清晨" },
      { caption: "咖啡馆是我的办公室" },
    ],
  },
  // Slide 1 — 08:00
  {
    time: "08:00",
    cells: [
      {
        photo:
          "https://images.unsplash.com/photo-1674049406286-292555e68637?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "6点的闹钟，第3次了",
      },
      {
        photo:
          "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "睡到自然醒 ☀️",
      },
      {
        photo:
          "https://images.unsplash.com/photo-1777651860848-e519486205c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "校园的早晨真美",
      },
      {
        photo:
          "https://images.unsplash.com/photo-1545239351-ef35f43d514b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "先来一杯再说",
      },
    ],
  },
  // Slide 2 — 09:00
  {
    time: "09:00",
    cells: [
      {
        photo:
          "https://images.unsplash.com/photo-1488573045827-87d258b27a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "挤地铁中……",
      },
      {
        photo:
          "https://images.unsplash.com/photo-1612245229854-e69ff79cd51a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "猫咪在晒太阳 🐱",
      },
      {
        photo:
          "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "图书馆占座成功",
      },
      {
        photo:
          "https://images.unsplash.com/photo-1579338775661-7d0b8621ec83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        caption: "第二杯续命",
      },
    ],
  },
];

/* ── Cover cell (pure MBTI, no photo) ── */
function CoverCell({
  emoji,
  label,
  type,
  bg,
  dot,
  caption,
}: (typeof PERSONAS)[0] & { caption: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        aspectRatio: "1/1",
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: 8,
        position: "relative",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "#FFF",
          boxShadow: `0 3px 12px ${dot}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {emoji}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#2D2D2D",
          textAlign: "center",
        }}
      >
        {label}
      </div>

      {/* MBTI badge */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: dot,
          background: `${dot}20`,
          borderRadius: 8,
          padding: "2px 7px",
        }}
      >
        {type}
      </div>

      {/* Caption */}
      <div
        style={{
          fontSize: 9,
          color: "#8A7A70",
          textAlign: "center",
          lineHeight: 1.4,
          marginTop: 2,
          maxWidth: "90%",
        }}
      >
        {caption}
      </div>
    </div>
  );
}

/* ── Photo cell with centered text overlay ── */
function PhotoCell({
  photo,
  caption,
  emoji,
  label,
}: {
  photo: string;
  caption: string;
  emoji: string;
  label: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        aspectRatio: "1/1",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          padding: 8,
          textAlign: "center",
        }}
      >
        {/* Persona badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.18)",
            borderRadius: 20,
            padding: "3px 8px",
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ fontSize: 12 }}>{emoji}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#FFF",
            }}
          >
            {label}
          </span>
        </div>

        {/* Caption */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#FFF",
            lineHeight: 1.5,
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            maxWidth: "90%",
          }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
}

/* ── 2×2 grid for one slide ── */
function SlideGrid({ slideIdx }: { slideIdx: number }) {
  const slide = SLIDES[slideIdx];
  const isCover = slideIdx === 0;

  // Build 4 cells
  const cells = PERSONAS.map((p, i) => ({
    ...p,
    ...slide.cells[i],
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Time badge — only on photo slides */}
      {slide.time && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 20,
            padding: "3px 12px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 5,
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#2D2D2D",
            }}
          >
            {slide.time}
          </span>
          <span style={{ fontSize: 12 }}>📸</span>
        </div>
      )}

      {/* Row 1 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          borderBottom: "2px solid rgba(255,255,255,0.25)",
        }}
      >
        {cells.slice(0, 2).map((cell, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              borderRight:
                i === 0
                  ? "2px solid rgba(255,255,255,0.25)"
                  : "none",
            }}
          >
            {isCover ? (
              <CoverCell {...cell} />
            ) : (
              <PhotoCell
                photo={cell.photo!}
                caption={cell.caption}
                emoji={cell.emoji}
                label={cell.label}
              />
            )}
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div style={{ flex: 1, display: "flex" }}>
        {cells.slice(2, 4).map((cell, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              borderRight:
                i === 0
                  ? "2px solid rgba(255,255,255,0.25)"
                  : "none",
            }}
          >
            {isCover ? (
              <CoverCell {...cell} />
            ) : (
              <PhotoCell
                photo={cell.photo!}
                caption={cell.caption}
                emoji={cell.emoji}
                label={cell.label}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── XHS swipeable card ── */
function XhsCard() {
  const [slide, setSlide] = useState(0);
  const total = SLIDES.length;
  const startX = useRef(0);

  const prev = () => setSlide((s) => Math.max(0, s - 1));
  const next = () =>
    setSlide((s) => Math.min(total - 1, s + 1));

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #F0E8E0",
        boxShadow: "0 4px 24px rgba(232,224,216,0.55)",
        background: "#FFFCF8",
        position: "relative",
      }}
    >
      {/* Square viewport */}
      <div
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx =
            e.changedTouches[0].clientX - startX.current;
          if (dx < -40) next();
          if (dx > 40) prev();
        }}
        style={{
          width: "100%",
          aspectRatio: "1/1",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Slide track */}
        <div
          style={{
            display: "flex",
            width: `${total * 100}%`,
            height: "100%",
            transform: `translateX(${(-slide * 100) / total}%)`,
            transition:
              "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: `${100 / total}%`,
                height: "100%",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <SlideGrid slideIdx={i} />
            </div>
          ))}
        </div>

        {/* Tap zones */}
        <div
          onClick={prev}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "28%",
            height: "100%",
            zIndex: 15,
          }}
        />
        <div
          onClick={next}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "28%",
            height: "100%",
            zIndex: 15,
          }}
        />

        {/* Page badge */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            zIndex: 20,
            background: "rgba(0,0,0,0.40)",
            borderRadius: 12,
            padding: "2px 8px",
            fontSize: 10,
            color: "#FFF",
            fontWeight: 600,
          }}
        >
          {slide + 1} / {total}
        </div>
      </div>

      {/* Info bar */}
      <div
        style={{
          padding: "10px 14px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#2D2D2D",
            }}
          >
            {slide === 0
              ? "相隔千里，各自有晨昏"
              : `${SLIDES[slide].time} 的平行时刻`}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#B0A898",
              marginTop: 2,
            }}
          >
            {slide === 0
              ? "左右滑动，看看不同人的一天"
              : "同一时刻，完全不同的世界"}
          </div>
        </div>
        {/* Dots */}
        <div
          style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 14 : 5,
                height: 5,
                borderRadius: 3,
                background: i === slide ? "#F5A89A" : "#E0D8D0",
                transition: "width 0.25s, background 0.25s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export function LaunchPage({ navigate }: NavProps) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#FDF8F3",
        overflow: "hidden",
      }}
    >
      <StatusBar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "8px 20px 20px",
          gap: 12,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#2D2D2D",
              letterSpacing: "-0.6px",
            }}
          >
            世界上另一个我
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#B0A898",
              marginTop: 4,
            }}
          >和好朋友一起记录平行生活的点滴</div>
        </div>

        {/* XHS swipeable example */}
        <XhsCard />

        {/* Active challenge */}
        <div
          onClick={() => navigate("/challenge/demo")}
          style={{
            background: "#FFFCF8",
            borderRadius: 16,
            padding: "11px 14px",
            border: "1px solid #F0E8E0",
            boxShadow: "0 3px 14px rgba(232,224,216,0.50)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background:
                "linear-gradient(135deg,#F5D4DC,#D4DCEC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
            }}
          >
            🌸
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#2D2D2D",
              }}
            >
              与 李晓晓 的挑战
            </div>
            <div
              style={{ display: "flex", gap: 3, marginTop: 5 }}
            >
              {Array.from({ length: 17 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === 4 ? 12 : 5,
                    height: 4,
                    borderRadius: 2,
                    background:
                      i < 4
                        ? "#F5A89A"
                        : i === 4
                          ? "#F5C8A0"
                          : "#E8E0D8",
                  }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#F5A89A",
              }}
            >
              4
            </span>
            <span style={{ fontSize: 11, color: "#D4C8BE" }}>
              /17
            </span>
            <ChevronRight
              size={13}
              color="#D4C8BE"
              style={{ marginLeft: 2 }}
            />
          </div>
        </div>

        {/* 发起挑战 */}
        <button
          onClick={() => navigate("/create")}
          style={{
            width: "100%",
            height: 54,
            borderRadius: 48,
            border: "none",
            background:
              "linear-gradient(135deg,#F5A89A,#F0C098)",
            color: "#FFF",
            fontSize: 18,
            fontWeight: 800,
            cursor: "pointer",
            letterSpacing: "-0.3px",
            boxShadow: "0 8px 28px rgba(245,168,154,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          发起挑战 ✨
        </button>
      </div>
    </div>
  );
}