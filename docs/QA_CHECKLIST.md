# Manual QA Checklist

## Environment
- [ ] MAMP MySQL running on port 8889
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173

## Home & Navigation
- [ ] Home page loads
- [ ] Nav links work (Home, Field Worker, Coordinator, Debug)
- [ ] Role switcher works
- [ ] Role persists across refresh
- [ ] Sync button visible in header

## Form Validation
- [ ] Empty description blocked
- [ ] Short description blocked
- [ ] Empty location blocked
- [ ] Valid form submits

## Field Worker
- [ ] Create report online → syncs
- [ ] Create report offline → pending
- [ ] Reports list shows own reports
- [ ] Count matches list length
- [ ] Filters work

## Coordinator
- [ ] All non-draft reports visible
- [ ] Only valid transitions shown as buttons
- [ ] Invalid transitions never available
- [ ] Assign report works
- [ ] Status updates update server

## Workflow
- [ ] SUBMITTED → ASSIGNED works
- [ ] ASSIGNED → IN_PROGRESS works
- [ ] IN_PROGRESS → RESOLVED works
- [ ] RESOLVED → Reopen works
- [ ] SUBMITTED → REJECTED works
- [ ] REJECTED → Reopen works

## Synchronization
- [ ] Online create → auto-sync
- [ ] Offline create → pending
- [ ] Online return → auto-sync
- [ ] Manual sync button works
- [ ] Failed sync retried
- [ ] Server down → FAILED state
- [ ] Server back → recovery

## Idempotency
- [ ] Retry same report → no duplicate
- [ ] sync_log shows DUPLICATE event
- [ ] MySQL has only one row

## Persistence
- [ ] Refresh keeps data
- [ ] Browser restart keeps data
- [ ] History persists

## Debug Page
- [ ] Online status shown
- [ ] Report count matches main
- [ ] Sync queue visible
- [ ] Clear all works

## Error Handling
- [ ] Validation errors shown in form
- [ ] Network errors shown in card
- [ ] No console errors

## Console
- [ ] No red errors in DevTools Console
- [ ] No failed network requests