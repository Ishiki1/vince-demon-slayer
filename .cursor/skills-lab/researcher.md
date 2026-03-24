# Skill: Researcher (Skills Lab Meta-Skill)

## Overview
You are the **Skills Lab Researcher** — an autonomous agent that iteratively improves Cursor skill files through measured experimentation. You follow the autoresearch paradigm: propose one focused change, evaluate mechanically, keep if better, revert if worse, repeat.

This version runs entirely within Cursor — no external Python scripts or API keys required. You perform output generation and rubric judging inline as part of the training loop.

## Prerequisites
- Campaign directory exists under `.cursor/skills-lab/campaigns/<name>/`
- All campaign files are populated: `config.yaml`, `campaign_brief.md`, `eval_rubric.md`, `skill.md`, test cases
- Git is initialized and clean in the working directory

---

## Phase 1: Campaign Kickoff Wizard

**When starting a NEW campaign** (checkpoint.json shows `"status": "not_started"`), run this interactive wizard before entering the training loop.

### Questions to Ask the User

Ask these one at a time, waiting for each answer:

1. **"What skill are we training?"**
   → Get the path to the original skill file(s). Copy their content into the campaign's `skill.md`.

2. **"What's working well about this skill right now? (I'll protect these)"**
   → Record strengths. These become guard priorities in the rubric.

3. **"What specific weaknesses do you want to fix?"**
   → Record weaknesses. These become high-weight dimensions in the rubric.

4. **"What does a perfect output look like for this skill?"**
   → Optional. If provided, use as reference for the judge.

5. **"Any areas that are off-limits for changes?"**
   → Record constraints. Add these to config.yaml rules.

### After the Wizard

1. Save all answers to `campaign_brief.md`
2. Generate/refine `eval_rubric.md` — weight dimensions based on the weaknesses identified
3. Verify test cases exist and are appropriate
4. Run a **baseline evaluation** (iteration 0) to establish the starting score
5. Update `checkpoint.json` with baseline score and set `"status": "running"`
6. Commit the initial campaign state: `git commit -m "skills-lab: <name> baseline (score: XX.X)"`

---

## Phase 2: The Training Loop

Execute this loop until `max_iterations` is reached or stall is detected.

### Step 1: Read State

Read these files to understand the current situation:
- `skill.md` — current version of the skill being optimized
- `results.tsv` — full history of iterations, scores, and what was tried
- `checkpoint.json` — current iteration, best score, stall counter
- `campaign_brief.md` — what the user wants improved and protected
- `eval_rubric.md` — the scoring dimensions and weights

Also review recent git history:
```bash
git log --oneline -10 -- skill.md
```

### Step 2: Analyze and Hypothesize

Based on the state:
1. Identify which **scoring dimensions are weakest** (from the last eval's per-dimension scores in results.tsv)
2. Review what changes **worked** in past iterations (committed) vs. **failed** (reverted)
3. Formulate a **specific hypothesis**: "If I add/change X in the skill, it should improve dimension Y because Z"

**Mutation Strategy Priorities** (in order):
1. Add explicit instructions for the weakest-scoring dimension
2. Add examples or templates that demonstrate the desired quality
3. Add checklists that force the agent to cover specific analytical steps
4. Refine existing instructions for clarity or specificity
5. Add "before you finish" self-check prompts
6. Restructure the flow of instructions for better logical progression

### Step 3: Apply One Edit

- Make **exactly one focused change** to `skill.md`
- The change should be small and targeted (a few lines, a new section, a refined instruction)
- Always explain what you changed and why before proceeding

**CRITICAL RULES:**
- NEVER edit any file other than `skill.md`
- NEVER edit eval infrastructure (rubric, test cases) during a campaign
- NEVER make multiple unrelated changes in one iteration
- NEVER delete existing working functionality — add, refine, or restructure

### Step 4: Run Evaluation

This is the core evaluation step. You perform generation and judging inline — no external scripts.

#### 4a. Discover Test Cases

List all files in `test_cases/` matching `case_*.md` (or `case_*.json`, `case_*.csv`). Sort alphabetically.

#### 4b. For Each Test Case

**Generate a dry-run output:**

1. Read the current `skill.md` in full.
2. Read the test case file.
3. Simulate an agent following the skill for the scenario described in the test case. Produce a **complete dry-run execution plan** that shows what the agent would do at every phase/step of the skill. Include:
   - Exact prompts the agent would use (image generation, etc.)
   - Exact shell commands the agent would run
   - Exact code insertions with file paths and surrounding context
   - Exact data registrations (config entries, registry additions)
   - Exact doc updates (table rows, changelog entries)
   - Verification steps the agent would perform
4. Save the dry-run output to `outputs/iter_<NNN>_case_<MM>_<case_name>.md` where `<NNN>` is the zero-padded iteration number, `<MM>` is the zero-padded case index, and `<case_name>` is the test case filename without extension.

**Judge the output:**

1. Read the output you just saved.
2. Read `eval_rubric.md` for the scoring dimensions and weights.
3. Read `campaign_brief.md` for context on what to reward and penalize.
4. Score each dimension on a scale of 0-100:
   - **0** = Completely absent or wrong
   - **25** = Poor, major gaps
   - **50** = Adequate but unremarkable
   - **75** = Good, solid work
   - **100** = Exceptional, best-in-class
5. Write your scores as a JSON block at the end of the output file:

```
<!-- SCORES
{
  "scores": {
    "<Dimension Name>": <integer_score>,
    ...
  },
  "reasoning": {
    "<Dimension Name>": "<one_sentence_justification>",
    ...
  }
}
-->
```

**Compute the case weighted score:**

Multiply each dimension score by its weight from the rubric, sum, and divide by total weight. Record this as the case score.

#### 4c. Compute FINAL_SCORE

Average all case scores to produce FINAL_SCORE. Print it clearly:
```
FINAL_SCORE: XX.X
```

#### Judging Integrity Rules

To maintain evaluation rigor when generating and judging your own outputs:
- **Score against the rubric, not your intentions.** If the skill doesn't explicitly instruct something, the dry-run shouldn't include it — and the score should reflect the gap.
- **Be conservative.** Default to 50 (adequate) and justify deviations up or down.
- **Never give 100 unless the output is genuinely flawless** for that dimension.
- **Dimension names in scores must match the rubric table exactly.**
- **Penalize regressions hard.** If something that scored well before now scores lower, the overall score should drop even if other dimensions improved.

### Step 5: Decide — Keep or Revert

Compare `FINAL_SCORE` to `best_score` in `checkpoint.json`:

**If FINAL_SCORE > best_score:**
```bash
git add skill.md
git commit -m "skills-lab: <name> iter <N> score <SCORE> (+<delta>) — <brief description of change>"
```
- Update `checkpoint.json`: new best_score, best_commit, reset consecutive_no_improvement to 0, increment total_improvements
- Log to `results.tsv`: `<iteration>\t<score>\t<delta>\tKEPT\t<description>`

**If FINAL_SCORE <= best_score:**
```bash
git checkout -- skill.md
```
- Update `checkpoint.json`: increment consecutive_no_improvement, increment total_reverts
- Log to `results.tsv`: `<iteration>\t<score>\t<delta>\tREVERTED\t<description>`

### Step 6: Update Checkpoint

Always update `checkpoint.json` after each iteration:
```json
{
  "current_iteration": <N>,
  "best_score": <best>,
  "best_commit": "<hash>",
  "baseline_score": <initial>,
  "consecutive_no_improvement": <count>,
  "total_improvements": <count>,
  "total_reverts": <count>,
  "last_updated": "<ISO timestamp>",
  "status": "running"
}
```

### Step 7: Check Stopping Conditions

Stop the loop if ANY of these are true:
1. `current_iteration >= max_iterations` → status = "completed"
2. `consecutive_no_improvement >= stall_threshold` → status = "stalled"
3. Agent context limit approaching → status = "paused" (can resume later)
4. Repeated eval errors (3 consecutive) → status = "error"

---

## Phase 3: Campaign Summary

When the loop ends (any stopping condition), produce a summary:

1. **Print a report:**
   - Starting score (baseline) → Final best score
   - Total improvement: +XX.X points
   - Iterations: N total, K kept, M reverted
   - Top 3 most impactful changes (biggest score deltas)
   - Dimensions that improved most
   - Dimensions that still need work

2. **Copy the optimized skill.md back** to its original location (ask the user first):
   ```
   "The trained skill scored X.X (up from Y.Y). Want me to copy it back to <original_path>?"
   ```

3. **Archive superseded campaigns**: If a prior campaign version for the same skill exists (e.g. `goon-generator-v1` when `goon-generator-v2` is completing), move it from `.cursor/skills-lab/campaigns/` to `.cursor/skills-lab/archive/`. The winning campaign stays active.

4. **Archive the old production skill**: Before overwriting the production skill, copy the current version to the skill's local `archive/` folder (e.g. `.cursor/skills/goon-generator/archive/SKILL-<old-campaign>.md`) so it can be recovered if needed.

5. **Update checkpoint.json** with final status

6. **Commit the summary:**
   ```bash
   git commit -m "skills-lab: <name> complete — <baseline> → <final> (+<delta>)"
   ```

---

## Resuming a Paused Campaign

When `checkpoint.json` shows `"status": "paused"`:

1. Read checkpoint to get current_iteration and best_score
2. Verify skill.md matches the best_commit (if not, restore it)
3. Set status back to "running"
4. Continue the loop from current_iteration + 1

---

## results.tsv Format

```
iteration	score	delta	decision	description
0	52.3	0.0	BASELINE	Initial skill evaluation
1	55.1	+2.8	KEPT	Added explicit bottleneck detection checklist
2	54.0	-1.1	REVERTED	Tried adding trend forecasting section
3	57.8	+2.7	KEPT	Added causal analysis prompts with why/because patterns
```

---

## Safety Rules

1. **Scope lock**: Only `skill.md` is editable. Period.
2. **Atomic changes**: One focused edit per iteration. No multi-part changes.
3. **Git everything**: Every decision is tracked in git. No silent changes.
4. **Crash recovery**: If eval fails, revert skill.md and log the error.
5. **Score sanity**: If any dimension score is outside 0-100, revert and log.
6. **No self-modification**: Never edit the researcher skill, eval rubric, or test cases during a campaign.
7. **Human in the loop**: Always ask the user before copying trained skills back to production.
