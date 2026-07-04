import type { OrderStatus, TrackingOrder } from "@/types";

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "order_received",
  "measurement_taken",
  "cutting_started",
  "stitching_in_progress",
  "finishing_work",
  "ready_for_trial",
  "completed",
  "delivered",
];

/** Builds the step-by-step timeline for an order given its current status. */
export function buildTimeline(
  currentStatus: OrderStatus,
  orderDate: string,
): TrackingOrder["timelineSteps"] {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  const start = new Date(orderDate);

  return ORDER_STATUS_SEQUENCE.map((status, index) => {
    const done = index <= currentIndex;
    if (!done) return { status, done: false };
    const date = new Date(start);
    date.setDate(date.getDate() + index * 2);
    return { status, done: true, date: date.toISOString().slice(0, 10) };
  });
}

export function progressFor(status: OrderStatus): number {
  const index = ORDER_STATUS_SEQUENCE.indexOf(status);
  return Math.round(((index + 1) / ORDER_STATUS_SEQUENCE.length) * 100);
}
