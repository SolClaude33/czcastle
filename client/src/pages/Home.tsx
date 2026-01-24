import { useLayoutEffect, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const W = 2048;
const H = 1152;

export default function Home() {
  const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({});
  const [showDebug, setShowDebug] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useLayoutEffect(() => {
    const onResize = () => {
      // Use visualViewport for accurate sizing (accounts for browser chrome)
      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;

      // CONTAIN mode: never crop, may letterbox on non-16:9 displays
      const scale = Math.min(vw / W, vh / H);

      const left = Math.round((vw - W * scale) / 2);
      const top = Math.round((vh - H * scale) / 2);

      setCanvasStyle({
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${W}px`,
        height: `${H}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      });
    };

    onResize();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const layerStyle: React.CSSProperties = {
    position: "absolute",
    imageRendering: "pixelated",
    userSelect: "none",
  };

  return (
    <div
      className="viewport"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#0F1336",
        overflow: "hidden",
      }}
    >
      <div
        id="canvas"
        style={{ ...canvasStyle, imageRendering: "pixelated" }}
        role="application"
        aria-label="ONEBATTLELEGEND landing"
      >
        {/* Base frame as img (not background) */}
        <img
          src="/img/frame.png"
          alt=""
          draggable={false}
          style={{
            ...layerStyle,
            left: 0,
            top: 0,
            width: 2048,
            height: 1152,
          }}
        />

        {/* Hero banner - animated video */}
        <div
          style={{
            position: "absolute",
            left: 51,
            top: 106,
            width: 1945,
            height: 430,
            overflow: "hidden",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              imageRendering: "auto",
            }}
          >
            <source src="/videos/hero_anim_2048x454.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Language toggle - invisible hotspots over frame's built-in design */}
        <button
          onClick={() => setLanguage("en")}
          aria-label="English"
          data-testid="btn-lang-en"
          style={{
            position: "absolute",
            left: 1810,
            top: 32,
            width: 75,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        />
        <button
          onClick={() => setLanguage("zh")}
          aria-label="中文"
          data-testid="btn-lang-zh"
          style={{
            position: "absolute",
            left: 1885,
            top: 32,
            width: 75,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        />

        {/* Button: PLAY NOW (centered) - switches image based on language */}
        <a
          href={`/login?return=${encodeURIComponent("/game.html")}`}
          aria-label={t("play_now")}
          data-testid="btn-play-now"
          style={{
            position: "absolute",
            left: 791,
            top: 375,
            width: 466,
            height: 117,
            display: "block",
            backgroundImage: language === "zh" ? "url(/img/btn_play_cn.png)" : "url(/img/btn_play.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            borderRadius: 10,
            cursor: "pointer",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.outline = "2px solid rgba(255,215,106,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        />

        {/* Card: DUEL (visual only, greyed out - not live yet) */}
        <div
          aria-label={t("duel")}
          data-testid="card-duel"
          style={{
            position: "absolute",
            left: 88,
            top: 563,
            width: 460,
            height: 312,
            backgroundImage: "url(/img/card_duel.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 10,
            pointerEvents: "none",
            filter: "grayscale(100%) brightness(0.7)",
            opacity: 0.6,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#FFD76A",
              textShadow: "-3px 0 #000, 3px 0 #000, 0 -3px #000, 0 3px #000",
              whiteSpace: "nowrap",
            }}
          >
            {language === "zh" ? "对决" : "DUEL"}
          </span>
        </div>

        {/* Card: DEFENSE */}
        <a
          href={`/login?return=${encodeURIComponent("/game.html?mode=defense")}`}
          aria-label={t("defense")}
          data-testid="card-defense"
          style={{
            position: "absolute",
            left: 577,
            top: 562,
            width: 460,
            height: 312,
            display: "block",
            backgroundImage: "url(/img/card_defense.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 10,
            cursor: "pointer",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.outline = "2px solid rgba(255,215,106,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#FFD76A",
              textShadow: "-3px 0 #000, 3px 0 #000, 0 -3px #000, 0 3px #000",
              whiteSpace: "nowrap",
            }}
          >
            {language === "zh" ? "防守" : "DEFENSE"}
          </span>
        </a>

        {/* Card: RANKINGS */}
        <a
          href="/leaderboard"
          aria-label={t("rankings")}
          data-testid="card-rankings"
          style={{
            position: "absolute",
            left: 1077,
            top: 562,
            width: 460,
            height: 312,
            display: "block",
            backgroundImage: "url(/img/card_rankings.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 10,
            cursor: "pointer",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.outline = "2px solid rgba(255,215,106,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#FFD76A",
              textShadow: "-3px 0 #000, 3px 0 #000, 0 -3px #000, 0 3px #000",
              whiteSpace: "nowrap",
            }}
          >
            {language === "zh" ? "排行" : "RANKINGS"}
          </span>
        </a>

        {/* Leaderboard Panel - switches image based on language */}
        <div
          data-testid="panel-weekly-top10"
          style={{
            position: "absolute",
            left: 1577,
            top: 555,
            width: 397,
            height: 520,
          }}
        >
          <img
            src={language === "zh" ? "/img/panel_top10_cn.png" : "/img/panel_top10.png"}
            alt={t("weekly_top10")}
            draggable={false}
            style={{
              ...layerStyle,
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {/* Flow bar */}
        <img
          src="/img/flow.png"
          alt="Tournament flow"
          draggable={false}
          data-testid="flow-bar"
          style={{
            ...layerStyle,
            left: 0,
            top: 864,
            width: 2048,
            height: 288,
          }}
        />

        {/* Flow bar text labels - centered under each icon */}
        <span
          data-testid="text-flow-play"
          style={{
            position: "absolute",
            left: 460,
            top: 1010,
            transform: "translateX(-50%)",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#FFD76A",
            textShadow: "-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000",
            whiteSpace: "nowrap",
          }}
          className="pt-[0px] pb-[0px] mt-[30px] mb-[30px] ml-[90px] mr-[90px]">
          {language === "zh" ? "玩" : "PLAY"}
        </span>
        <span
          data-testid="text-flow-enjoy"
          style={{
            position: "absolute",
            left: 700,
            top: 1010,
            transform: "translateX(-50%)",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#FFD76A",
            textShadow: "-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000",
            whiteSpace: "nowrap",
          }}
          className="mt-[30px] mb-[30px] ml-[160px] mr-[160px]">
          {language === "zh" ? "享受" : "ENJOY"}
        </span>
        <span
          data-testid="text-flow-earn"
          style={{
            position: "absolute",
            left: 940,
            top: 1010,
            transform: "translateX(-50%)",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#FFD76A",
            textShadow: "-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000",
            whiteSpace: "nowrap",
          }}
          className="mt-[30px] mb-[30px] ml-[265px] mr-[265px]">
          {language === "zh" ? "赚" : "EARN"}
        </span>

        {/* Debug overlay */}
        <img
          id="debugOverlay"
          src="/img/reference.png"
          alt=""
          draggable={false}
          style={{
            ...layerStyle,
            left: 0,
            top: 0,
            width: 2048,
            height: 1152,
            opacity: showDebug ? 0.28 : 0,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />

        {/* Debug hint */}
        <div
          data-testid="text-debug-hint"
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            color: "rgba(255,255,255,0.3)",
            fontSize: 14,
            fontFamily: "monospace",
            pointerEvents: "none",
          }}
        >
          {t("debug_hint")}
        </div>
      </div>
    </div>
  );
}
