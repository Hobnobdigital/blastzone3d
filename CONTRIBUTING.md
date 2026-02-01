# Contributing to BlastZone3D

Thank you for your interest in contributing! This project targets **10/10 quality** standards.

## Getting Started

1. **Read the spec:** Review `3d-bomberman-spec.txt` (in parent directory) to understand requirements
2. **Set up environment:** Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md)
3. **Check issues:** Look for `good-first-issue` or `help-wanted` labels
4. **Ask questions:** Use GitHub Discussions for clarification

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, typed TypeScript
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm test

# Test build
npm run build && npm run preview
```

### 4. Commit

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add power-up spawn logic"
git commit -m "fix: explosion propagation through soft blocks"
git commit -m "docs: update gameplay mechanics section"
```

**Commit Prefixes:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style/formatting
- `refactor:` Code restructuring
- `test:` Adding/updating tests
- `perf:` Performance improvement
- `chore:` Build/tooling changes

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub and fill out the template.

## Code Standards

### TypeScript

- ✓ Use strict types (avoid `any`)
- ✓ Prefer `const` over `let`
- ✓ Use meaningful variable names
- ✓ Document public APIs with JSDoc

```typescript
/**
 * Calculates explosion propagation from a bomb.
 * @param position - Grid position of the bomb
 * @param range - Blast range in tiles
 * @returns Array of affected tile positions
 */
function calculateExplosion(position: Vector2, range: number): Vector2[] {
  // Implementation...
}
```

### Game Logic

- ✓ **Must be deterministic** (same inputs → same outputs)
- ✓ Grid-aligned movement (no ambiguous positioning)
- ✓ Clear state separation (simulation vs rendering)
- ✓ Unit tests for core mechanics

### Performance

- ✓ Target 60 FPS on mid-range hardware
- ✓ Avoid allocations in game loop
- ✓ Use object pooling for frequently created objects
- ✓ Profile before optimizing

### Accessibility

- ✓ Keyboard support (no mouse-only actions)
- ✓ Colorblind-friendly indicators
- ✓ Volume controls for all audio
- ✓ Motion reduction option

## Pull Request Guidelines

### Before Submitting

- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Code is linted and formatted
- [ ] Functionality tested manually
- [ ] Documentation updated (if needed)
- [ ] PR template filled out completely

### Review Process

1. Automated CI checks must pass
2. At least 1 approval required
3. No unresolved discussions
4. Code meets quality standards

### What Reviewers Look For

- **Correctness:** Does it work as intended?
- **Determinism:** Is gameplay predictable?
- **Readability:** Can players see what's happening?
- **Performance:** Does it maintain 60 FPS?
- **Code quality:** Is it maintainable?
- **Tests:** Are edge cases covered?

## Asset Contributions

If contributing assets:

1. Follow the Style Bible (once defined by Product Designer)
2. Update `assets/generated/metadata.json` for AI-generated assets
3. Ensure legal compliance (no copyrighted materials)
4. Optimize file sizes
5. Test in-game rendering

## Reporting Bugs

Use the bug report template and include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS version
- Console errors (if any)
- Replay log (if deterministic)

## Feature Requests

Before requesting features:

1. Check existing issues/discussions
2. Ensure it aligns with the spec
3. Consider impact on the 10/10 quality bar
4. Be specific about the player benefit

## Questions?

- **Technical:** GitHub Discussions
- **Design:** Wait for Product Designer deliverables
- **Bugs:** GitHub Issues

## Code of Conduct

Be respectful, constructive, and collaborative. We're building something great together! 🚀

---

Thank you for contributing to BlastZone3D! 💣
