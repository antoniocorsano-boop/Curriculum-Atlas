# ECO-00 — Integrated platform architecture

Status: PROPOSED_CANONICAL  
Date: 2026-09-19  
Repository role: semantic/public experience layer

## Mission

Curriculum Atlas is the **intelligibility, navigation and reusable-content layer** between CurManLight Arena and Docente OS.

**Arena governs → Atlas makes intelligible/navigable → Docente OS makes operational.**

Atlas is not a second curriculum authority and not a teacher workspace.

## Source boundaries

Atlas consumes:
- `CurriculumSnapshot` from Arena;
- public/versioned Learning Object and material manifests;
- assurance evidence appropriate for publication.

Atlas emits:
- `LearningObjectManifest`;
- `MaterialAssetManifest`;
- `PatternApplication`;
- read-only `HandoffContext`;
- validation evidence references.

Atlas does not modify Arena or Docente OS databases.

## Information architecture

Primary navigation:
1. Curricolo
2. Percorsi
3. Materiali
4. Mappa
5. Fonti

Spatial/Galaxy remains an advanced view, not the only entry point.

## Smart views

The same canonical data powers:
- vertical progression;
- timeline;
- dependency view;
- coverage matrix;
- evidence view;
- materials readiness;
- normative lens;
- validation lens;
- curriculum health;
- concept/system maps;
- Galaxy/Spatial.

No smart view creates a second source of truth.

## Learning Object

A Learning Object is a manifest, not a file.

Identity chain:
`curriculum_node_id → LO_ID → PAT_ID → APP_ID → ART_ID`.

Lifecycle:
`DRAFT → GENERATED → REVIEWED → CANONICAL → RETIRED`.

Promotion requires valid human evidence. Atlas never promotes because a rendering succeeded.

## Public privacy posture

Default public Atlas:
- no student personal data;
- no authentication required for public curricular/material surfaces;
- no unnecessary personal tracking;
- no secret/provider credentials;
- only public-safe provenance and assurance evidence.

## AI

Atlas AI is read-only/propositive by default:
- semantic navigation;
- explanation;
- gap detection;
- path/material suggestions.

It cannot approve curriculum or change lifecycle automatically.

## Trust layer

Atlas is the main public renderer of `AssuranceRecord`.

Primary badges are discreet and evidence-backed:
- FONTE VERIFICATA;
- DA RIVEDERE;
- REVIEWED;
- CANONICAL;
- VALIDATO IN CLASSE;
- REVISIONE UMANA;
- NESSUN DATO PERSONALE;
- A11Y TEST PASS;
- BUILD VERIFICATA.

Maximum 2–3 badges on the primary card. Full details live in a Trust Drawer.

No generic legal-compliance badge.

## Accessibility

Target: WCAG 2.2 AA.

Every Canvas/3D experience requires an equivalent semantic HTML route.

## Milestones

### ATLAS-P1 — Public Curriculum & Lesson Materials Hub
Public task-oriented shell, Materials Hub, LO page, curriculum views, provenance and responsive/accessibility gates.

### ECO-T1 — Trust Badges & Assurance Registry
Render assurance evidence by exact subject/version/SHA.

## References

Masterplan:
https://docs.google.com/document/d/1DFiwpEXcZqPp2Aqvo5Q13sd4wkp22CnzhRrrkJMSWiM/edit

Process:
https://docs.google.com/document/d/199ZL3s8M6YLArcB_4nCv2uRePZJBbqwq0ky78-7zvU0/edit

Registry:
https://docs.google.com/spreadsheets/d/1-rZsKRPXxFZQzTrK7DAno6TUiZsXywSkSdnbB4Dwvpw/edit
