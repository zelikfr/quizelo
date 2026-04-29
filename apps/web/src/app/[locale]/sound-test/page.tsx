import { SoundTestClient } from "./SoundTestClient";

/**
 * Dev-only page — manually trigger every sound the engine can produce so we
 * don't need to play through a full match to QA audio changes.
 *
 * Reachable at /[locale]/sound-test (e.g. /fr/sound-test, /en/sound-test).
 */
export default function SoundTestPage() {
  return <SoundTestClient />;
}
