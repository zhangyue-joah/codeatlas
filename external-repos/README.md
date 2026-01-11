## External Repositories (Vendored)

This folder contains third-party repositories fetched into this workspace for reference and content development.

### Included

- `external-repos/vibe-coding-cn/`
  - Source: https://github.com/tukuaiai/vibe-coding-cn
  - License: MIT (see `external-repos/vibe-coding-cn/LICENSE`)

- `external-repos/anthropics-skills-apache/`
  - Source: https://github.com/anthropics/skills
  - Included scope: only skill folders that contain an Apache 2.0 `LICENSE.txt` under `skills/*`
  - Excluded: `skills/docx`, `skills/pdf`, `skills/pptx`, `skills/xlsx` (these folders use a restrictive “All rights reserved” license)
  - Licenses: per-skill `LICENSE.txt` files in `external-repos/anthropics-skills-apache/skills/*/LICENSE.txt`

### Notes

- Do not assume “repo-level” licensing; check the license file(s) that apply to the specific content you want to use.
- If you publish derived content, add an appropriate attribution/credits entry and keep required license texts.
