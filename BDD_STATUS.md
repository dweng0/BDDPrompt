# BDD Status

Checked 34 scenario(s) across 24 test file(s).


## Feature: Project info in header

- [x] frontmatter is displayed in the header when a file is loaded
- [x] system description is displayed in the header when a file is loaded
- [x] user can edit the system description from the header
- [x] user can edit frontmatter fields from the header

## Feature: Visual BDD Canvas

- [x] canvas displays feature and scenario cards from state
- [x] sidebar shows draggable node types
- [x] user drags a feature onto the canvas
- [x] user drags a scenario into a feature card
- [x] user edits a card via the properties panel

## Feature: BDD.md live sync

- [x] user opens a BDD.md file and it populates the canvas
- [x] canvas writes BDD.md when changes are made
- [x] external changes to BDD.md are reflected on the canvas

## Feature: Deleting nodes

- [x] user deletes a feature from the canvas
- [x] user deletes a scenario from a feature

## Feature: Background on feature cards

- [x] background is displayed inside its feature card
- [x] user adds a background to a feature card
- [x] user edits a background via the properties panel
- [x] user deletes a background from a feature card

## Feature: LLM chat assistant

- [x] user opens the chat panel
- [x] user configures an LLM provider with an API key
- [x] user can set a custom OpenAI-compatible base URL
- [x] user sends a message and receives a streaming response
- [x] LLM receives the current BDD document as context
- [x] LLM response proposes a BDD change and the canvas updates
- [x] invalid API key shows an error in the chat panel
- [x] chat history is maintained for the session

## Feature: WebRTC collaboration

- [x] host creates a collaboration session and receives a share code
- [x] guest joins a session using a share code
- [x] canvas changes sync to all connected peers in real time
- [x] session is limited to four simultaneous users
- [x] user presence indicators show who is in the session
- [x] peer disconnects gracefully and session continues
- [x] LLM chat is shared across all session peers
- [x] TURN relay is used when direct peer connection fails

---
**34/34 scenarios covered.**
