# ATLAS-INTEGRAL-01 — Product role and Material Studio boundary

**Status:** PROPOSED / HUMAN REVIEW REQUIRED / RUNTIME NOT AUTHORIZED  
**Date:** 2026-09-21  
**Ecosystem:** TRAMA · Arena · Curriculum Atlas · Docente OS  
**Decision reference:** proposed TRAMA-ADR-010

## 1. Product definition

Curriculum Atlas is the **integral curriculum visualization, exploration and intelligent-navigation product** of TRAMA.

It must not be reduced to:
- a file repository;
- a visual-card catalogue;
- a 3D/Spatial experience;
- a lesson editor;
- a curriculum-authority system.

Atlas uses one semantic model to connect the official curriculum representation to progressions, concepts, Learning Objects, resources and published learning surfaces.

## 2. Core domains

### 2.1 Curriculum map

Navigable chain:

`school order → discipline → grade/year → competence/milestone → objective → nucleus/concept → knowledge/skill → evidence → published lesson/resource`.

Atlas must preserve the exact Arena binding and show provenance/version under progressive disclosure.

### 2.2 Progressions and paths

Atlas should support:
- vertical progression across grades;
- horizontal/interdisciplinary relations;
- prerequisites and successor concepts;
- “Segui il concetto” paths;
- learning sequences and alternative routes;
- visual grammars appropriate to the relation type.

### 2.3 Smart Navigation

Examples of supported information needs:
- “Dove viene introdotto per la prima volta questo concetto?”
- “Come evolve tra primaria e secondaria?”
- “Quali prerequisiti servono?”
- “Quali obiettivi non sono ancora coperti?”
- “Quali risorse sono disponibili per questo nodo?”

The result should navigate to and highlight the relevant curriculum nodes, not only return prose.

### 2.4 Student Learning Hub

Contextual student-facing surfaces:
- Lezioni;
- Obiettivi;
- materiali;
- “cosa abbiamo fatto?”;
- “dove e come ho imparato questo?”.

Student surfaces do not replace the global curriculum navigation.

### 2.5 Educational Resource Library

Atlas stores and relates:
- Learning Objects;
- infographics;
- student sheets;
- teacher guides;
- presentations;
- images;
- diagrams;
- assessments where publishable;
- interactive assets.

Every resource preserves identity, version, provenance, editorial state and curriculum binding.

**Invariant:** the library is one dimension of Atlas; it is not the whole product.

## 3. Information architecture

Primary global navigation target:
- **Curricolo**
- **Percorsi**
- **Risorse**
- **Esplora**

Contextual Student Hub views:
- **Lezioni**
- **Obiettivi**

Explore modes may include:
- Verticale;
- Timeline;
- Matrice;
- Rete;
- Mappa 2D;
- Galaxy/Spatial;
- Elenco.

Galaxy/Spatial remains a specialist visualization, not the product definition.

## 4. Authority boundary

### Arena
Authoritative for curriculum source, applicability, approval state, versions and institutional provenance.

### Atlas
Authoritative for:
- own Learning Object/resource identities;
- own publication/editorial state;
- own navigable projections and indexes;
- own PublicationReceipt;
- curriculum-to-resource/publication links as derived Atlas relationships.

Atlas does not become curriculum authority.

### Docente OS
Authoritative for:
- teacher context;
- class/lesson preparation;
- teaching-session decisions;
- adaptation/selection of materials;
- decision to use or publish.

## 5. Reuse before generation

Before creating a new teaching asset, the ecosystem should query Atlas for compatible resources by:
- curriculum node;
- discipline;
- grade;
- pedagogical function;
- format/use context;
- lifecycle/editorial state.

The teacher is offered:
- **Riutilizza**
- **Adatta**
- **Crea nuova**

Similarity does not imply adoption.

## 6. Officina materiali boundary

The **Officina materiali** is a specialist production capability governed by TRAMA. It is not a new authority domain.

It may:
- consume a structured brief from Docente OS;
- use Atlas Learning Objects, patterns and design profiles;
- choose specialist rendering/generation providers for different artifact types;
- return multiple editable proposals;
- record production provenance.

It may not:
- approve curriculum;
- decide adoption;
- publish automatically;
- change Atlas lifecycle/editorial state;
- bypass rights/accessibility checks.

Target flow:

`Arena context → Docente OS → Atlas reuse search → brief → Officina materiali → teacher review → lesson use → optional Atlas publication`.

## 7. Lesson material vs Atlas resource

A material used in a lesson can remain local/provisional.

It becomes an Atlas published resource only after explicit teacher intent and applicable gates:
- curriculum/didactic coherence;
- editorial quality;
- accessibility;
- provenance;
- rights/licensing;
- human review.

Publication remains governed by:
`LessonPublicationManifest → Atlas → PublicationReceipt`.

## 8. Visual Library compatibility

Existing Visual Library concepts remain useful:
- Learning Object;
- visual patterns;
- design profiles;
- artifacts and provenance.

The clarification is that Visual Library knowledge/templates can **support** specialist production, while the production engine itself is not assumed to be Docente OS and does not define Atlas as a whole.

## 9. Non-goals

This document does not authorize:
- runtime Material Studio;
- autonomous publication;
- student personalization using personal data;
- a shared Arena/Atlas/Docente OS database;
- a new curriculum authority path;
- DOS-A1 activation.

## 10. Review gate

Before promotion:
1. Atlas integral role is confirmed;
2. global navigation vs Student Hub navigation is confirmed;
3. reuse-before-generate is confirmed;
4. Material Studio ownership/boundary is confirmed;
5. existing ATLAS-04 semantics are reconciled;
6. no authority shift from Arena is introduced;
7. no runtime is implied by documentation.
