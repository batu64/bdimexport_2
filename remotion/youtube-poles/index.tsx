// YouTube tanıtım videosu kökü — sitenin remotion/index.tsx'inden ayrı (kendi public klasörü var).
// Önizleme: npx remotion studio remotion/youtube-poles/index.tsx --public-dir remotion/youtube-poles/public
// Render:   node remotion/youtube-poles/render.mjs [en|tr|shorts-en|shorts-ar ...]
import { Composition, registerRoot, Still } from "remotion";
import { FPS, PolesVideo, Thumbnail, TOTAL_FRAMES } from "./PolesVideo";
import { SHORT_FRAMES, ShortsCover, ShortsPoles } from "./ShortsPoles";

function Root() {
  return (
    <>
      <Composition id="poles-youtube-en" component={PolesVideo} width={1920} height={1080} fps={FPS} durationInFrames={TOTAL_FRAMES} defaultProps={{ lang: "en" as const }} />
      <Composition id="poles-youtube-tr" component={PolesVideo} width={1920} height={1080} fps={FPS} durationInFrames={TOTAL_FRAMES} defaultProps={{ lang: "tr" as const }} />
      <Still id="poles-thumb-en" component={Thumbnail} width={1280} height={720} defaultProps={{ lang: "en" as const }} />
      <Still id="poles-thumb-tr" component={Thumbnail} width={1280} height={720} defaultProps={{ lang: "tr" as const }} />
      {/* Dikey Shorts/Reels — yalnız ahşap elektrik direği */}
      <Composition id="poles-shorts-en" component={ShortsPoles} width={1080} height={1920} fps={FPS} durationInFrames={SHORT_FRAMES} defaultProps={{ lang: "en" as const }} />
      <Composition id="poles-shorts-ar" component={ShortsPoles} width={1080} height={1920} fps={FPS} durationInFrames={SHORT_FRAMES} defaultProps={{ lang: "ar" as const }} />
      <Still id="poles-shorts-cover-en" component={ShortsCover} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
      <Still id="poles-shorts-cover-ar" component={ShortsCover} width={1080} height={1920} defaultProps={{ lang: "ar" as const }} />
    </>
  );
}

registerRoot(Root);
