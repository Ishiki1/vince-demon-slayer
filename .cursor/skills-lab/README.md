# Skills Lab

**Autonomous skill improvement through iterative search.**

The Skills Lab is a reusable framework for running training campaigns on any Cursor skill file (`.md`). It applies the autoresearch paradigm -- propose one focused change, evaluate mechanically, keep if better, revert if worse, repeat -- to continuously improve the quality of skill-driven outputs.

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    THE TRAINING LOOP                     │
│                                                          │
│  1. READ STATE                                           │
│     ├── skill.md (current version)                       │
│     ├── results.tsv (history of scores)                  │
│     ├── checkpoint.json (resume point)                   │
│     └── campaign_brief.md (goals & focus areas)          │
│                                                          │
│  2. PROPOSE ONE CHANGE                                   │
│     ├── Analyze weakest scoring dimensions               │
│     ├── Draft a single, focused edit to skill.md         │
│     └── State the hypothesis                             │
│                                                          │
│  3. APPLY EDIT                                           │
│     └── Modify skill.md only                             │
│                                                          │
│  4. EVALUATE (inline, no external scripts)               │
│     ├── For each test case:                              │
│     │   ├── Generate dry-run output using skill          │
│     │   ├── Judge output against rubric                  │
│     │   └── Score per dimension (0-100)                  │
│     ├── Weighted average across dimensions & cases        │
│     └── FINAL_SCORE: XX.X                                │
│                                                          │
│  5. DECIDE                                               │
│     ├── FINAL_SCORE > best? → git commit                 │
│     └── FINAL_SCORE ≤ best? → git revert                │
│                                                          │
│  6. LOG to results.tsv + update checkpoint.json          │
│                                                          │
│  7. REPEAT (up to N iterations)                          │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Start a New Campaign

```bash
# Copy the template into a new campaign directory
cp -r .cursor/skills-lab/template .cursor/skills-lab/campaigns/my-skill-v1
```

Point the Cursor agent at `researcher.md` as its skill. It will run the kickoff wizard to populate:
- `config.yaml` (goal, iterations)
- `campaign_brief.md` (what to improve, what to protect)
- `eval_rubric.md` (scoring dimensions & weights)
- `test_cases/` (scenario files for evaluation)
- `skill.md` (copy of the skill being trained)

### 2. Run Training

Use `researcher.md` as the guiding skill for a Cursor agent session. The agent will:
- Read the campaign config
- Execute the loop for N iterations
- Save checkpoints for resume capability

### 3. Review Results

Check the score history in `results.tsv` inside the campaign directory.

See the git log of accepted changes:
```bash
git log --oneline -- .cursor/skills-lab/campaigns/my-skill-v1/skill.md
```

## Folder Structure

```
.cursor/skills-lab/
├── README.md              # This file
├── researcher.md          # Meta-skill: instructs the agent running the loop
├── template/              # Duplicate per new campaign
│   ├── config.yaml        # Campaign parameters
│   ├── campaign_brief.md  # Goals from kickoff wizard
│   ├── skill.md           # THE FILE BEING OPTIMIZED
│   ├── eval_rubric.md     # Scoring dimensions & weights
│   └── checkpoint.json    # Resume support
└── campaigns/             # Active & completed runs
    └── <name>/
        ├── config.yaml
        ├── campaign_brief.md
        ├── skill.md
        ├── eval_rubric.md
        ├── test_cases/    # Scenario inputs
        ├── outputs/       # Generated outputs per iteration
        ├── checkpoint.json
        └── results.tsv    # Iteration log
```

## Infrastructure

- **Runtime**: Cursor agent (no external APIs or Python scripts)
- **Evaluation**: Agent performs dry-run generation and rubric judging inline
- **Judging**: Structured JSON scoring with mandatory per-dimension reasoning
- **Version control**: Git commit winners, revert losers
- **Resume**: checkpoint.json saves state after every iteration

## Differences from the Original (AWS Bedrock) Version

This is a Cursor-native adaptation of the Skills Lab framework. Key changes:

| Original (Bedrock) | Cursor-Native |
|---------------------|---------------|
| Python scripts in `lib/` call AWS Bedrock | Agent generates and judges inline |
| `boto3` + AWS credentials required | No external dependencies |
| `run_eval.py` orchestrates evaluation | Researcher agent follows eval steps directly |
| `config.yaml` has model_id, region | Simplified config (no model fields) |
| Separate LLM calls for generate + judge | Agent performs both in sequence |

The original `skills-lab.zip` is kept as an archive at the project root for reference.
