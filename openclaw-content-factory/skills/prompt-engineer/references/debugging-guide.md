# Prompt Debugging Guide

> © Фабрика Контента | OpenClaw Content Factory | Marat | https://t.me/Mticool | openclaw.ai

Systematic approach to diagnosing and fixing prompt failures.

---

## The Debugging Mindset

```
Prompt engineering is not magic.
Every failure has a diagnosable cause.
Change ONE thing at a time.
```

---

## Step 1: Identify the Failure Mode

Before fixing, diagnose precisely. What EXACTLY is wrong?

### Failure Mode Catalog

| Symptom | Failure Mode | Root Cause |
|---------|--------------|------------|
| Output is generic, unhelpful | **Vagueness** | Instructions too abstract |
| Output ignores some instructions | **Instruction Overload** | Too many conflicting rules |
| Output format is wrong | **Format Ambiguity** | Format not specified clearly |
| Output is too long/verbose | **No Length Constraint** | Didn't specify limits |
| Output makes up facts | **Hallucination** | No grounding, no "I don't know" permission |
| Output inconsistent across runs | **Insufficient Examples** | No few-shot, high temperature |
| Output misses edge cases | **Edge Case Blindness** | Not addressed in prompt |
| Output has wrong tone | **Persona Gap** | No role or weak role definition |
| Output is correct but unusable | **Format Mismatch** | Wrong output format for use case |
| Model refuses to answer | **Over-Restriction** | Constraints too broad |
| Model gives partial answer | **Context Loss** | Important info buried or unclear |

---

## Step 2: Diagnose with Targeted Questions

### For Vague Output

Ask yourself:
- [ ] Did I specify WHAT exactly I want?
- [ ] Did I specify HOW it should be formatted?
- [ ] Did I specify the LEVEL of detail?
- [ ] Did I give EXAMPLES of good output?

**Test prompt:**
```markdown
Take my prompt and identify:
1. What specific task is being asked?
2. What format is expected?
3. What would "success" look like?

My prompt: {{YOUR_PROMPT}}

If any of these are unclear, explain why.
```

### For Ignored Instructions

Ask yourself:
- [ ] Are there too many instructions (>7)?
- [ ] Do any instructions contradict each other?
- [ ] Are instructions buried in long text?
- [ ] Are priorities clear?

**Test prompt:**
```markdown
Read this prompt and list every distinct instruction given:
{{YOUR_PROMPT}}

Then identify:
- Any conflicting instructions
- Instructions that might be ambiguous
- Instructions that are too broad
```

### For Hallucination

Ask yourself:
- [ ] Did I restrict to provided sources?
- [ ] Did I give permission to say "I don't know"?
- [ ] Did I require citations?
- [ ] Is the question actually answerable from context?

### For Wrong Format

Ask yourself:
- [ ] Did I specify the exact format?
- [ ] Did I show an example of correct format?
- [ ] Did I say "ONLY output X, no other text"?

---

## Step 3: Apply Targeted Fixes

### Fix: Vagueness → Specificity

**Before:**
```
Help me with this customer email.
```

**After:**
```
Analyze this customer support email and:
1. Classify the issue type (billing/technical/shipping/other)
2. Rate urgency (high/medium/low)
3. Draft a 3-sentence response addressing their concern
4. Note any escalation needed

Email: {{EMAIL}}

Output as:
Issue: [type]
Urgency: [level]
Response: [draft]
Escalate: [yes/no + reason if yes]
```

### Fix: Instruction Overload → Prioritization

**Before:**
```
Be helpful, be concise, be detailed, be friendly but professional,
don't be too formal, don't be too casual, answer thoroughly,
get to the point quickly, use examples, don't ramble,
cite sources, be conversational, use bullet points...
```

**After:**
```
# Priority 1 (Must Follow)
- Maximum 150 words
- Include exactly 3 bullet points

# Priority 2 (Should Follow)
- Professional but friendly tone
- One example if helpful

# Priority 3 (Nice to Have)
- Cite sources if available
```

### Fix: Format Ambiguity → Explicit Format

**Before:**
```
Extract the contact information.
```

**After:**
```
Extract contact information as JSON:

{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "company": "string or null"
}

Return ONLY the JSON object. No other text.
If a field is not found, use null.
Do not guess or infer missing information.
```

### Fix: Hallucination → Grounding

**Before:**
```
Answer questions about the document.
```

**After:**
```
Answer questions based ONLY on the provided document.

Rules:
1. Every claim must be supported by the document
2. Quote the relevant passage before answering
3. If the answer is not in the document, say: "Not found in provided text"
4. Do not use external knowledge
5. If uncertain, express uncertainty explicitly

Format:
Quote: "[relevant passage]"
Answer: [your answer based on the quote]
Confidence: [high/medium/low]
```

### Fix: Inconsistency → Few-Shot Examples

**Before:**
```
Categorize these support tickets.
```

**After:**
```
Categorize support tickets. Follow these examples exactly:

Example 1:
Ticket: "I can't log in, password reset isn't working"
Category: account_access
Priority: high

Example 2:
Ticket: "When will you add dark mode?"
Category: feature_request
Priority: low

Example 3:
Ticket: "App crashes when uploading files over 10MB"
Category: bug
Priority: high

Now categorize:
Ticket: "{{NEW_TICKET}}"
Category:
Priority:
```

### Fix: Edge Case Blindness → Explicit Edge Cases

**Before:**
```
Parse the date from the input.
```

**After:**
```
Parse the date from the input.

Handle these cases:
- Standard formats: "2024-01-15", "01/15/2024", "January 15, 2024"
- Relative dates: "tomorrow", "next week", "in 3 days"
- Partial dates: "January 2024" → use the 1st of the month
- No date found: return null
- Ambiguous dates: "01/02/2024" → assume MM/DD/YYYY (US format)
- Invalid dates: "February 30" → return null with error message

Output format:
{
  "date": "YYYY-MM-DD" or null,
  "confidence": "high" | "medium" | "low",
  "error": "string or null"
}
```

### Fix: Persona Gap → Rich Role Definition

**Before:**
```
You are a helpful assistant.
```

**After:**
```
You are Sarah Chen, a senior software architect with 15 years of experience.

Background:
- Worked at Google, Stripe, and two YC startups
- Specialize in distributed systems and API design
- Known for pragmatic, not theoretical, advice
- Believe in "boring technology" that works

Communication style:
- Direct and concise
- Use concrete examples over abstract concepts
- Challenge assumptions politely
- Admit when something is outside your expertise
- Prefer "it depends" over universal rules

You are NOT:
- A salesperson (don't push technologies)
- A perfectionist (good enough > perfect)
- Academic (real-world > theory)
```

---

## Step 4: The Debugging Loop

```
1. Run prompt
2. Check output
3. Identify ONE specific failure
4. Apply ONE targeted fix
5. Run prompt again
6. Compare: Did it improve?
   - Yes → If more issues, go to step 3
   - No → Revert fix, try different approach
7. Document what worked
```

### Why Change Only One Thing

| Approach | Problem |
|----------|---------|
| Change many things | Don't know what helped |
| Big rewrite | Lose working parts |
| Guess and check | Random, slow |
| One change at a time | Know exactly what works |

---

## Step 5: Advanced Debugging Techniques

### Meta-Debugging Prompt

Ask the LLM to analyze its own failures:

```markdown
You just generated this output for this prompt:

Prompt: {{ORIGINAL_PROMPT}}
Output: {{GENERATED_OUTPUT}}
Expected: {{WHAT_YOU_WANTED}}

Analyze why the output doesn't match expectations.
What was unclear or missing from the prompt?
How should the prompt be modified to get the expected output?
```

### A/B Testing Prompts

```markdown
# Version A
[prompt version A]

# Version B
[prompt version B]

Test both versions on these inputs:
1. {{TEST_INPUT_1}}
2. {{TEST_INPUT_2}}
3. {{TEST_INPUT_3}} (edge case)

Compare results and explain which version works better and why.
```

### Temperature Debugging

If output is inconsistent, test across temperature:

```
temp=0: [result] ← Most deterministic
temp=0.3: [result]
temp=0.7: [result]
temp=1.0: [result] ← Most creative

If results vary wildly even at temp=0:
→ Prompt is ambiguous, fix the prompt first
```

### Context Window Debugging

If model seems to "forget" instructions:

1. Check token count — are you near the limit?
2. Move critical instructions to the END of prompt (recency bias)
3. Repeat key constraints at multiple points
4. Summarize long context before asking questions

```markdown
# Document (long)
{{LONG_DOCUMENT}}

# Reminder
Remember: You can ONLY use information from the document above.
If information is not in the document, say "not found."

# Question
{{QUESTION}}
```

---

## Debugging Cheat Sheet

### Quick Diagnosis Table

| What's Wrong | Quick Fix |
|--------------|-----------|
| Too vague | Add 3 specific requirements |
| Too long | Add word/sentence limit |
| Wrong format | Add example output |
| Inconsistent | Add 2-3 few-shot examples |
| Makes stuff up | Add "only use provided info" + "say I don't know if unsure" |
| Ignores some rules | Reduce to 5 core rules, prioritize |
| Wrong tone | Add specific role description |
| Refuses too much | Narrow constraints to specific cases |

### The 5-Minute Fix

For any broken prompt, try adding these in order until fixed:

1. **Format example** — show exact expected output
2. **3 examples** — demonstrate the pattern
3. **Explicit constraints** — say what NOT to do
4. **Role** — give specific expertise
5. **Step-by-step** — break into numbered steps

### When Nothing Works

1. **Start over** — build up from simple working version
2. **Decompose** — break into multiple simpler prompts (chaining)
3. **Change model** — some tasks work better on different models
4. **Change approach** — maybe the task needs different framing

---

## Common Prompt Smells

### 🔴 Red Flags in Prompts

```markdown
❌ "Be helpful and comprehensive"
   → Too vague, means nothing

❌ "Don't be too long or too short"
   → Contradictory, give specific length

❌ "You are an AI assistant"
   → Generic, give specific role

❌ "Answer questions about the topic"
   → What topic? What format?

❌ Long paragraphs of instructions
   → Use bullet points, headers

❌ "Be creative but also accurate"
   → Tension without resolution

❌ No examples for complex tasks
   → Almost always need examples
```

### 🟢 Good Prompt Patterns

```markdown
✅ "You are a tax accountant with 10 years of experience in small business"
   → Specific role

✅ "Respond in exactly 3 bullet points, each under 15 words"
   → Clear format

✅ "If unsure, say 'I'm not certain, but...' rather than guessing"
   → Handles uncertainty

✅ "Priority 1: Never reveal personal data. Priority 2: Be helpful"
   → Prioritized rules

✅ Examples showing input → output
   → Demonstrates the pattern
```

---

## Debugging Log Template

Use this to track debugging sessions:

```markdown
## Prompt Debugging Log

### Original Prompt
[paste prompt]

### Expected Output
[what you wanted]

### Actual Output
[what you got]

### Failure Mode
[vague/format/hallucination/etc.]

### Hypothesis
[why you think it failed]

### Fix Applied
[what you changed]

### Result
[did it help?]

### Learnings
[what to remember for next time]
```

---

## Sources

- [The Prompt Engineering Playbook](https://addyo.substack.com/p/the-prompt-engineering-playbook-for)
- [14 Prompt Engineering Mistakes](https://www.linkedin.com/pulse/beyond-prompt-pray-14-engineering-mistakes-youre-still-mcgovern)
- [Common Prompt Engineering Mistakes](https://www.mxmoritz.com/article/common-mistakes-in-prompt-engineering)
- [Prompt Engineering Best Practices](https://www.digitalocean.com/resources/articles/prompt-engineering-best-practices)
