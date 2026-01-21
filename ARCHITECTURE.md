# Collaborative Drawing Board

This file explains the internal architecture, data flow, and design decisions
behind the collaborative drawing board.

## 1️: Data Flow Diagram (Conceptual)

## Drawing Flow

User mouse event -> canvas.js does local stroke rendering -> websocket (operation event) ->
 Server (srawing-state.js) (stroes operations) -> Broadcast updated state -> Render on all clients

## 2️: WebSocket Protocol

## Client → Server Events
 
| Event         | Data                                 | Purpose                    |
|---------------|--------------------------------------|----------------------------|
| `operation`   |`{ id, tool, color, width, points[] }`| Finalized stroke           |
| `cursor`      | `{ x, y }`                           | Live cursor position       |
| `undo`        | none                                 | Undo last global operation |
| `redo`        | none                                 | Redo last undone operation |


## Server → Client Events

| Event           | Data                  | Purpose                        |
|-----------------|-----------------------|--------------------------------|
| `updated`       | `operations[]`        | New canvas state after change  |
| `user-joined`   | `{ id, name, color }` | New user joined                |
| `users`         | `{ [id]: user }`      | Sync existing users            |
| `user left`     | `socketId`            | Cleanup user                   |

## 3️: Undo / Redo Strategy (Global)

## Why Global Undo?
- Simpler for a shared canvas
- Ensures all users always see the same canvas state
- Avoids complex per-user dependency tracking

## Implementation

Server maintains two stacks:

drawing-state.js:
operations[]     // Active drawing history
redoOperations[] // Undone operations

## 4: Performance Decisions

Optimizations Used

->Two canvas layers : 
   Main canvas → drawings
   Cursor canvas → cursors 

->Stroke batching : Only finalized strokes are stored and  live strokes are local only

->Full re-render only on undo/redo : Normal drawing uses incremental rendering

->requestAnimationFrame : Smooth cursor updates without blocking UI

## 5:Conflict Resolution

Simultaneous Drawing

- All users draw independently
- Operations are added sequentially on server
- Order determined by arrival time

Undo Conflicts

- Undo affects the last global operation
- No ambiguity or partial rollbacks

Cursor Conflicts

- Each cursor has a unique socket ID
- No shared state conflicts