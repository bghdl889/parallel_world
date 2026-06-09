import { ChevronLeft, Download, Share2, Heart } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { BottomNav } from "./BottomNav";
import type { NavProps } from "../types";

const MY_DAY = [
  { time: "07:00", label: "晨起", emoji: "🌅", note: "窗外阳光正好", mood: "😊" },
  { time: "09:00", label: "早餐", emoji: "☕", note: "燕麦粥加蓝莓", mood: "😋" },
  { time: "12:00", label: "午餐", emoji: "🥗", note: "鸡胸肉沙拉", mood: "💪" },
  { time: "15:00", label: "下午茶", emoji: "🍵", note: "公园里散步喝茶", mood: "😌" },
  { time: "18:00", label: "晚餐", emoji: "🌙", note: "自己做的意面", mood: "😍" },
  { time: "22:00", label: "睡前", emoji: "💤", note: "读了一小时书", mood: "🌙" },
];

const PARTNER_DAY = [
  { time: "07:00", label: "晨起", emoji: "🌅", note: "赖床足足一小时", mood: "😴" },
  { time: "09:00", label: "早餐", emoji: "☕", note: "豆浆油条超满足", mood: "😋" },
  { time: "12:00", label: "午餐", emoji: "🥗", note: "和同事点外卖", mood: "🤝" },
  { time: "15:00", label: "下午茶", emoji: "🍵", note: "奶茶配蛋糕", mood: "🧋" },
  { time: "18:00", label: "晚餐", emoji: "🌙", note: "家人一起吃饭", mood: "❤️" },
  { time: "22:00", label: "睡前", emoji: "💤", note: "刷了两小时短视频", mood: "📱" },
];

const INSIGHTS = [
  { label: "最相似", value: "早餐时光" },
  { label: "最不同", value: "起床时间" },
  { label: "共同情绪", value: "愉悦 😊" },
];

export function ResultPage({ navigate }: NavProps) {
  return (
    <div
      style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F8F7F5" }}
    >
      <StatusBar />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 20px 12px",
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate("/challenge/demo")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "#FFF",
              border: "1px solid rgba(0,0,0,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} color="#8C8986" />
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2C2926" }}>
              我们的交换日
            </div>
            <div style={{ fontSize: 11, color: "#B0ABA6" }}>
              2026年6月5日 · 休闲日
            </div>
          </div>
        </div>

        {/* Avatars Banner */}
        <div style={{ padding: "0 20px 14px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #EEF4F1 0%, #F0EEF5 100%)",
              borderRadius: 18,
              padding: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 17,
                  background: "linear-gradient(135deg, #C5D5CC, #ADBFB5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  margin: "0 auto 6px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                🌿
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2C2926" }}>陈思思</div>
              <div style={{ fontSize: 10, color: "#B0ABA6" }}>我</div>
            </div>

            <div
              style={{
                padding: "0 22px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div style={{ fontSize: 24 }}>💫</div>
              <div style={{ fontSize: 9, color: "#B0ABA6", letterSpacing: "0.5px" }}>
                交换了一天
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 17,
                  background: "linear-gradient(135deg, #D4C5C5, #D4AAAA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  margin: "0 auto 6px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                🌸
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2C2926" }}>李晓晓</div>
              <div style={{ fontSize: 10, color: "#B0ABA6" }}>ta</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div style={{ padding: "0 20px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2926" }}>今日洞察</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {INSIGHTS.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  background: "#FFF",
                  borderRadius: 13,
                  padding: "12px 8px",
                  textAlign: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 9, color: "#B0ABA6", marginBottom: 5 }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#2C2926" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Grid */}
        <div style={{ padding: "0 20px 14px" }}>
          <div
            style={{ fontSize: 13, fontWeight: 600, color: "#2C2926", marginBottom: 10 }}
          >
            一天对比
          </div>

          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {[
              { avatar: "🌿", name: "陈思思", color: "#ADBFB5" },
              { avatar: "🌸", name: "李晓晓", color: "#D4AAAA" },
            ].map(({ avatar, name, color }) => (
              <div
                key={name}
                style={{
                  background: color + "22",
                  borderRadius: 11,
                  padding: "7px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 15 }}>{avatar}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#2C2926",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Row by row comparison */}
          {MY_DAY.map((mine, i) => {
            const theirs = PARTNER_DAY[i];
            return (
              <div
                key={mine.time}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {/* Mine */}
                <div
                  style={{
                    background: "#EDF5F1",
                    borderRadius: 12,
                    padding: "10px",
                    border: "1px solid #ADBFB522",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{mine.emoji}</span>
                    <span style={{ fontSize: 14 }}>{mine.mood}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#ADBFB5", fontWeight: 600, marginBottom: 2 }}>
                    {mine.time} {mine.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#2C2926", lineHeight: 1.4 }}>
                    {mine.note}
                  </div>
                </div>

                {/* Theirs */}
                <div
                  style={{
                    background: "#FDF2F2",
                    borderRadius: 12,
                    padding: "10px",
                    border: "1px solid #D4AAAA22",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{theirs.emoji}</span>
                    <span style={{ fontSize: 14 }}>{theirs.mood}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#D4AAAA", fontWeight: 600, marginBottom: 2 }}>
                    {theirs.time} {theirs.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#2C2926", lineHeight: 1.4 }}>
                    {theirs.note}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Similarity Score */}
        <div style={{ padding: "0 20px 14px" }}>
          <div
            style={{
              background: "#FFF",
              borderRadius: 18,
              padding: "18px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
              <Heart size={14} color="#D4AAAA" fill="#D4AAAA" />
              <span style={{ fontSize: 12, color: "#8C8986" }}>生活相似度</span>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#8FAF9E",
                letterSpacing: "-2px",
                marginBottom: 6,
              }}
            >
              67<span style={{ fontSize: 20, fontWeight: 600, letterSpacing: 0 }}>%</span>
            </div>
            <div style={{ fontSize: 12, color: "#B0ABA6", marginBottom: 12 }}>
              你们有相似的生活节奏，但细节大不同 🌟
            </div>
            <div
              style={{
                height: 8,
                background: "#F0EDEA",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "67%",
                  background: "linear-gradient(90deg, #ADBFB5, #D4AAAA)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            padding: "12px 20px 16px",
            background: "linear-gradient(to top, #F8F7F5 75%, transparent)",
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              flex: 1,
              padding: "15px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #ADBFB5, #7EA897)",
              color: "#FFF",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 4px 20px rgba(143,175,158,0.38)",
            }}
          >
            <Share2 size={15} />
            分享长图
          </button>
          <button
            style={{
              width: 52,
              padding: "15px",
              borderRadius: 16,
              border: "1.5px solid rgba(0,0,0,0.08)",
              background: "#FFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Download size={18} color="#8C8986" />
          </button>
        </div>
      </div>

      <BottomNav active="profile" navigate={navigate} />
    </div>
  );
}
