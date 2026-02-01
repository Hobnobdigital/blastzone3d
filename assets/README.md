# Assets Directory

This directory contains all game assets organized by type.

## Structure

```
/assets/
  /generated/         # AI-generated assets with metadata tracking
    metadata.json     # Tracks prompts, settings, versions for all generated assets
  /icons/            # UI icons, power-up icons
  /textures/         # 3D textures, materials
  /models/           # 3D models (tiles, characters, props)
  /audio/            # Sound effects and music
    /sfx/            # Sound effects
    /music/          # Background music
```

## Asset Pipeline (Per Spec Section 8)

All generated assets **must** include metadata in `generated/metadata.json`:

- Prompt text (full)
- Negative prompt (if used)
- Seed/settings
- Tool/model used
- Version ID & timestamp
- License/attribution
- File path

## Asset Quality Standards

### Icons
- Consistent style (defined by Product Designer's Style Bible)
- Clear at multiple sizes (16px, 32px, 64px)
- High contrast for readability

### Textures
- Optimized file size (use compression)
- Power-of-2 dimensions when possible (512x512, 1024x1024)
- Consistent color palette

### Models
- Low poly count (target <5000 triangles for most props)
- Clean topology
- Proper UV mapping
- Optimized for WebGL

### Audio
- SFX: Short, punchy, distinct
- Music: Loopable, multiple intensity layers
- Format: WebM Opus (primary), MP3 (fallback)
- Normalized volume levels

## Naming Conventions

```
icons/power-up-{type}-{variant}.png
textures/{surface}-{material}-{resolution}.jpg
models/{object}-{lod}.glb
audio/sfx/{action}-{variant}.webm
audio/music/{track}-{intensity}.webm
```

## License & Attribution

All assets must be:
- Original (AI-generated or custom-created), OR
- Licensed appropriately (CC0, CC-BY, purchased)
- Properly attributed in metadata

**No copyrighted Bomberman assets allowed.**

## Adding New Assets

1. Create/generate the asset
2. Place in appropriate subdirectory
3. Update `generated/metadata.json` if AI-generated
4. Test in-game for quality and performance
5. Commit with descriptive message

---

**Note:** Asset pipeline will be fully defined once Product Designer delivers the Style Bible (spec Section 7).
