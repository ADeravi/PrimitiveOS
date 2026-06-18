# Edge Policies — routing as a first-class, verifiable rule set

Edges used to be the weak point: ELK placed the nodes, cytoscape's `taxi`
curve-style re-routed the connectors at render time, and our port rules were
bolted on *after* layout — three owners, no single source of truth, and nothing
verifiable offline (cytoscape draws the real paths in the browser). So we tuned
edges blind and caught problems by eye.

This policy gives edges the same treatment as the rest of the system —
**one ruleset, one geometry engine, one verifier**:

```
planEdges (policy: fan → port side + budget)
   → buildElkGraph (FIXED_SIDE ports)
   → ELK routes orthogonally, returns exact bend points
   → lintEdges scores the polylines  →  rendered from the SAME sections
```

Because ELK honours fixed port sides and returns the routed sections, what the
headless probe verifies is exactly what gets drawn.

## The routing rules

For each edge, the source vertex (port side) is chosen from the source node's
**fan-out** and the flow **direction**; the target is always entered on its
leading edge (top for vertical idioms, left for horizontal). Each fan has a
**corner budget**.

| Fan | Out of the source | Into the target | Budget |
|---|---|---|---|
| chain (1→1) | bottom | top | ≤1 |
| split (1→2) | the two **sides**, one per child | top | ≤2 |
| fan-out (1→many) | bottom | top | ≤2 |
| merge (n→1) | bottom | shared top | ≤2 |
| decision · primary | **bottom** (straight pass-through) | top | ≤1 |
| decision · secondary | the near **side** | top | ≤2 |

Semantics ride alongside: `no` / async / return / uncertain edges are **dashed**
(Tenets 8–9), ER relations are **undirected** (crow's-foot, no arrowhead).

## What `lintEdges` enforces

| Rule | Catches |
|---|---|
| `route.crossesNode` (error) | a connector passing through a node it doesn't touch |
| `route.cornersOverBudget` | more bends than the fan allows — a noisier path than needed |
| `route.manyCrossings` | edge-to-edge crossings beyond a small budget — reorder siblings or split the view |

Geometry is axis-aligned (ELK orthogonal), so the tests are **exact**, not
heuristic. The linter returns the same `{score, grade, pass, violations}` shape
as `chartLint` / `diagramLint`.

## The manifesto, on edges

| Tenet | On an edge |
|---|---|
| 3 Position first | the port side encodes the edge's role in the fan; routing follows structure, not whim |
| 6 One accent / consistent | every edge styled from the one edge colour; the label plate borrows it |
| 7 Declutter to the data | minimum corners (budgeted), no connector over a node, crossings minimised |
| 8 Tell the truth | dashed = "no"/uncertain; arrowheads only where direction is real |
| 9 Fact is not inference | inferred / async connections render dashed + faint |

## Verify

The probe runs the real ELK engine over the canonical idioms and asserts the
routes — no browser:

```
npm run probe:diagram     # uniform sizing + straight spine + edges clear of nodes, per idiom
```

---

### Sources
- **Visualisation Manifesto** (`MANIFESTO.md`) — position first, declutter, tell the truth.
- **ELK** layered orthogonal routing + `FIXED_SIDE` ports (the engine that both routes and is verified).
- Flowchart / box-and-arrow convention: decision pass-through, dashed negative branch, crow's-foot for ER.
