export type RateAlertDirection = 'above' | 'below'

export type RateAlert = {
  /** Stable id derived from the pair, e.g. `USD>MYR`. One alert per pair. */
  id: string
  from: string
  to: string
  /** Target rate, expressed as `to` units per 1 `from`. Must be > 0. */
  target: number
  direction: RateAlertDirection
  /** Unix ms when the alert was created or last edited. */
  createdAt: number
  /**
   * True = the next refetch that meets the condition will fire a notification.
   * Becomes false once fired; re-arms when the live rate moves back across the
   * threshold so the user is not spammed every 60s.
   */
  armed: boolean
  /** Unix ms of the most recent fire (snackbar shown). */
  lastTriggeredAt?: number
}
