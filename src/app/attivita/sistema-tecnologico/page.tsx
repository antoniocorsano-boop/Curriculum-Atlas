"use client";
import rawDefinition from "../../../../content/experiences/smart/sistema-tecnologico.v1.json";
import {ExperienceRuntime} from "@/features/experiences/experience-runtime";
import type {ExperienceDefinition} from "@/features/experiences/model";

const definition=rawDefinition as ExperienceDefinition;

export default function SistemaTecnologicoPage(){
 return <ExperienceRuntime definition={definition}/>;
}
