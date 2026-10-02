// Transient failure — schedule retry
const newRetryCount = report.retryCount + 1;
const nextRetryAt = nextRetryDate(newRetryCount);

if (newRetryCount >= MAX_RETRIES) {
  await markFailed(clientId, err.message);
} else {
  await markPending(clientId, err.message); // ← pass the error
}

await updateQueueItem(clientId, {
  retryCount: newRetryCount,
  lastError: err.message,
  nextRetryAt,
});

await logSyncEvent(clientId, HISTORY_EVENTS.SYNC_FAILED, {
  reason: err.message,
  code: err.code,
  retryCount: newRetryCount,
  nextRetryAt,
  permanent: false,
});

emit({
  type: "transient_failure",
  clientId,
  error: err.message,
  nextRetryAt,
});
return { status: "pending", clientId, error: err.message };
