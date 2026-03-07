---
language: typescript
framework: vite, react, dnd-kit, tailwind
build_cmd: build
test_cmd: test
lint_cmd: lint
fmt_cmd: fmt
birth_date: 2026-03-06
---

System: bddprompt — a visual, drag-and-drop web app for creating and editing BDD specification files. Users build a BDD document on a canvas by dragging Feature and Scenario cards, then the tool generates and live-syncs a BDD.md file.

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
