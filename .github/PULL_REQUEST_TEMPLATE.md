<!--
Thanks for contributing! Please fill out the sections below.
Keep the title concise and use a conventional-commit style prefix
(feat:, fix:, docs:, chore:, refactor:, style:, test:).
-->

## Description

<!-- What does this PR do and why? -->

## Affected area

- [ ] `packages/shadcn-theme` (Keycloak login theme)
- [ ] `apps/editor` (visual editor)
- [ ] `packages/spartan-theme`
- [ ] Build / tooling / CI
- [ ] Docs

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Documentation
- [ ] Chore / refactor (no functional change)

## Related issues

<!-- e.g. Closes #123, Fixes #456 -->

## How has this been tested?

<!--
Describe what you ran. Examples:
- pnpm theme:storybook (visual check)
- pnpm theme:build-keycloak-theme (.jar builds)
- pnpm -F @keycloakify-editor/app test
-->

## Screenshots / recordings

<!-- For UI changes, include before/after screenshots. -->

## Checklist

- [ ] My code follows the project's style (`pnpm format` run)
- [ ] I regenerated auto-generated files if needed (`keycloakify update-kc-gen`, route tree)
- [ ] I updated docs where relevant
- [ ] Tests pass locally (editor: `pnpm -F @keycloakify-editor/app test`)
- [ ] No breaking changes to the theme `exports` contract that the editor depends on (or the editor was updated in lockstep)
