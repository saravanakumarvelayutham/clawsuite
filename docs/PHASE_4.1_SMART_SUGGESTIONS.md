# Phase 4.1 — Smart Model Suggestions

**Priority:** P0 Differentiation  
**Branch:** phase4.1-smart-suggestions  
**Base:** v2.0.6

## Goal

Proactively suggest better model choices to the user **without** auto-switching.

## Context

Users often:
- Use expensive models (Sonnet/Opus) for simple tasks → wasted cost
- Use cheap models (Haiku) for complex tasks → poor results
- Forget to switch back after debugging sessions

Smart suggestions help users optimize cost and quality **while retaining full control**.

## Constraints

- **NO auto-switching** — user must approve every model change
- **Non-intrusive UX** — suggestions are helpful, not annoying
- **Reuse existing APIs** — `/api/models`, `/api/usage`, `/api/model-switch`
- **No new backend routes**

## Suggestion Logic

### When to Suggest Cheaper Model (e.g., Haiku)

Trigger when:
1. User is on Sonnet/Opus
2. Last 3+ messages were simple (short queries, no code, no complex reasoning)
3. No errors in recent responses

**Suggestion:** "Try Haiku? This chat seems lightweight."

### When to Suggest More Powerful Model (e.g., Opus)

Trigger when:
1. User is on Haiku/Sonnet
2. Recent message had errors or "I need more help" signal
3. Task involves code, debugging, or complex planning

**Suggestion:** "Need Opus? This looks complex."

### Cost-Aware Suggestions

Show estimated savings:
- "Switch to Haiku → save ~80% per message"
- "Switch to Opus → better quality (2x cost)"

## UX Design

### Option A: Toast Notification (Preferred)
```
┌────────────────────────────────────┐
│ 💡 Try Haiku?                      │
│ This chat seems lightweight.       │
│ Save ~80% per message.             │
│                                    │
│ [Switch to Haiku] [Dismiss]       │
└────────────────────────────────────┘
```

### Option B: Inline Badge (Less Intrusive)
```
Model: Sonnet 4.5 💡 Try Haiku? [Switch]
```

**Choice:** Start with Option A (more visible, easier to implement)

## Implementation Plan

### New Components

1. **ModelSuggestionToast** (`src/components/model-suggestion-toast.tsx`)
   - Toast notification with suggestion text
   - "Switch" button → calls `/api/model-switch`
   - "Dismiss" button → hides toast, stores dismissal

2. **useModelSuggestions** (`src/hooks/use-model-suggestions.ts`)
   - Analyze chat history for suggestion triggers
   - Track dismissals (localStorage: don't re-suggest same context)
   - Emit suggestion events

### Data Sources (Existing)

- **Current model:** From session metadata (already in chat state)
- **Message history:** Already loaded in chat screen
- **Available models:** `/api/models`

### Suggestion Triggers (Client-Side Heuristics)

```typescript
// Simple task detection
const isSimpleTask = (messages: Message[]) => {
  const recent = messages.slice(-3)
  return recent.every(m => 
    m.content.length < 200 &&
    !m.content.includes('```') &&
    !m.content.match(/debug|error|fix|refactor/i)
  )
}

// Complex task detection
const isComplexTask = (message: Message) => {
  return (
    message.content.length > 500 ||
    message.content.includes('```') ||
    message.content.match(/architecture|design|debug|refactor|optimize/i)
  )
}
```

### Storage

- **Dismissals:** `localStorage.modelSuggestionDismissals` (JSON array)
- **Last suggestion time:** Prevent spam (max 1 suggestion per 5 minutes)

## Files to Change

- `src/components/model-suggestion-toast.tsx` — NEW
- `src/hooks/use-model-suggestions.ts` — NEW
- `src/screens/chat/chat-screen.tsx` — Add hook + toast rendering
- `docs/QA/phase4.1-smart-suggestions_TESTPLAN.md` — Test steps
- `docs/QA/phase4.1-smart-suggestions_RESULTS.md` — Test results

## Manual Test Plan

### T1: Suggest Cheaper Model
1. Start on Sonnet
2. Send 3 short, simple messages
3. **Expected:** Toast suggests Haiku with cost savings

### T2: Suggest More Powerful Model
1. Start on Haiku
2. Send a complex code request
3. **Expected:** Toast suggests Sonnet/Opus

### T3: Dismiss Suggestion
1. Get a suggestion
2. Click "Dismiss"
3. Send similar message
4. **Expected:** No re-suggestion for 5 minutes

### T4: Switch Model via Suggestion
1. Get a suggestion
2. Click "Switch to Haiku"
3. **Expected:** Model switches, toast confirms, chat continues

### T5: Spam Prevention
1. Trigger multiple suggestions rapidly
2. **Expected:** Max 1 toast per 5 minutes

## Security

- No secrets exposed in suggestions
- Model switching uses existing `/api/model-switch` (already sanitized)
- LocalStorage dismissals contain no sensitive data

## Risks

- **Low:** Heuristics may be imperfect (can refine based on feedback)
- **UX:** Toasts might be annoying if too frequent (mitigated by rate limiting)
- **None:** No breaking changes, no new backend

## Deferred

- Server-side ML for smarter suggestions (future enhancement)
- Historical accuracy tracking (future analytics)
- Per-user preference learning (future personalization)

## Success Metrics (Future)

- % of suggestions accepted
- Cost savings from downshifts
- Quality improvements from upshifts
