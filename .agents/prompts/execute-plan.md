---
description: Generate a frontend execution prompt for a writing-plans implementation plan
---

Generate a complete, ready-to-send prompt for executing a frontend implementation plan
created by the `writing-plans` skill.

## LANGUAGE RULES (MANDATORY)

- The entire response MUST be in Brazilian Portuguese (pt-BR).
- Use correct grammar and proper accentuation.
- Do NOT mix languages.
- Do NOT use English except for code, commands, file names, branch names, commit messages, package names, library names, technical APIs, or skill names.

## INPUT HANDLING

- If the user provides a plan file path, use that path.
- If the user does not provide a plan file path, ask for the plan path before generating the execution prompt.
- Do not execute the plan.
- Your job is to generate the prompt that another agent should receive to execute the frontend implementation plan.

## THE GENERATED PROMPT MUST INSTRUCT THE EXECUTOR TO

- Use the `subagent-driven-development` skill to execute the plan task by task.
- Use the `requesting-code-review` skill as the code quality gate after each task.
- Read the plan once, extract all tasks with their full text, and keep a checklist updated.
- Never ask implementation or review subagents to read the plan directly.
- The executor must paste the complete task text into each subagent prompt.
- Execute only one implementation task at a time, in order.
- Never dispatch multiple implementer subagents in parallel.
- Check the current branch and `git status --short --branch` before starting.
- Stop and report before starting if there are unrelated dirty changes that could be mixed with the implementation.

## FRONTEND EXECUTION PRINCIPLES

The generated prompt must instruct the executor to:

- Follow the existing frontend architecture and folder structure.
- Prefer reusing existing components before creating new ones.
- Prefer composition over large monolithic components.
- Keep components small, readable, typed, and easy to maintain.
- Preserve the existing design system and visual language.
- Follow the existing conventions for routes, pages, layouts, components, hooks, services, schemas, utilities, styles, tests, and mocks.
- Respect the current theme system, including light and dark mode.
- Avoid hardcoded colors unless the project already uses them intentionally.
- Prefer semantic theme tokens and existing Tailwind/design-system classes such as:
  - `background`;
  - `foreground`;
  - `muted`;
  - `muted-foreground`;
  - `primary`;
  - `secondary`;
  - `accent`;
  - `border`;
  - `card`;
  - `popover`;
  - equivalent project tokens.
- Preserve responsiveness and use a mobile-first approach when applicable.
- Ensure UI states are handled when relevant:
  - loading;
  - empty;
  - error;
  - disabled;
  - active;
  - hover;
  - focus;
  - selected;
  - success;
  - destructive.
- Maintain accessibility basics:
  - semantic HTML;
  - meaningful labels;
  - keyboard navigation when applicable;
  - visible focus states;
  - correct `aria-*` usage only when needed.
- Avoid unnecessary dependencies.
- If a new dependency seems useful, suggest it and explain why, but do not install it unless the plan explicitly requires it or the user has already approved it.
- Do not introduce backend/API integrations unless the plan explicitly requires it.
- If the plan requests mock data, use mock data only and do not create real integrations.
- Do not change unrelated UI, behavior, routes, configurations, or files.

## PER-TASK EXECUTION RULES

For every task, the generated prompt must instruct the executor to:

1. Record the task base commit before changing files:

   ```bash
   BASE_SHA=$(git rev-parse HEAD)
```

2. Dispatch an implementer subagent with:

   * the full task text;
   * relevant frontend context;
   * relevant architectural, design-system, routing, state-management, and testing context;
   * explicit instruction to follow TDD when the plan requires it;
   * explicit instruction to implement only the current task;
   * explicit instruction to avoid unrelated refactors;
   * explicit instruction to reuse existing components, hooks, schemas, utilities, and styles where possible;
   * explicit instruction to preserve light/dark theme support;
   * explicit instruction to preserve responsiveness;
   * explicit instruction to use mock data only when the task or plan says not to integrate;
   * explicit instruction to run the task-specific checks;
   * explicit instruction to self-review;
   * explicit instruction to report what was implemented in enough detail for review;
   * explicit instruction to report which tests were added or changed, what each relevant test covers, and why that coverage matters;
   * explicit instruction to NOT commit.

3. Run spec compliance review after implementation.

4. Fix and re-review until spec compliance is approved.

5. Only after spec compliance passes, run code quality review using the `requesting-code-review/code-reviewer.md` template.

6. Fix Critical and Important issues before proceeding.

7. Re-review after fixes until the quality gate is approved.

8. Run all task-specific validation requested by the plan, including focused tests, lint, typecheck, build, visual checks, or component tests when relevant.

9. After the task-specific validation passes, run:

   ```bash
   npm run check:all
   ```

10. If `npm run check:all` fails:

    * do not commit;
    * do not automatically fix unrelated failures;
    * report the failing command/output summary;
    * identify whether the failure appears related to the current task or a broader regression;
    * wait for the user's decision before proceeding.

11. If `npm run check:all` modifies files, include those modifications in the pre-commit summary and make clear that they came from the validation command.

## FRONTEND IMPLEMENTATION AND TEST COVERAGE REPORTING

The generated prompt must require the executor to produce a task report that is detailed enough for human review, without becoming a full implementation diary.

For each task, the executor must explain:

* what was implemented, grouped by relevant frontend layers when applicable:

  * route;
  * page;
  * layout;
  * component;
  * hook;
  * form;
  * schema;
  * service;
  * mock;
  * utility;
  * style/theme;
  * test.
* why the implementation was needed for the plan goal;
* which user-visible behavior was added, changed, or preserved;
* which UI states were implemented or affected;
* how responsiveness was handled;
* how light/dark theme compatibility was preserved;
* how accessibility was considered;
* which tests were added or changed;
* what each relevant test covers;
* why each relevant test exists, especially for:

  * rendering behavior;
  * user interactions;
  * form validation;
  * conditional states;
  * loading/empty/error states;
  * routing behavior;
  * regressions;
  * component contracts.
* which planned requirements are not directly covered by tests, if any, and why;
* any coverage limitation or remaining risk.

The executor must not invent coverage data.

If no coverage report was generated, it must describe behavioral coverage from the tests that actually ran, not claim line, branch, or percentage coverage.

## SPEC COMPLIANCE REVIEW REQUIREMENTS

The generated prompt must instruct the executor to verify that the current task:

* satisfies the task text from the plan;
* does not implement future tasks early;
* does not skip required UI states;
* does not ignore responsiveness requirements;
* does not break light/dark mode;
* does not introduce hardcoded styling that conflicts with the design system;
* does not create unnecessary abstractions;
* does not introduce real integrations when the task requires mock data only;
* does not alter unrelated behavior;
* keeps the implementation aligned with the existing project conventions.

## HUMAN CHECKPOINT BEFORE EACH COMMIT

The generated prompt must require the executor to stop before every task commit.

At the checkpoint, the executor must present:

* task name and status;
* detailed implementation summary;
* frontend layers affected;
* files changed;
* concise diff summary;
* UI behavior implemented or changed;
* responsive behavior summary;
* light/dark theme considerations;
* accessibility considerations;
* tests/checks executed and real results;
* test coverage summary with motivation for the relevant tests;
* `npm run check:all` result;
* spec review result;
* quality review result;
* unresolved concerns, if any;
* suggested commit message.

The executor must wait for explicit user approval before committing.

## SUPPORTED USER RESPONSES AT CHECKPOINT

The generated prompt must define these commands:

* `aprovar`: create the suggested commit and continue to the next task.
* `aprovar com mensagem: <mensagem>`: commit with the provided message and continue to the next task.
* `corrigir: <instrução>`: apply the requested correction, rerun the relevant checks/reviews, and stop again before committing.
* `parar`: do not commit and do not continue.

## AFTER USER APPROVAL

The generated prompt must instruct the executor to:

1. Commit only the approved task changes.

2. Record:

   ```bash
   HEAD_SHA=$(git rev-parse HEAD)
   ```

3. Update the checklist with:

   * task status;
   * commit SHA;
   * validation results;
   * relevant notes or risks.

4. Continue automatically to the next task.

## FINAL VERIFICATION

After all plan tasks are completed, the generated prompt must instruct the executor to:

* run the final verification task from the plan, if one exists;

* run final code review for the complete implementation range;

* run the final validation commands required by the plan;

* run:

  ```bash
  npm run check:all
  ```

* provide a final summary of what was delivered across the whole plan;

* summarize the frontend areas changed;

* summarize the test coverage added or changed across the whole plan;

* summarize any remaining risks or manual QA recommendations;

* stop before any final commit if final verification produced new changes;

* never invent test results.

## OUTPUT FORMAT

Return only the generated execution prompt in a Markdown code block.

Do not include explanations before or after the code block.
