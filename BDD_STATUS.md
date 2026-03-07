# BDD Status

Checked 26 scenario(s) across 14 test file(s).


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

## Feature: LLM chat assistant

- [ ] UNCOVERED: user opens the chat panel
- [ ] UNCOVERED: user configures an LLM provider with an API key
- [ ] UNCOVERED: user can set a custom OpenAI-compatible base URL
- [ ] UNCOVERED: user sends a message and receives a streaming response
- [ ] UNCOVERED: LLM receives the current BDD document as context
- [ ] UNCOVERED: LLM response proposes a BDD change and the canvas updates
- [ ] UNCOVERED: invalid API key shows an error in the chat panel
- [ ] UNCOVERED: chat history is maintained for the session

## Feature: WebRTC collaboration

- [ ] UNCOVERED: host creates a collaboration session and receives a share code
- [ ] UNCOVERED: guest joins a session using a share code
- [ ] UNCOVERED: canvas changes sync to all connected peers in real time
- [ ] UNCOVERED: session is limited to four simultaneous users
- [ ] UNCOVERED: user presence indicators show who is in the session
- [ ] UNCOVERED: peer disconnects gracefully and session continues
- [ ] UNCOVERED: LLM chat is shared across all session peers
- [ ] UNCOVERED: TURN relay is used when direct peer connection fails

---
**10/26 scenarios covered.**

16 scenario(s) need tests:
- user opens the chat panel
- user configures an LLM provider with an API key
- user can set a custom OpenAI-compatible base URL
- user sends a message and receives a streaming response
- LLM receives the current BDD document as context
- LLM response proposes a BDD change and the canvas updates
- invalid API key shows an error in the chat panel
- chat history is maintained for the session
- host creates a collaboration session and receives a share code
- guest joins a session using a share code
