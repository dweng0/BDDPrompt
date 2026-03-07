# BDD Status

Checked 30 scenario(s) across 15 test file(s).


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
