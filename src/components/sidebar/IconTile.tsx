import type { IconWithSvg } from '../../registry/types'
import styles from './IconTile.module.css'

interface Props {
  icon: IconWithSvg
}

export default function IconTile({ icon }: Props) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/archdoc-icon', icon.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      className={styles.tile}
      draggable
      onDragStart={onDragStart}
      title={icon.name}
    >
      <div
        className={styles.icon}
        dangerouslySetInnerHTML={{ __html: icon.svgContent }}
      />
      <div className={styles.label}>{icon.name}</div>
    </div>
  )
}
