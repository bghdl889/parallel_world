import { Camera, Check, Lock, ChevronLeft } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { BottomNav } from "./BottomNav";
import type { NavProps } from "../types";

type Status = "done" | "current" | "locked";

interface Checkpoint {
  id: string;
  time: string;
  label: string;
  emoji: string;
  status: Status;
  myNote: string;
  partnerNote: string;
}

const CHECKPOINTS: Checkpoint[] = [
  {
    id: "morning",
    time: "07:00",
    label: "晨起",
    emoji: "🌅",
    status: "done",
    myNote: "今天起得很早，窗外阳光正好，心情很好",
    partnerNote: "赖床了一小时，终于爬起来",
  },
  {
    id: "breakfast",
    time: "09:00",
    label: "早餐",
    emoji: "☕",
    status: "done",
    myNote: "燕麦粥加蓝莓，简单清爽",
    partnerNote: "早餐店豆浆油条，超级满足！",
  },
  {
    id: "lunch",
    time: "12:00",
    label: "午餐",
    emoji: "🥗",
    status: "done",
    myNote: "自己做了鸡胸肉沙拉，很清淡",
    partnerNote: "和同事一起点外卖，很热闹",
  },
  {
    id: "afternoon",
    time: "15:00",
    label: "下午茶",
    emoji: "🍵",
    status: "current",
    myNote: "",
    partnerNote: "",
  },
  {
    id: "dinner",
    time: "18:00",
    label: "晚餐",
    emoji: "🌙",
    status: "locked",
    myNote: "",
    partnerNote: "",
  },
  {
    id: "night",
    time: "22:00",
    label: "睡前",
    emoji: "💤",
    status: "locked",
    myNote: "",
    partnerNote: "",
  },
];

const DONE_COUNT = CHECKPOINTS.filter((c) => c.status === "done").length;

export function OngoingPage({ navigate }: NavProps) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F8F7F5" }}>
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
            onClick={() => navigate("/")}
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
          <div style={{ fontSize: 17, fontWeight: 700, color: "#2C2926" }}>进行中</div>
        </div>

        {/* Partner Banner */}
        <div style={{ padding: "0 20px 14px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #EEF4F1 0%, #F0EEF5 100%)",
              borderRadius: 18,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 0,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* My avatar */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #C5D5CC, #ADBFB5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  margin: "0 auto 4px",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                }}
              >
                🌿
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#2C2926" }}>我</div>
            </div>

            {/* Center arrow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "0 12px",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 2,
                  background: "linear-gradient(90deg, #ADBFB5, #D4AAAA)",
                  borderRadius: 2,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#FFF",
                    border: "1.5px solid #C5D0CA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#8C8986",
                  }}
                >
                  ↔
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#B0ABA6", whiteSpace: "nowrap" }}>
                休闲日交换
              </div>
            </div>

            {/* Partner avatar */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #D4C5C5, #D4AAAA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  margin: "0 auto 4px",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                }}
              >
                🌸
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#2C2926" }}>李晓晓</div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: 10,
              background: "#FFF",
              borderRadius: 13,
              padding: "11px 14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#8C8986" }}>今日打卡进度</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#8FAF9E" }}>
                {DONE_COUNT} / {CHECKPOINTS.length} 完成
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {CHECKPOINTS.map((c) => (
                <div
                  key={c.id}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background:
                      c.status === "done"
                        ? "#ADBFB5"
                        : c.status === "current"
                        ? "#D4C5AE"
                        : "#EAE7E3",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: "0 20px 24px" }}>
          <div
            style={{ fontSize: 13, fontWeight: 600, color: "#2C2926", marginBottom: 14 }}
          >
            打卡时间轴
          </div>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: 19,
                top: 10,
                bottom: 10,
                width: 2,
                background: "linear-gradient(to bottom, #ADBFB5 0%, #ADBFB5 50%, #EAE7E3 50%)",
                borderRadius: 2,
              }}
            />

            {CHECKPOINTS.map((cp) => {
              const done = cp.status === "done";
              const curr = cp.status === "current";
              const locked = cp.status === "locked";

              return (
                <div
                  key={cp.id}
                  style={{ paddingLeft: 50, marginBottom: 14, position: "relative" }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 12,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: done ? "#ADBFB5" : curr ? "#D4C5AE" : "#EAE7E3",
                      border: `2px solid ${done ? "#8FAF9E" : curr ? "#C5AB84" : "#D5D1CD"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      boxShadow: curr ? "0 0 0 5px rgba(212,197,174,0.25)" : "none",
                    }}
                  >
                    {done ? (
                      <Check size={10} color="#FFF" strokeWidth={3} />
                    ) : curr ? (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#C5AB84",
                        }}
                      />
                    ) : (
                      <Lock size={8} color="#C8C3BE" />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    style={{
                      background: locked ? "#F5F3F1" : "#FFF",
                      borderRadius: 16,
                      padding: "13px 14px",
                      boxShadow:
                        done || curr ? "0 3px 16px rgba(0,0,0,0.07)" : "none",
                      border: curr
                        ? "1.5px solid #D4C5AE"
                        : "1px solid rgba(0,0,0,0.05)",
                      opacity: locked ? 0.65 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: done ? 12 : 0,
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span style={{ fontSize: 20 }}>{cp.emoji}</span>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: locked ? "#B0ABA6" : "#2C2926",
                            }}
                          >
                            {cp.label}
                          </div>
                          <div style={{ fontSize: 11, color: "#B0ABA6" }}>
                            {cp.time}
                          </div>
                        </div>
                      </div>

                      {curr && (
                        <button
                          onClick={() => navigate("/results/demo")}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "linear-gradient(135deg, #C5D5CC, #8FAF9E)",
                            color: "#FFF",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            boxShadow: "0 2px 10px rgba(143,175,158,0.35)",
                          }}
                        >
                          <Camera size={13} />
                          打卡
                        </button>
                      )}

                      {locked && (
                        <span style={{ fontSize: 11, color: "#C0BBB6" }}>
                          未解锁
                        </span>
                      )}
                    </div>

                    {done && (
                      <div
                        style={{ display: "flex", flexDirection: "column", gap: 7 }}
                      >
                        {/* My record */}
                        <div
                          style={{
                            background: "linear-gradient(135deg, #EDF5F1, #E8F2EE)",
                            borderRadius: 10,
                            padding: "9px 11px",
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 14, flexShrink: 0 }}>🌿</span>
                          <div>
                            <div
                              style={{
                                fontSize: 9,
                                color: "#8FAF9E",
                                fontWeight: 600,
                                marginBottom: 2,
                                letterSpacing: "0.5px",
                              }}
                            >
                              我
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#2C2926",
                                lineHeight: 1.5,
                              }}
                            >
                              {cp.myNote}
                            </div>
                          </div>
                        </div>
                        {/* Partner record */}
                        <div
                          style={{
                            background: "linear-gradient(135deg, #FDF2F2, #F8EDED)",
                            borderRadius: 10,
                            padding: "9px 11px",
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 14, flexShrink: 0 }}>🌸</span>
                          <div>
                            <div
                              style={{
                                fontSize: 9,
                                color: "#D4AAAA",
                                fontWeight: 600,
                                marginBottom: 2,
                                letterSpacing: "0.5px",
                              }}
                            >
                              李晓晓
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#2C2926",
                                lineHeight: 1.5,
                              }}
                            >
                              {cp.partnerNote}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {curr && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          color: "#8C8986",
                          fontStyle: "italic",
                        }}
                      >
                        现在是下午茶时间，你在做什么呢？
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav active="ongoing" navigate={navigate} />
    </div>
  );
}
