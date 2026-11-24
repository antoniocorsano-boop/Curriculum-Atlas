"use client";

import { PathwayRuntimeSurface, type PathwayRuntimeSurfaceProps } from "../pathways/pathway-runtime-surface";
import type { ReviewPresentationAdapter } from "./review-presentation-adapter";
import { MuseoZeroOpening, museoZeroMission } from "./museo-zero-opening";
import { museoZeroPortrait } from "./museo-zero-narrative";
import { MuseoZeroRoomResponse, MuseoZeroReviewWorkbench } from "./museo-zero-revision-surfaces";
import { MuseoLocation, MuseoPrediction, MuseoExtension, museoOutcome } from "./museo-zero-investigation";

function Mission() {
  return <div className="mz-mission" data-testid="museo-mission-reminder"><p><strong>La tua missione:</strong> {museoZeroMission}</p></div>;
}
function Portrait({name,variant}: {name:string;variant:"character"|"evidence"}) {
  const src = museoZeroPortrait(name);
  if (!src) return variant === "character" ? <>{name.slice(0, 1)}</> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={variant === "character" ? "mz-character-portrait" : "mz-evidence-portrait"} src={src} alt={variant === "character" ? "" : name} />;
}
const adapter: ReviewPresentationAdapter = {
  experienceId:"studio-preview-pw-strategy-selection-01-museo-zero",
  openingScene:"MZ1_FAILED_REHEARSAL",
  predictionScene:"MZ4_TEST_MAPPING",
  interviewScene:"MZ2_RECONSTRUCT_DAY",
  comparisonScene:"MZ5_COMPARE_RECOVERY",
  extensionScene:"MZ7_QUIET_CLOSE",
  missionHiddenScenes:["MZ6_FINAL_REHEARSAL","MZ7_QUIET_CLOSE"],
  Opening:MuseoZeroOpening, Mission, Portrait,
  RoomResponse:MuseoZeroRoomResponse, Location:MuseoLocation,
  Workbench:MuseoZeroReviewWorkbench, PredictionPanel:MuseoPrediction,
  Extension:MuseoExtension, outcome:museoOutcome,
};
export function MuseoZeroReviewSurface(props: Omit<PathwayRuntimeSurfaceProps,"reviewAdapter">) {
  return <PathwayRuntimeSurface {...props} reviewAdapter={adapter} />;
}
