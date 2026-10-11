---
version: 1.0
name: Quiz2Earn
description: Dark, flat product UI for Quiz2Earn, a BOTChain dApp where people learn Web3 in short lessons, pass a quiz, and claim BOT tokens. Built on the discipline of Layer3's system (dark flat surfaces, no shadows, restraint) with its own palette, type and quiz components.
colors:
  primary: "#EDE8DF"        # chalk — main CTA (light button on dark), progress fill
  on-primary: "#0F0F0E"     # text on chalk buttons
  correct: "#7DB892"        # muted sage — correct answers and "Passed" ONLY
  reward: "#E3AC48"         # BOT token amounts ONLY — never on buttons or headings
  error: "#E0645A"          # wrong answers, failed tx
  canvas: "#0F0F0E"         # page background (warm near-black)
  surface: "#171715"        # cards, quiz panel
  surface-raised: "#201F1D" # hover, selected option background
  border: "#2D2C29"         # 1px lines, card edges
  border-strong: "#3E3C38"  # focused / hovered option outline
  text: "#EDE8DF"           # titles, question text
  text-muted: "#9A958C"     # supporting copy, labels
  text-faint: "#66625B"     # meta, timestamps, disabled
typography:
  display:
    fontFamily: "Instrument Serif"
    use: "Landing headline and result-slip headline only. Never in UI controls."
    sizes: { xl: "56px/60px 400", lg: "40px/44px 400" }
  ui:
    fontFamily: "Geist"
    headline-lg: "24px/32px 600, -0.01em"
    headline-md: "20px/28px 600, -0.01em"
    question: "18px/28px 500"
    body: "15px/24px 400"
    body-sm: "14px/22px 400"
    label: "14px/20px 600"
    label-sm: "12px/16px 600, uppercase, 0.06em"
  mono:
    fontFamily: "Geist Mono"
    use: "Token amounts, scores, wallet addresses, tx hashes, question numbers."
    sizes: { lg: "20px/28px 500", md: "14px/20px 500", sm: "12px/16px 500" }
rounded:
  none: "0px"
  sm: "4px"     # badges, chips
  md: "8px"     # cards, answer options
  lg: "12px"    # primary button, quiz panel
  full: "9999px" # progress bar, avatar
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
layout:
  content-max: "1080px"
  quiz-max: "640px"
  gutter-mobile: "16px"
  gutter-desktop: "32px"
---

# Overview

Quiz2Earn teaches Web3 basics to new users, many of them in Nigeria, through short lessons followed by a 5-question quiz. Pass the quiz and you claim BOT tokens on BOTChain.

The look borrows Layer3's restraint: a near-black canvas, flat surfaces, one strong accent, and no decoration. What makes it ours:

- **Ink and chalk, not neon.** Warm near-black with chalk-white text and chalk buttons. No brand hue at all: colour is reserved for meaning (sage = correct, red = wrong, amber = money). This is what keeps it away from the neon-on-black "AI/crypto" look.
- **Amber is reserved for money.** Every BOT amount is amber and set in mono, so the reward is always easy to spot.
- **A serif display face** for the two moments that matter (the landing headline and the result slip). It reads like a certificate, not a SaaS dashboard.
- **Exam-style answers.** Options are labelled A–D, like a real exam paper (WAEC/JAMB), not as floating pill buttons.

Tone: calm, clear, a little proud. It should feel like a good teacher, not a casino.

# Colors

| Token | Hex | Use |
|---|---|---|
| primary | `#EDE8DF` | Main CTA (chalk button), progress fill |
| on-primary | `#0F0F0E` | Text on chalk buttons |
| correct | `#7DB892` | Correct answer, "Passed", claim success. Nothing else. |
| reward | `#E3AC48` | BOT amounts, "claimable" chip. Nothing else. |
| error | `#E0645A` | Wrong answer, failed transaction |
| canvas | `#0F0F0E` | Page background |
| surface | `#171715` | Cards, quiz panel |
| surface-raised | `#201F1D` | Hover and selected states |
| border | `#2D2C29` | Default 1px lines |
| border-strong | `#3E3C38` | Hover/focus outlines |
| text | `#EDE8DF` | Titles, questions |
| text-muted | `#9A958C` | Body and supporting copy |
| text-faint | `#66625B` | Meta, disabled |

Rules:
- Only one chalk button per screen (the main action).
- Never use cool greys or blue-blacks; every neutral is warm.
- Correct/wrong colours appear **only after** the user locks in an answer.
- Never put text-muted on surface-raised for body copy (contrast too low); use text instead.

# Typography

- **Instrument Serif** (display): landing hero and the result-slip headline ("You passed."). Two places only.
- **Geist** (UI): everything else: nav, questions, body, buttons.
- **Geist Mono**: anything that is a number or on-chain value: `+50 BOT`, `4/5`, `0x3f…a91c`, `Q2`.

Load them with `next/font` (`geist` package plus `Instrument_Serif` from `next/font/google`).

# Layout

Three pages, nothing more:

1. **`/` Home**: hero (serif headline, one sentence, Connect Wallet), then a grid of lesson cards, then a short "How it works" in 3 numbered steps, then the footer.
2. **`/quiz/[slug]` Lesson + Quiz**: a single centred column (max 640px). The lesson is a short read (3–5 short paragraphs), then the quiz panel, then the result slip with Claim.
3. **`/me` Profile**: wallet address, total BOT earned, completed lessons, and a simple leaderboard table.

- Mobile first. Most users will be on phones, so test at 360px wide.
- Use a 16px gutter on mobile and 32px on desktop. Content max width is 1080px.
- Lesson grid: 1 column on mobile, 2 on tablet, 3 on desktop.
- Separate sections with spacing (64px) and borders, not background colour bands.

# Elevation & Depth

None. No shadows, no glows, no blur, no gradients. Depth comes from the steps canvas → surface → surface-raised, plus 1px borders.

# Shapes

- Cards and answer options: 8px radius.
- Primary button and quiz panel: 12px.
- Badges and chips: 4px.
- Progress bar and avatar: full pill.

Nothing rounder than 12px except pills.

# Components

## Button
- **Primary**: bg primary, text on-primary, 12px radius, height 44px, padding 0 20px, label 14px/600. Hover: pure white. Disabled: surface-raised bg, text-faint.
- **Secondary**: transparent, 1px border, text colour text, 12px radius, same size. Hover: surface-raised bg.
- **Ghost/link**: text-muted, underline on hover only.
- Pending tx: keep the button width fixed and show a mono "Confirming…" label. No spinner circus.

## Lesson card
- surface bg, 1px border, 8px radius, 20px padding.
- Top row: topic chip (label-sm, text-muted, 4px radius border) on the left, reward `+50 BOT` (mono, reward colour) on the right.
- Title in headline-md, then a 2-line description in text-muted.
- Bottom row: `5 questions · 4 min` in mono sm, text-faint. If already passed, show a sage check and "Passed".
- Hover: border-strong. The whole card is a link.

## Quiz panel
- surface bg, 1px border, 12px radius, 24px padding (16px on mobile).
- Header: `Q2 / 5` in mono on the left, thin progress bar (4px, full radius, border track, primary fill) across the full width below.
- Question text uses the `question` style in colour text.

## Answer option
- Full-width row, 8px radius, 1px border, 14px 16px padding, surface bg.
- A letter box on the left: 28×28, 4px radius, 1px border, mono `A`–`D`.
- **Hover**: border-strong. **Selected**: surface-raised bg, border text, letter box filled with text colour and dark letter.
- **After lock-in**: correct option gets a correct (sage) border and letter box. The chosen wrong option gets an error border and an error letter box. Others fade to text-faint.
- Keyboard: keys A–D select an option, Enter locks it in.

## Result slip
The payoff screen. Treat it like a certificate.
- surface bg, 1px border, 12px radius, 32px padding, a dashed 1px top divider.
- Serif headline: "You passed." or "Not this time."
- Score line in mono lg: `4 / 5 correct`.
- Reward row: label "Reward" in label-sm, amount `+50 BOT` in mono lg, reward colour.
- Primary button "Claim 50 BOT". After success, show the tx hash (mono sm) linked to `scan.botchain.ai/tx/…`.
- If failed: secondary "Review lesson" and "Try again".

## Reward chip
Inline amber mono text, `+50 BOT`. Optionally inside a 4px-radius chip with a reward border at 30% opacity. Never on a filled amber background.

## Wallet button (nav)
- Disconnected: primary button "Connect wallet".
- Connected: secondary style showing a mono short address `0x3f…a91c` and BOT balance in amber.
- Wrong network: error-bordered button "Switch to BOTChain".

## Footer (required by the BOTChain challenge)
- Top border, 40px vertical padding, text-muted.
- Left: Quiz2Earn wordmark and a one-line description.
- Right: an "Ecosystem" column with the **BOT Chain logo** and links to **https://botchain.ai** and **https://scan.botchain.ai**, plus the contract address (mono, linked to the explorer) and the X account.
- This has to appear on every page.

# Copy

- Say what it does: "Learn how wallets work. Pass 5 questions. Earn 50 BOT."
- Short sentences. Explain jargon the first time it appears ("gas, the small fee you pay to use the chain").
- No "unlock the future", "revolutionary", or "seamless". No emoji in UI text.
- Button labels are verbs: "Start lesson", "Lock answer", "Claim 50 BOT".

# Do's and Don'ts

## Do
- Keep one chalk CTA per screen.
- Use colour only for meaning: sage, red, amber.
- Show every BOT amount in amber mono.
- Use the A–D exam layout for every quiz question.
- Link every on-chain value to scan.botchain.ai.
- Test every screen at 360px.

## Don't
- Don't use gradients, glassmorphism, glows or shadows.
- Don't use purple, blue or neon green anywhere. Neon-on-black reads as AI-generated, and blue is Layer3 territory.
- Don't use emoji as icons. Use a single icon set (Lucide, 1.5px stroke, 16/20px) and use it sparingly.
- Don't use confetti on pass. The result slip is the celebration.
- Don't use the serif outside the hero and the result slip.
- Don't use the default shadcn card look (big radius, soft shadow, 3 identical feature cards).
