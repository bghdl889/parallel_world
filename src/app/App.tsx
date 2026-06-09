import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router";
import { LaunchPage }  from "./components/LaunchPage";
import { CreatePage }  from "./components/CreatePage";
import { JoinPage }  from "./components/JoinPage";
import { InvitePage } from "./components/InvitePage";
import { TimelinePage } from "./components/TimelinePage";
import { ResultsPage }  from "./components/ResultsPage";
import { ensureAuth } from "./lib/auth";
import type { TemplateType } from "./types";

const FONT = '"Noto Sans SC", -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

function JoinPageWrapper({ navigate, appState }: { navigate: (path: string) => void; appState: { template: TemplateType; setTemplate: (t: TemplateType) => void } }) {
  const { challengeId } = useParams();
  return <JoinPage navigate={navigate} appState={appState} challengeId={challengeId} />;
}

function InvitePageWrapper({ navigate }: { navigate: (path: string) => void }) {
  const { challengeId } = useParams();
  return <InvitePage navigate={navigate} challengeId={challengeId} />;
}

function TimelinePageWrapper({ navigate }: { navigate: (path: string) => void }) {
  const { challengeId } = useParams();
  return <TimelinePage navigate={navigate} challengeId={challengeId} />;
}

function ResultsPageWrapper({ navigate, appState }: { navigate: (path: string) => void; appState: { template: TemplateType; setTemplate: (t: TemplateType) => void } }) {
  const { challengeId } = useParams();
  return <ResultsPage navigate={navigate} appState={appState} challengeId={challengeId} />;
}

export default function App() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<TemplateType>(4);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const appState = { template, setTemplate };

  // Ensure anonymous auth on mount
  useEffect(() => {
    ensureAuth()
      .then(() => setAuthReady(true))
      .catch((err) => {
        console.error("Auth failed:", err);
        setAuthError(err.message);
        // Still allow app to render — auth is not blocking
        setAuthReady(true);
      });
  }, []);

  if (!authReady) {
    return (
      <div style={{
        width: "100vw",
        height: "100dvh",
        background: "#FDF8F3",
        fontFamily: FONT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#B0A898",
        fontSize: 14,
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{
      width: "100vw",
      height: "100dvh",
      background: "#FDF8F3",
      fontFamily: FONT,
      overflow: "hidden",
      position: "relative",
    }}>
      {authError && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "#FDE8E8", color: "#C44",
          padding: "8px 16px", fontSize: 12, zIndex: 9999,
          textAlign: "center",
        }}>
          ⚠️ {authError}
        </div>
      )}
      <Routes>
        <Route path="/" element={<LaunchPage navigate={navigate} />} />
        <Route path="/create" element={<CreatePage navigate={navigate} appState={appState} />} />
        <Route path="/join/:challengeId" element={<JoinPageWrapper navigate={navigate} appState={appState} />} />
        <Route path="/invite/:challengeId" element={<InvitePageWrapper navigate={navigate} />} />
        <Route path="/challenge/:challengeId" element={<TimelinePageWrapper navigate={navigate} />} />
        <Route path="/results/:challengeId" element={<ResultsPageWrapper navigate={navigate} appState={appState} />} />
      </Routes>
    </div>
  );
}
