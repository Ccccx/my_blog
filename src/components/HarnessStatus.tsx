import type { FeatureStatus } from '../lib/codeHarness'
import { STATUS_LABEL } from '../lib/codeHarness'

export function HarnessStatus({ status }: { status: FeatureStatus }) {
  const tone = status.replace(/\s+/g, '-')
  return (
    <span className={`status-badge status-${tone}`}>
      {status}
      <small>{STATUS_LABEL[status]}</small>
    </span>
  )
}
