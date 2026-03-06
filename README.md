# bdd-wizard

<div align="center">
<img src="cute_sheep.svg" width="180" alt="BAADD sheep mascot"/>
</div>

A React Ink CLI tool for generating BDD specification files in the [BAADD](https://github.com/dweng0/BAADD) format.

---

## What it does

`bdd-wizard` walks you through an interactive terminal UI to build a `BDD.md` file — the spec file consumed by the BAADD self-coding framework. It guides you through:

- Frontmatter (language, framework, build/test/lint/format commands)
- System description
- Features, scenarios, and backgrounds
- Saving the finished spec to your project

---

## Requirements

- Node.js 18+

---

## Install

```bash
npm install
npm run build
```

## Run

```bash
node dist/cli.js
```

Or during development:

```bash
npm run dev
```

---

## What gets generated

A `BDD.md` file with YAML frontmatter and Gherkin-style scenarios:

```markdown
---
language: typescript
framework: react-ink
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-05
---

System: A CLI tool that does X

    Feature: User login
        As a user
        I want to log in
        So that I can access my account

        Scenario: Successful login
            Given I am on the login page
            When I enter valid credentials
            Then I am redirected to the dashboard
```

Copy this file into a fork of the BAADD repo and watch your desires come to life file is then used by the BAADD agent to drive automated code generation.

---

## Development

```bash
npm run dev        # run with tsx (no build step)
npm test           # run tests with vitest
npm run lint       # eslint
npm run format     # prettier
```

---

## Origin

Forked from [dweng0/BAADD](https://github.com/dweng0/BAADD) — a framework where an AI agent builds and maintains a project driven entirely by a `BDD.md` spec file.
