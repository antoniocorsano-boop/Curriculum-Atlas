import { AdaptiveDpr, Line, OrbitControls, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import fixtureJson from '../data/s1-fixture.json'
import { positionsFor, visibilityFor } from '../lib/layouts'
import { useAtlasStore } from '../store/useAtlasStore'
import type { AtlasFixture } from '../types'
import { SpatialNode } from './SpatialNode'

const fixture = fixtureJson as unknown as AtlasFixture

export function AtlasScene({ reducedMotion }: { reducedMotion: boolean }) {
  const view = useAtlasStore((state) => state.view)
  const selectedId = useAtlasStore((state) => state.selectedId)
  const select = useAtlasStore((state) => state.select)
  const statusFilter = useAtlasStore((state) => state.statusFilter)
  const positions = positionsFor(view, fixture, selectedId)

  const nodeVisible = (status: string) =>
    statusFilter === 'all' ||
    (statusFilter === 'accepted' && status === 'SOURCE_ACCEPTED_FOR_PILOT') ||
    (statusFilter === 'review' && status === 'NEEDS_HUMAN_REVIEW')

  return (
    <Canvas
      aria-label="Atlante curricolare tridimensionale"
      camera={{ position: [0, 0, 16], fov: 48 }}
      dpr={[1, 1.7]}
    >
      <color attach="background" args={['#06101d']} />
      <fog attach="fog" args={['#06101d', 15, 32]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 8, 7]} intensity={2.2} />
      <pointLight position={[-7, -5, 4]} intensity={40} distance={14} color="#0ea5e9" />

      {!reducedMotion && (
        <Stars radius={36} depth={18} count={700} factor={2} saturation={0} fade speed={0.25} />
      )}

      {fixture.links.map((link) => {
        const sourcePosition = positions.get(link.sourceNodeId)
        const targetPosition = positions.get(link.targetSegmentId)
        if (!sourcePosition || !targetPosition) return null

        const source = fixture.nodes.find((node) => node.id === link.sourceNodeId)
        if (source && !nodeVisible(source.status)) return null

        const inFocus =
          view !== 'focus' ||
          selectedId === link.sourceNodeId ||
          selectedId === link.targetSegmentId
        if (!inFocus) return null

        const color =
          link.status === 'BLOCKED_PENDING_SOURCE_REVIEW'
            ? '#f59e0b'
            : link.status === 'EXPLORATORY_PROPOSED'
              ? '#a3e635'
              : '#94a3b8'

        return (
          <Line
            key={link.id}
            points={[sourcePosition, targetPosition]}
            color={color}
            lineWidth={link.status === 'REVIEW_READY_PROPOSED' ? 1.2 : 0.75}
            transparent
            opacity={0.48}
          />
        )
      })}

      {fixture.nodes.map((node) => {
        if (!nodeVisible(node.status)) return null
        return (
          <SpatialNode
            key={node.id}
            id={node.id}
            label={node.nodeType}
            subtitle={node.theme}
            target={positions.get(node.id) ?? [0, 0, 0]}
            opacity={visibilityFor(view, node.id, fixture, selectedId)}
            selected={selectedId === node.id}
            theme={node.theme}
            kind="curriculum"
            warning={node.status === 'NEEDS_HUMAN_REVIEW'}
            onSelect={select}
            reducedMotion={reducedMotion}
          />
        )
      })}

      {fixture.segments.map((segment) => (
        <SpatialNode
          key={segment.id}
          id={segment.id}
          label={segment.grade + ' · UDA ' + segment.uda}
          subtitle={segment.focus}
          target={positions.get(segment.id) ?? [0, 0, 0]}
          opacity={visibilityFor(view, segment.id, fixture, selectedId)}
          selected={selectedId === segment.id}
          theme=""
          kind="segment"
          onSelect={select}
          reducedMotion={reducedMotion}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={25}
        autoRotate={view === 'universe' && !reducedMotion}
        autoRotateSpeed={0.22}
      />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
