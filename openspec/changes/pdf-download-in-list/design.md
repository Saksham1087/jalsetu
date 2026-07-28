## Decisions

**Decision 1: Remove download from ComplaintDetail**
The detail bottom sheet opens from map marker clicks. Remove the download button entirely so it's not accessible from the map path.

**Decision 2: Add download to ComplaintCard footer**
Place the download button in the card footer bar (bottom colored section) alongside the ID and userName. A small icon button that triggers PDF download. Stops event propagation so the card isn't "clicked" (the card has no click handler currently, but keep it isolated).

## Risks / Trade-offs

- None — simple UI relocation, no logic changes
