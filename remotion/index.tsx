// Remotion kökü — OFFLINE render (scripts/render-video.mjs). Sitede çalışmaz; çıktı public/media/video'ya statik dosya.
import { Composition, registerRoot } from "remotion";
import { HeroLoop } from "./HeroLoop";
import { ProcessFlow } from "./ProcessFlow";

export const FPS = 30;

function Root() {
  return (
    <>
      <Composition id="hero-loop" component={HeroLoop} width={1280} height={720} fps={FPS} durationInFrames={FPS * 8} />
      <Composition id="process-flow" component={ProcessFlow} width={1600} height={400} fps={FPS} durationInFrames={FPS * 6} />
    </>
  );
}

registerRoot(Root);
