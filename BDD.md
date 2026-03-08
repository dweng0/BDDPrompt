---
language: typescript
framework: vite, react, dnd-kit, tailwind
build_cmd: npm run build
test_cmd: npm run test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-06
---

System: bddprompt — a visual, drag-and-drop web app for creating and editing BDD specification files. Users build a BDD document on a canvas by dragging Feature and Scenario cards, then the tool generates and live-syncs a BDD.md file.

    Feature: Project info in header

        Scenario: frontmatter is displayed in the header when a file is loaded
            Given a BDD.md file has been opened with frontmatter
            When the user views the header
            Then the language and framework are shown in the header

        Scenario: system description is displayed in the header when a file is loaded
            Given a BDD.md file has been opened with a system description
            When the user views the header
            Then the system description is shown in the header

        Scenario: user can edit the system description from the header
            Given a BDD.md file is loaded and the system description is shown
            When the user edits the system description in the header
            Then the BDD.md is updated with the new system description

        Scenario: user can edit frontmatter fields from the header
            Given a BDD.md file is loaded and frontmatter is shown in the header
            When the user edits a frontmatter field
            Then the BDD.md is updated with the new value

    Feature: Visual BDD Canvas

        Scenario: canvas displays feature and scenario cards from state
            Given the web app has loaded with BDD document state
            When the canvas renders with features and scenarios
            Then each feature is displayed as a card on the canvas

        Scenario: sidebar shows draggable node types
            Given the web app has loaded
            When the user views the sidebar
            Then they can see a draggable Feature node type

        Scenario: user drags a feature onto the canvas
            Given the web app has loaded
            When the user drags a Feature node from the sidebar onto the canvas
            Then a new empty Feature card appears on the canvas

        Scenario: user drags a scenario into a feature card
            Given a Feature card exists on the canvas
            When the user drags a Scenario node from the sidebar into the Feature card
            Then a new Scenario card appears inside the Feature card

        Scenario: user edits a card via the properties panel
            Given a Feature or Scenario card exists on the canvas
            When the user clicks on the card
            Then the properties panel shows editable fields for that card

    Feature: BDD.md live sync

        Scenario: user opens a BDD.md file and it populates the canvas
            Given the web app has loaded
            When the user opens a BDD.md file
            Then the canvas populates with the features and scenarios from that file

        Scenario: canvas writes BDD.md when changes are made
            Given a BDD.md file has been opened
            When the user makes a change on the canvas
            Then the BDD.md file is updated with the new content

        Scenario: external changes to BDD.md are reflected on the canvas
            Given a BDD.md file has been opened in the canvas editor
            When the BDD.md file is modified externally
            Then the canvas updates to reflect the new content

    Feature: Deleting nodes

        Scenario: user deletes a feature from the canvas
            Given a Feature card exists on the canvas
            When the user clicks the delete button on the Feature card
            Then the Feature card is removed from the canvas

        Scenario: user deletes a scenario from a feature
            Given a Scenario card exists inside a Feature card
            When the user clicks the delete button on the Scenario card
            Then the Scenario card is removed from the Feature card

    Feature: Background on feature cards

        Scenario: background is displayed inside its feature card
            Given a Feature card has a background defined
            When the canvas renders
            Then the background is shown inside the Feature card above the scenarios

        Scenario: user adds a background to a feature card
            Given a Feature card exists on the canvas with no background
            When the user drags a Background node from the sidebar into the Feature card
            Then a Background card appears inside the Feature card

        Scenario: user edits a background via the properties panel
            Given a Feature card has a background
            When the user clicks the background card
            Then the properties panel shows an editable Given field for the background

        Scenario: user deletes a background from a feature card
            Given a Feature card has a background
            When the user clicks the delete button on the background card
            Then the background is removed from the Feature card

    Feature: LLM chat assistant

        Scenario: user opens the chat panel
            Given the web app has loaded
            When the user clicks the chat button
            Then a chat panel slides open alongside the canvas

        Scenario: user configures an LLM provider with an API key
            Given the chat panel is open
            When the user selects a provider (Claude or OpenAI-compatible) and enters an API key
            Then the chat input becomes active and ready to send messages

        Scenario: user can set a custom OpenAI-compatible base URL
            Given the chat panel is open and OpenAI-compatible is selected
            When the user enters a custom base URL
            Then messages are sent to that endpoint instead of the default

        Scenario: user sends a message and receives a streaming response
            Given the chat panel is configured with a valid API key
            When the user types a message and sends it
            Then the LLM response streams into the chat in real time

        Scenario: LLM receives the current BDD document as context
            Given a BDD.md file is loaded on the canvas
            When the user sends any message
            Then the current BDD document content is included in the system prompt

        Scenario: LLM response proposes a BDD change and the canvas updates
            Given the chat panel is active with a loaded BDD document
            When the LLM response contains a valid updated BDD document
            Then the canvas updates to reflect the proposed changes

        Scenario: invalid API key shows an error in the chat panel
            Given the chat panel is open
            When the user sends a message with an invalid API key
            Then an error message is shown in the chat panel

        Scenario: chat history is maintained for the session
            Given the user has exchanged messages with the LLM
            When the user sends another message
            Then the full conversation history is included in the next request

    Feature: WebRTC collaboration

        Scenario: host creates a collaboration session and receives a share code
            Given a user has a BDD document loaded on the canvas
            When the user clicks Share and starts a session
            Then a short alphanumeric share code is displayed

        Scenario: guest joins a session using a share code
            Given a host session is active with a share code
            When a guest enters the share code and joins
            Then a WebRTC peer connection is established between host and guest

        Scenario: canvas changes sync to all connected peers in real time
            Given two or more users are in the same session
            When any user makes a change to the canvas
            Then the change is broadcast to all other peers within 200ms

        Scenario: session is limited to four simultaneous users
            Given a session already has four connected users
            When a fifth user attempts to join
            Then they are shown a message that the session is full

        Scenario: user presence indicators show who is in the session
            Given multiple users are in a session
            When the user views the toolbar
            Then they can see an avatar or indicator for each connected user

        Scenario: peer disconnects gracefully and session continues
            Given three users are in a session
            When one user closes their browser or loses connection
            Then the remaining users are notified of the disconnection

        Scenario: LLM chat is shared across all session peers
            Given a session has multiple users and one has configured an LLM key
            When any user sends a chat message
            Then the message and the LLM response are visible to all peers

        Scenario: TURN relay is used when direct peer connection fails
            Given two peers cannot establish a direct connection due to NAT
            When the ICE negotiation falls back to the TURN server
            Then the session connects via the relay
