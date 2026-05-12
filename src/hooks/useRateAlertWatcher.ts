import { useEffect, useRef } from 'react'
import type { RateAlert } from '../types/rateAlert'
import { isRateAlertConditionMet, updateRateAlert } from '../utils/rateAlerts'

type Args = {
  alert: RateAlert | undefined
  /** Live rate from the conversion query (`to` per 1 `from`). */
  rate: number | undefined
  /** Unix ms timestamp of the latest data, used to dedupe re-runs. */
  dataUpdatedAt: number | undefined
  /** Called once each time an armed alert's condition is met. */
  onTrigger: (alert: RateAlert, rate: number) => void
  /** Called whenever this hook mutates the persisted alert (fire or re-arm). */
  onChanged: () => void
}

/**
 * Compares the live conversion rate against the active alert and fires a
 * one-shot notification per breach. After firing, the alert is disarmed; it
 * re-arms automatically when the rate moves back across the threshold so the
 * user is notified again on the next breach instead of every refetch.
 */
export function useRateAlertWatcher({ alert, rate, dataUpdatedAt, onTrigger, onChanged }: Args) {
  const onTriggerRef = useRef(onTrigger)
  const onChangedRef = useRef(onChanged)
  onTriggerRef.current = onTrigger
  onChangedRef.current = onChanged

  // Dedupe key so the effect only acts once per (alert config × data snapshot).
  const lastEvaluatedKeyRef = useRef<string | undefined>(undefined)

  const alertId = alert?.id
  const alertTarget = alert?.target
  const alertDirection = alert?.direction
  const alertArmed = alert?.armed

  useEffect(() => {
    if (!alert) {
      lastEvaluatedKeyRef.current = undefined
      return
    }
    if (rate === undefined || !Number.isFinite(rate)) return
    if (dataUpdatedAt === undefined || dataUpdatedAt <= 0) return

    const key = `${alert.id}|${alert.target}|${alert.direction}|${dataUpdatedAt}`
    if (lastEvaluatedKeyRef.current === key) return
    lastEvaluatedKeyRef.current = key

    const met = isRateAlertConditionMet(alert, rate)

    if (alert.armed && met) {
      const updated: RateAlert = { ...alert, armed: false, lastTriggeredAt: Date.now() }
      updateRateAlert(updated)
      onTriggerRef.current(updated, rate)
      onChangedRef.current()
      return
    }

    if (!alert.armed && !met) {
      const updated: RateAlert = { ...alert, armed: true }
      updateRateAlert(updated)
      onChangedRef.current()
    }
  }, [alert, alertId, alertTarget, alertDirection, alertArmed, rate, dataUpdatedAt])
}
