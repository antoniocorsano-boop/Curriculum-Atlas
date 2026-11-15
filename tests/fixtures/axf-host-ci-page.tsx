"use client";
import { AtlasPreviewHost } from "@/features/experiences/atlas-preview-host";
import minimal from "../../fixtures/studio-atlas-preview/valid/minimal.json";
import orientation from "../../fixtures/studio-atlas-preview/valid/edutwin-orientation.json";

const snapshots = [minimal, orientation, { ...minimal, pathwayId: "denied", title: "SYNTHETIC_DENIED", studentAuthorized: true }];
export default function AtlasHostFixture() { return <AtlasPreviewHost snapshots={snapshots} />; }
