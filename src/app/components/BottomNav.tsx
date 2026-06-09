import { Home, Camera, User } from "lucide-react";

const TABS = [
  { id: "home",     label: "首页",  Icon: Home,   path: "/"     },
  { id: "timeline", label: "挑战",  Icon: Camera, path: "/challenge/demo" },
  { id: "profile",  label: "我",    Icon: User,   path: "/"     },
];

const ACCENT = "#F5A89A";

export function BottomNav({ active, navigate }: { active: string; navigate: (path: string) => void }) {
  return (
    <div style={{
      height: 80, flexShrink: 0,
      background: "rgba(253,248,243,0.97)",
      backdropFilter: "blur(24px)",
      borderTop: "1px solid #F0E8E0",
      display: "flex", alignItems: "flex-start", paddingTop: 10,
    }}>
      {TABS.map(({ id, label, Icon, path }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => navigate(path)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            border: "none", background: "none", cursor: "pointer", padding: 0,
            color: on ? ACCENT : "#C8C0B8", transition: "color 0.15s",
          }}>
            <Icon size={22} strokeWidth={on ? 2.2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400, letterSpacing: "0.2px" }}>{label}</span>
            {on && <div style={{ width: 4, height: 4, borderRadius: "50%", background: ACCENT, marginTop: -2 }} />}
          </button>
        );
      })}
    </div>
  );
}
