import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { NODE_TYPE_META } from '../data/graph'

const idOf = (endpoint) => (endpoint && typeof endpoint === 'object' ? endpoint.id : endpoint)
const linkKey = (source, target) => `${idOf(source)}->${idOf(target)}`

const HIGHLIGHT = '#f59e0b'
const LINK_DIM = 'rgba(148, 163, 184, 0.35)'

/**
 * Renders the returned subgraph with react-force-graph (off the shelf, per spec).
 * Highlighted nodes/links (e.g. HQ2's shortest path) get a marquee treatment:
 * amber color, thicker edges, directional particles, and a glow ring.
 */
export default function GraphPane({ subgraph, loading, partial }) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Size the canvas to its container.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Clone nodes/links so react-force-graph can mutate its own copies (it attaches
  // x/y/vx/vy and resolves link endpoints in place) without touching our source data.
  const graphData = useMemo(() => {
    const nodes = (subgraph?.nodes ?? []).map((n) => ({ ...n }))
    const links = (subgraph?.links ?? []).map((l) => ({ ...l }))
    return { nodes, links }
  }, [subgraph])

  const highlightNodes = useMemo(() => new Set(subgraph?.highlightNodes ?? []), [subgraph])
  const highlightLinks = useMemo(
    () => new Set((subgraph?.highlightLinks ?? []).map(([s, t]) => linkKey(s, t))),
    [subgraph],
  )

  const isNodeHi = useCallback((node) => highlightNodes.has(node.id), [highlightNodes])
  const isLinkHi = useCallback(
    (link) => highlightLinks.has(linkKey(link.source, link.target)),
    [highlightLinks],
  )

  // Fit the graph to view once the force layout has settled. Fitting mid-simulation
  // (on a timer) clips nodes that are still drifting outward, so we wait for the
  // engine to stop instead — this fires again on every data change (new data reheats
  // the simulation).
  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(450, 70)
  }, [])

  // Spread nodes out so labels don't overlap (default forces pack a small subgraph
  // too tightly). Re-applied whenever the data changes, then reheat the layout.
  useEffect(() => {
    const fg = fgRef.current
    if (!fg || graphData.nodes.length === 0) return
    fg.d3Force('charge')?.strength(-280)
    fg.d3Force('link')?.distance(70)
    fg.d3ReheatSimulation?.()
  }, [graphData, size.width, size.height])

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const meta = NODE_TYPE_META[node.type] ?? { color: '#64748b', label: node.type }
      const hi = isNodeHi(node)
      const r = hi ? 6 : 4.5

      if (hi) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 3.5, 0, 2 * Math.PI)
        ctx.fillStyle = 'rgba(245, 158, 11, 0.16)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 1.5, 0, 2 * Math.PI)
        ctx.strokeStyle = HIGHLIGHT
        ctx.lineWidth = 1.25
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.fillStyle = meta.color
      ctx.fill()

      const fontSize = Math.max(11 / globalScale, 2)
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = hi ? '#fde68a' : '#cbd5e1'
      ctx.fillText(node.label, node.x, node.y + r + 1.5)
    },
    [isNodeHi],
  )

  const paintPointerArea = useCallback((node, color, ctx) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const isEmpty = graphData.nodes.length === 0

  return (
    <div className="graph-pane" ref={containerRef}>
      {size.width > 0 && !isEmpty && (
        <ForceGraph2D
          ref={fgRef}
          width={size.width}
          height={size.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={5}
          nodeLabel={(n) => `${n.label} · ${NODE_TYPE_META[n.type]?.label ?? n.type}`}
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => 'replace'}
          nodePointerAreaPaint={paintPointerArea}
          linkColor={(l) => (isLinkHi(l) ? HIGHLIGHT : LINK_DIM)}
          linkWidth={(l) => (isLinkHi(l) ? 2.5 : 1)}
          linkDirectionalArrowLength={(l) => (isLinkHi(l) ? 5 : 3)}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={(l) => (isLinkHi(l) ? 4 : 0)}
          linkDirectionalParticleWidth={2.5}
          linkDirectionalParticleColor={() => HIGHLIGHT}
          cooldownTicks={120}
          d3VelocityDecay={0.3}
          minZoom={0.4}
          maxZoom={3}
          onEngineStop={handleEngineStop}
        />
      )}

      <Legend />

      {subgraph?.sample && !loading && (
        <div className="graph-badge">sample graph — pick a question</div>
      )}
      {partial && !loading && (
        <div className="graph-badge graph-badge--partial">Free · partial view — upgrade for the full graph</div>
      )}
      {loading && <div className="graph-loading">Running graph query…</div>}
    </div>
  )
}

function Legend() {
  return (
    <div className="legend">
      {Object.entries(NODE_TYPE_META).map(([key, meta]) => (
        <span className="legend__item" key={key}>
          <span className="legend__dot" style={{ background: meta.color }} />
          {meta.label}
        </span>
      ))}
    </div>
  )
}
