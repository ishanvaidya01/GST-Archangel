## Summary

<!-- What changed and why? Link the issue if one exists. -->

Fixes #

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / performance
- [ ] Documentation
- [ ] Tests / CI
- [ ] Database migration
- [ ] Breaking change

## Verification

<!-- List the commands you ran and the relevant result. -->

```bash
cd backend && pytest app/tests -v
cd "frontend main" && npm run lint
```

## Checklist

- [ ] The change is scoped and does not include unrelated files.
- [ ] Tests pass locally, or the reason they could not be run is explained.
- [ ] Database changes include an Alembic migration.
- [ ] Frontend lint passes, or the failure is unrelated and explained.
- [ ] Documentation is updated for changed setup, commands, or APIs.
- [ ] No `.env` files, secrets, datasets, model weights, or customer data are included.
- [ ] New dependencies are justified in the PR description.

## Notes for reviewers

<!-- Known limitations, follow-up work, screenshots, or migration steps. -->
