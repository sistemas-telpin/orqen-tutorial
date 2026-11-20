# AGENTS.md

<!-- orqen:inicio — managed by orqen (edit outside this block; `orqen update` refreshes it) -->

## Customer request workflow

```text
[SUPPORT] → ANALYSIS ⇄ WAITING_CLIENT → DEVELOPMENT ⇄ TESTING
  → [QA_REVIEW, full lane only] → CODE_REVIEW → DELIVERY → ACCEPTANCE → CLOSED
  Requests that need human intervention → BLOCKED
```

A **request** is the client's ticket in the requests system; its **issue** is the team's ticket that orqen creates in the
issues system when the analysis closes (optional). Each system can be any supported tool (Jira, GitHub, or Asana, set in
`connectors` in `orqen/config.yaml`). Commands accept either key.

A **worq** is orqen's unit of work: everything orqen carries for one request (the request, its issue, the branch, the spec, the PR and the
record of every stage). It is identified by the request key and lives in `orqen/worqs/<KEY>/`. `orqen worqs` lists the worqs on this machine and
`orqen worq <KEY>` shows one.

The 9 steps, one command each (the person runs it; you follow it):

| # | Role | Command | What it does |
|---|------|---------|--------------|
| 1 | everyone | `/orqen:list requests` (`orqen list requests`) | Advances what is already decided and lists the work by role. Takes nothing. |
| 2 | support (L1) | `/orqen:support <KEY>` | Answers the client or escalates to the analyst. |
| 3 | analyst (L2) | `/orqen:analyze <KEY>` | Interview, acceptance criteria, lane, spec; creates the issue. |
| 4 | development | `/orqen:list issues` | Issues in development; the ones that came back with changes are marked. |
| 5 | development | `/orqen:implement <KEY>` | Implements after the plan is approved, then the agent runs `TESTING` (full regression) on its own. |
| 6 | development | `/orqen:pr <KEY>` | Explains the changes and opens the PR. |
| 7 | QA (full lane) | `/orqen:review <KEY>` | In `QA_REVIEW`, checks the e2e of the change on screen; `orqen review` approves or sends it back. |
| 8 | senior | `/orqen:list prs` | PRs waiting for review and whether the review is on the last commit. |
| 9 | senior | `/orqen:approve <KEY>` | Approves the PR or requests changes (`orqen approve`); then delivery to the client. |

### Working with the person

In any stage, use `/orqen:ask <KEY> <question>` to ask the requester directly on the original request. The requester can reply with an ordinary comment. To read the replies and refresh `orqen/worqs/<KEY>/conversation.json`, run `orqen conversation <KEY>`. Both commands accept the request key or its linked issue key and preserve the current stage.

orqen works alongside the person; it does not replace them. While someone is on the other side (they invoked
`/orqen:support`, `/orqen:analyze`, `/orqen:implement`, `/orqen:pr`, `/orqen:review`, `/orqen:approve`, a review command, or asked you directly; `human_present: true` in the context):

- **Talk to them in their system language**: `language` in the stage context, or `orqen lang` (`es` = Spanish, `en` = English). Use it for every message, question, and option you show them. Keep commands, state names, and paths as they are. This is only the conversation; artifacts follow the rules below.
- **Say what you are about to do before doing it**, in one or two lines, and **wait for their OK** before each important step:
  choosing the lane, writing or changing the spec, the implementation plan, any change outside the plan, deleting or
  rewriting files, adding dependencies, opening a PR, `orqen complete`, and `orqen block`.
- **When in doubt, ask; never assume.** An ambiguous requirement, two possible approaches, a failing test where you are not
  sure whether the test or the code is wrong, an environment error you do not understand: ask with concrete options and your
  recommendation (use your tool's question picker if it has one, such as `AskUserQuestion` in Claude Code).
- **After each step, report in a few lines what you did and what comes next.**
- When nobody can answer (`human_present: false`, unattended `orqen cycle`): do not guess. If the doubt changes the outcome,
  run `orqen block <KEY> "<specific question>"`; orqen posts it on the ticket and a person answers with `/approve <answer>`.

### Support (optional)

With `workflow.support: true` in `orqen/config.yaml` (or `SUPPORT_STAGE=on`), `orqen list requests` sends a new request to a support person before the analyst. `orqen support` also works with it off, to pass a particular request through support.

1. Start with `/orqen:support <KEY>` or `orqen support <KEY>`. A person from support leads this stage; orqen records them by their Git name (`--person "<name>"` overrides it).
2. Read the request, comments, similar requests, and the documented behavior. Look for the answer before asking the person, and ask them only what you cannot find.
3. Agree the outcome with the person and obtain their explicit approval of the exact reply to the customer:

   | Outcome | When | Next |
   | --- | --- | --- |
   | `resolved` | The answer needs no change in code, data, or configuration | `ACCEPTANCE`: orqen comments the reply and the customer confirms with `/approve` or `/reject <reason>`. No issue is created |
   | `escalate` | A new feature, a defect, a data or configuration change, or anything you cannot answer with confidence | `ANALYSIS`: the analyst starts from `previous_stages.SUPPORT` instead of from zero |

4. Run `orqen complete <KEY> <output.json>`. Never promise dates, scope, or changes to the customer. When unsure, escalate.

The analyst can still take a `NEW` request directly with `orqen analyze`, and can take over one in `SUPPORT` that nobody is working on.

### Analysis

1. Start with `/orqen:analyze <KEY>` or `orqen analyze <KEY>`. A human analyst leads the analysis; orqen records them by their Git name (`--analyst "<name>"` overrides it).
2. Read the request, comments, and repository, then interview the analyst using the `orqen:grilling` skill. Read the ticket read-only (an MCP for the ticket tool, or `orqen search`). Record questions only the customer can answer and wait for their response.
3. Summarize the scope, acceptance criteria, and risks. Obtain the analyst's explicit approval and ask them to confirm the lane.

   | Lane | When | Output |
   | --- | --- | --- |
   | `direct` | One component, roughly four hours or less, low risk, no contract change | Plan and acceptance criteria |
   | `light` | One or two capabilities, roughly two days or less | OpenSpec proposal, spec deltas, a short design, and tasks |
   | `full` | Broader changes involving architecture, data, integrations, security, or billing | Full OpenSpec proposal, specs, design, and tasks |

   With `light` or `full`, `orqen lane <KEY> <lane>` prepares a branch and change. Write the spec with the analyst under `openspec/changes/`.
4. Run `orqen complete <KEY> <output.json>`. Once validation passes, orqen creates the issue (when `connectors.issues` is configured), links it to the request, and writes the record under `orqen/worqs/<KEY>/`. The request is the conversation with the customer; the issue tracks implementation (`connectors.issues.transitions`). Rejected customer acceptance starts a new analysis round and a new issue.

### Operational work

For a data correction, restart, configuration change, or other work without code changes, set `route: operational` and `lane: direct`. The workflow is:

```text
ANALYSIS → EXECUTION → EXECUTION_APPROVAL → APPLICATION → VERIFICATION → ACCEPTANCE → CLOSED
```

Propose the steps, rollback, and read-only verification. A person authorized by `workflow.approvers.execution` (`APPROVERS_EXECUTION`) approves and applies the change. Never execute SQL that modifies data or change services yourself. If verification identifies a code defect, the request returns to analysis. Operational work still creates an issue (when configured); it skips the spec, branch, tests, and PR.

### Work on a stage

- `orqen list requests` lists the work by role with the next command (`orqen list issues` for development, `orqen list prs` for the senior).
- `orqen take <KEY>` claims an agent stage and prints its instructions, request context, feedback, and JSON output schema. Use `orqen support` for support and `orqen analyze` for analysis.
- Run `orqen complete <KEY> <output.json>` when the output is ready. Correct validation errors and retry until the command reports success. Stop after completing the stage.
- If you cannot proceed, run `orqen block <KEY> "<specific reason>"`. Human reviewers use `/approve` or `/reject <reason>` on the ticket.
- orqen writes `state.json`, `log.md`, and `round-N/analysis.md` and `.json` under `orqen/worqs/<KEY>/`. Operational rounds also record execution details under `execution/`. The authoritative workflow state is stored under `orqen/state/` or `cli/.state/`, depending on how the project is configured.

### Implementation execution

`/orqen:implement <KEY>` runs `orqen swarm --file <task> --yes --json --apply` internally after the person approves the implementation plan. Supply the approved analysis, scope, criteria, spec or direct plan, and feedback as task context. orqen integrates a verified result into the request branch. Do not ask the person to run the engine or show its worker logs; report scope, progress, decisions and results. A failed run or integration must not advance the stage. Keep the existing approval before `orqen complete`.

### Integration PR, QA, and code review

- `TESTING` opens no PR. The only PR is the integration PR to `DEVEL_BRANCH`, opened with `/orqen:pr` (`orqen pr <KEY> <explanation.md>`) from the request branch. orqen commits pending changes, pushes, and opens or updates it.
- Only the **full lane** goes through `QA_REVIEW` after `TESTING`; the direct and light lanes go straight to `CODE_REVIEW`. QA runs `/orqen:review <KEY>`: it checks on screen the e2e of the change (`TESTING` already ran the whole regression) and records the decision with `orqen review <KEY> approve|reject [--reason "<what to fix>"] [--report <report.md>]`. Approval moves to `CODE_REVIEW`; rejection returns to `DEVELOPMENT` with the reason as feedback. QA can also comment `/approve` or `/reject <reason>` on the ticket (limited to `workflow.approvers.qa` in `orqen/config.yaml`).
- The senior decides with `/orqen:approve <KEY>`. Optionally first a report (step 3 of `/orqen:approve`): review the PR diff read-only against the analysis, spec or plan, and acceptance criteria, and give a verdict plus each finding with its severity, `file:line`, impact, and possible solutions; record it with `orqen code-review <KEY> <report.md> --verdict <approve|minor|reject>` (it does not change the stage). The decision is recorded with `orqen approve <KEY>` or `orqen approve <KEY> --changes <comment.md>`: with the default `CODE_REVIEW_GATE=github` orqen posts it as a review on the PR with the senior's `gh` session (limited to `GITHUB_REVIEWERS` when set), moves to `DELIVERY` on approval, and returns to `DEVELOPMENT` on "changes requested" (the text becomes feedback for the agent). Reviews made directly on GitHub count too. Only reviews on the PR's current head count, so a later push needs a new review. With `CODE_REVIEW_GATE=ticket`, the decision is recorded on the tickets (or the senior comments `/approve` or `/reject <reason>` there).
- `orqen approve` refuses a PR whose CI is failing or still running, or that conflicts with the development branch (`orqen list prs` shows both): request changes instead (conflicts go back to development to update the branch), or pass `--force` only when the senior explicitly says why it can be approved anyway. When `gh` cannot read the checks they show as `unknown` and do not block.
- orqen never merges the PR. Once approved, a person merges it by hand into the development branch; orqen detects the merge (`orqen list prs` shows the ones still waiting) and comments it on the tickets. When orqen cannot read the PR, the person who merged it confirms it with `orqen merged <KEY>`.
- In `DELIVERY`, `/orqen:approve` continues with the delivery: `orqen take` archives the spec and pushes it to the PR, waits until the PR is merged, and the agent writes the client how to validate; the client confirms with `/approve`. Never merge the PR yourself.

### Cancelling a request

- When a request must be closed without delivering it (the client withdrew it, a duplicate, it no longer applies), a person runs `orqen cancel <KEY> --reason "<why>"`. It works from any state: it closes the open PR without merging it (the branch stays), comments both tickets, and moves to `CANCELLED`, which is final. If the PR was already merged, the code stays in the development branch; reverting it is a person's call. Never cancel on your own: only when the person asks for it, with their reason.

### Rules

- Read the tickets read-only. orqen handles ticket writes, Git commits, branch changes, pushes, and OpenSpec archiving. Do not run `git commit/push/checkout/reset/rebase` or `openspec archive`.
- Do not edit `orqen/state/`, `orqen/worqs/`, or orqen configuration as part of a request.
- Obtain explicit analyst approval before closing analysis, including approval of the selected lane.
- Record unanswered questions and label assumptions. Read `openspec/specs/` for current behavior before proposing changes.
- Write in clear, professional English (this is for artifacts; talk to the person in their system language). Follow OpenSpec's structural headings and use SHALL/MUST where required.
- Use network access only as required by the stage, such as installing project dependencies for tests.

### Environments and tests

`orqen/environment.yaml` defines how each part of the project starts under `processes` (its command, such as
`npm run dev` or `npm start`, its directory, and its port). There is no Docker in between unless the team configured a
process that uses it. **orqen manages them on its own; never ask a person to open a terminal or start anything:**

- During `DEVELOPMENT`, `orqen take` installs dependencies, starts the `when: always` processes (backend, workers…),
  waits until they respond, and runs migrations and seed commands. Read `environment` in the agent context for status,
  variables, and test commands.
- `orqen complete` stops them when development ends.
- Test scope: during `DEVELOPMENT`, write and run unit tests and the e2e of the Scenarios or criteria the change touches (`orqen env test e2e -- <files or filter>`). `TESTING` runs every test type, including the full e2e regression. In the full lane, QA then reviews the e2e of the change.
- `TESTING` is run by the agent right after development (`/orqen:implement` continues into it), not by a person. orqen starts every process (including `when: e2e` ones such as the frontend), runs the full test suite,
  and stops them.

```sh
orqen env test [unit|integration|e2e|visual]
orqen env test e2e -- <files or filter>  # Only the e2e of this change
orqen env status   # what is running and where each process log is
orqen env up --all # only when development also needs the frontend (e2e / visual)
```

If a process does not start, `environment.output` has the end of its log (also in `orqen/state/logs/<process>.log`).
Fix it if it is a code problem; if it is the environment (a missing database, a busy port), **ask the person** how to proceed.

Stack detected during initialization:

_No stack detected. Fill in `orqen/environment.yaml`._

<!-- orqen:fin -->
