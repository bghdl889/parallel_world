import { Bell, Plus, ChevronRight, Sparkles } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { BottomNav } from "./BottomNav";
import type { NavProps } from "../types";

const CHALLENGES = [
  {
    id: 1,
    partner: "李晓晓",
    avatar: "🌸",
    theme: "休闲周末",
    date: "今天",
    progress: 3,
    total: 6,
    bar: "#D4AAAA",
    bg: "#FDF4F4",
  },
  {
    id: 2,
    partner: "王小明",
    avatar: "🌿",
    theme: "创意工作日",
    date: "明天",
    progress: 0,
    total: 6,
    bar: "#ADBFB5",
    bg: "#F2F7F5",
  },
];

const HOT_THEMES = [
  { emoji: "🌅", name: "假日清晨", count: "2,341" },
  { emoji: "🏙️", name: "城市白领", count: "1,820" },
  { emoji: "🌿", name: "慢生活", count: "3,105" },
];

export function HomePage({ navigate }: NavProps) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F8F7F5" }}>
      <StatusBar />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 20px 16px",
          }}
        >
          <div>
            <div
              style={{ fontSize: 22, fontWeight: 700, color: "#2C2926", letterSpacing: "-0.6px" }}
            >
              交换一天
            </div>
            <div style={{ fontSize: 12, color: "#B0ABA6", marginTop: 1 }}>
              体验不一样的人生
            </div>
          </div>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#FFF",
              border: "1px solid rgba(0,0,0,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Bell size={17} color="#8C8986" strokeWidth={1.7} />
          </button>
        </div>

        {/* Hero Card */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            onClick={() => navigate("/create")}
            style={{
              borderRadius: 22,
              padding: "26px 22px",
              background: "linear-gradient(140deg, #B8CCBF 0%, #A7BECE 50%, #BFBACE 100%)",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -24,
                top: -24,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.11)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 30,
                bottom: -30,
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -16,
                bottom: 20,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.8)",
                  letterSpacing: "1.5px",
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                今天的主角是你
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#FFF",
                  lineHeight: 1.35,
                  marginBottom: 20,
                  letterSpacing: "-0.3px",
                }}
              >
                换一种方式，<br />过今天 ✨
              </div>
              <button
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#5A8A7E",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                }}
              >
                <Plus size={15} />
                发起新挑战
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
          {[
            { emoji: "⚡", label: "进行中", badge: "1个", page: "ongoing" as const, accent: "#D4C5AE" },
            { emoji: "📸", label: "成果", badge: "3个", page: "result" as const, accent: "#D4AAAA" },
            { emoji: "🌐", label: "探索", badge: null, page: "home" as const, accent: "#ADBFB5" },
          ].map(({ emoji, label, badge, page, accent }) => (
            <button
              key={label}
              onClick={() => navigate(page)}
              style={{
                flex: 1,
                background: "#FFF",
                border: "1px solid rgba(0,0,0,0.05)",
                borderRadius: 16,
                padding: "14px 8px",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: accent + "28",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {emoji}
              </div>
              <span style={{ fontSize: 12, color: "#2C2926", fontWeight: 500 }}>{label}</span>
              {badge && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#8C8986",
                    background: "#F0EDEA",
                    borderRadius: 6,
                    padding: "2px 7px",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Challenges */}
        <div style={{ padding: "0 20px 4px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "#2C2926" }}>进行中的挑战</span>
            <span style={{ fontSize: 12, color: "#8FAF9E" }}>全部</span>
          </div>

          {CHALLENGES.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate("/challenge/demo")}
              style={{
                background: "#FFF",
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 10,
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                cursor: "pointer",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: c.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {c.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2926" }}>
                    与 {c.partner} 交换
                  </span>
                  <span style={{ fontSize: 11, color: "#B0ABA6" }}>{c.date}</span>
                </div>
                <div style={{ fontSize: 12, color: "#8C8986", marginBottom: 8 }}>
                  主题：{c.theme}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "#F0EDEA",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(c.progress / c.total) * 100}%`,
                        background: c.bar,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: "#B0ABA6" }}>
                    {c.progress}/{c.total}
                  </span>
                </div>
              </div>
              <ChevronRight size={15} color="#C8C3BE" />
            </div>
          ))}
        </div>

        {/* Hot Themes */}
        <div style={{ padding: "12px 20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Sparkles size={14} color="#C5AB84" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#2C2926" }}>热门主题</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {HOT_THEMES.map(({ emoji, name, count }) => (
              <div
                key={name}
                onClick={() => navigate("/create")}
                style={{
                  flex: 1,
                  background: "#FFF",
                  borderRadius: 14,
                  padding: "14px 8px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{emoji}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2C2926",
                    marginBottom: 3,
                  }}
                >
                  {name}
                </div>
                <div style={{ fontSize: 10, color: "#B0ABA6" }}>{count}人</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" navigate={navigate} />
    </div>
  );
}
