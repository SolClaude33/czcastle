export default function SocialIcons() {
  return (
    <>
      <a
        href="https://x.com/OneBattleLegend"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 z-50"
        data-testid="link-twitter"
      >
        <img
          src="/assets/ui/icon_twitter.png"
          alt="Twitter/X"
          className="w-16 h-16 mt-[45px] mb-[45px]"
          style={{ imageRendering: 'pixelated' }}
        />
      </a>
      <a
        href="https://t.me/Onebattlelegend"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50"
        data-testid="link-telegram"
      >
        <img
          src="/assets/ui/icon_telegram.png"
          alt="Telegram"
          className="w-16 h-16 mt-[45px] mb-[45px]"
          style={{ imageRendering: 'pixelated' }}
        />
      </a>
    </>
  );
}
