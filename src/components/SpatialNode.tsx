import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../types'

const themeColor: Record<string, string> = {
  'Progettazione e problem solving': '#f59e0b',
  'Dati e strumenti digitali': '#22c55e',
  'Coding e pensiero computazionale': '#14b8a6',
  'Rappresentazione tecnica': '#38bdf8',
  'Reti e cloud': '#818cf8',
  'IA literacy': '#e879f9',
}

export function SpatialNode({
  id, label, subtitle, target, opacity, selected, theme, kind, warning, onSelect, reducedMotion,
}: {
  id: string
  label: string
  subtitle: string
  target: Vec3
  opacity: number
  selected: boolean
  theme: string
  kind: 'curriculum' | 'segment'
  warning?: boolean
  onSelect: (id: string) => void
  reducedMotion: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const targetVec = useMemo(() => new THREE.Vector3(...target), [target])
  const color = kind === 'segment' ? '#f8fafc' : themeColor[theme] ?? '#60a5fa'

  useFrame((_, delta) => {
    if (!group.current || !material.current) return
    const speed = reducedMotion ? 1 : 1 - Math.exp(-delta * 4.5)
    if (reducedMotion) group.current.position.copy(targetVec)
    else group.current.position.lerp(targetVec, speed)

    const desired = opacity * (hovered || selected ? 1 : 0.88)
    material.current.opacity += (desired - material.current.opacity) * Math.min(1, delta * 8)

    const scale = selected ? 1.35 : hovered ? 1.16 : 1
    group.current.scale.lerp(
      new THREE.Vector3(scale, scale, scale),
      reducedMotion ? 1 : Math.min(1, delta * 7),
    )
  })

  return (
    <group ref={group} position={target}>
      <mesh
        onClick={(event) => { event.stopPropagation(); onSelect(id) }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        {kind === 'segment'
          ? <boxGeometry args={[0.9, 0.56, 0.36]} />
          : <sphereGeometry args={[0.36, 28, 28]} />}
        <meshStandardMaterial
          ref={material}
          color={color}
          transparent
          opacity={opacity}
          roughness={0.36}
          metalness={0.1}
        />
      </mesh>

      {(hovered || selected) && opacity > 0.2 && (
        <Html center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className={'node-label' + (warning ? ' warning' : '')}>
            <strong>{label}</strong>
            <span>{subtitle}</span>
          </div>
        </Html>
      )}
    </group>
  )
}
