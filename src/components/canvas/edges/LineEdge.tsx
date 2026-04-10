import { memo } from 'react'
import { getStraightPath, BaseEdge, type EdgeProps } from '@xyflow/react'

function LineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
}: EdgeProps) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ strokeWidth: 1.5, stroke: '#94a3b8', strokeDasharray: '5 3', ...style }}
    />
  )
}

export default memo(LineEdge)
