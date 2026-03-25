/**
 * Seed: "HOW TO MAKE MUSIC" — comprehensive Beginner Music Production course
 * Run: node seedMusicCourse.js
 *
 * Curriculum based on industry-standard workflows used in Coursera, Berklee Online,
 * and leading music production programs (Ableton, FL Studio, music theory fundamentals).
 */

require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User');
require('./models/Mentor');
require('./models/Mentee');
const Course = require('./models/Course');

const modules = [
  // ─────────────────────────────────────────────────────────
  //  MODULE 1 — Welcome & Setting Up Your Studio
  // ─────────────────────────────────────────────────────────
  {
    order: 1,
    title: 'Welcome & Setting Up Your Home Studio',
    description: 'Get your workspace ready. You\'ll learn what gear you actually need (and what you can skip) to start making professional-sounding music from home.',
    lessons: [
      {
        order: 1,
        title: 'Welcome to the Course',
        isFreePreview: true,
        duration: '5 min',
        videoUrl: 'https://www.youtube.com/embed/njX2bu-_Vw4',
        content: `# Welcome to HOW TO MAKE MUSIC

Welcome! This course will take you from zero to producing your own complete tracks — no prior music knowledge required.

## What You'll Build By the End
By the time you finish this course you will have:
- **3 complete original tracks** spanning different styles (Afrobeats, Trap, and R&B)
- A working **home studio setup** running professional software
- A solid grasp of **music theory** applied directly to beat-making
- The ability to **record, mix, and export** your music at release quality

## Who This Course Is For
- Complete beginners who love music and want to create it
- Aspiring producers in Africa who want to work with local and international artists
- Anyone who has tried tutorials on YouTube but felt overwhelmed

## Your Instructor
**MUHETO MOHAMED K DIAKITE** is a professional music producer and mentor based in Rwanda. He has worked with regional artists across East Africa, producing in genres from Afrobeats to Gospel. He designed this course to give you the fastest, most practical path to making music you're proud of.

## How the Course Works
Each module contains:
1. A **video lesson** (watch on your own schedule)
2. **Written notes** — detailed text you can reference anytime
3. **Practical exercises** — do these before moving to the next lesson
4. **Resource links** — free tools, sample packs, and reading material

Let's get started!`
      },
      {
        order: 2,
        title: 'What Gear Do You Actually Need?',
        isFreePreview: true,
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/embed/7snOGFOFaHc',
        content: `# What Gear Do You Actually Need?

One of the biggest myths in music production is that you need expensive gear to make great music. You don't.

## The Essentials (Budget Setup — Under $200)

| Item | Purpose | Budget Option | Cost |
|------|---------|--------------|------|
| **Computer** | Running your DAW | Any laptop from 2018+ | Already have |
| **DAW Software** | Digital Audio Workstation | FL Studio (Fruity Edition) or GarageBand (Mac, Free) | $99 / Free |
| **Headphones** | Accurate audio monitoring | Audio-Technica ATH-M20x | $49 |
| **Audio Interface** | Better sound quality | Focusrite Scarlett Solo (optional for beginners) | $120 |
| **MIDI Keyboard** | Playing notes | Arturia MiniLab MkII (25-key) | $99 |

## The One Thing You Must Have
A **DAW (Digital Audio Workstation)** is your studio. Everything else is optional to start. The DAW is where you record, arrange, and mix everything.

### Top Free/Affordable DAWs

**GarageBand (Mac — Free)**
- Perfect for beginners
- Comes with thousands of free loops and sounds
- Exports professionally

**FL Studio Fruity Edition ($99)**
- The most popular DAW for hip-hop, trap, and Afrobeats production
- One-time payment, free lifelong updates
- What many professional producers started on

**Ableton Live Lite (Free with most audio interfaces)**
- Industry standard for electronic music and live performance
- Steep learning curve but very powerful

> **Recommendation for this course:** We'll use FL Studio screenshots and concepts, but everything translates directly to GarageBand and Ableton.

## What You DON'T Need Right Now
- Expensive studio microphone (unless you plan to record vocals immediately)
- Acoustic foam panels
- High-end studio monitors

## Practical Exercise
1. Download and install your chosen DAW
2. Open it and just look around — don't be intimidated
3. Post in the community forum: "Installed [DAW name], ready to go!" 🎵`
      },
      {
        order: 3,
        title: 'Understanding the DAW Interface',
        isFreePreview: false,
        duration: '18 min',
        videoUrl: 'https://www.youtube.com/embed/rVi8UoEXHRY',
        content: `# Understanding the DAW Interface

Before you make any music, you need to be comfortable moving around your studio. Let's break down the key areas.

## The 5 Core Areas of Any DAW

### 1. The Arrangement / Timeline View
This is your main workspace. Think of it like your canvas. Time runs left to right, and each horizontal track represents one sound layer (kick drum, melody, bass, etc.).

- **Tracks** run horizontally
- **Time** runs left to right  
- **Clips / regions** are the blocks of audio or MIDI you arrange

### 2. The Mixer
Controls volume, panning (left/right), and effects for each track. Just like a physical mixing board you'd see in a recording studio.

### 3. The Piano Roll / MIDI Editor
Where you program notes musically. Shows a piano keyboard on the left — higher notes are at the top, lower notes at the bottom. You draw in notes to create melodies, chords, and drum patterns.

### 4. The Browser / Library
Your sound library. Contains instruments, samples, loops, and effects plugins.

### 5. The Transport Bar
Play, stop, record, tempo (BPM), and time signature controls. Usually at the top or bottom of the screen.

## Key Keyboard Shortcuts (Learn These First)

| Action | FL Studio | GarageBand | Ableton |
|--------|-----------|------------|---------|
| Play/Stop | Spacebar | Spacebar | Spacebar |
| Record | R | R | R |
| Undo | Ctrl+Z | Cmd+Z | Ctrl+Z |
| Save | Ctrl+S | Cmd+S | Ctrl+S |
| Zoom in | Scroll up | Cmd+Right | + |
| Add track | Ctrl+T | Cmd+Option+A | Ctrl+Shift+T |

## Setting Your Project Tempo (BPM)
BPM = Beats Per Minute. This controls the speed of your song.

- **Afrobeats:** 95–110 BPM
- **Hip-Hop/Trap:** 130–145 BPM (hi-hats often at double tempo)
- **R&B:** 70–90 BPM
- **Dancehall:** 65–90 BPM

**For this course, start at 100 BPM** for our first exercises.

## Practical Exercise
1. Open your DAW
2. Set the BPM to 100
3. Create 4 audio tracks and 4 MIDI tracks — just to practice
4. Name them: "Kick", "Snare", "Hi-Hat", "Bass", "Melody 1", "Melody 2", "Chords", "FX"
5. Save the project as "My First Project"`
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  MODULE 2 — Music Theory for Producers
  // ─────────────────────────────────────────────────────────
  {
    order: 2,
    title: 'Music Theory for Producers (No Reading Music Required)',
    description: 'Learn just enough music theory to write melodies, chords, and bass lines that sound professional — without needing to read sheet music.',
    lessons: [
      {
        order: 1,
        title: 'Notes, Scales, and Keys Explained',
        isFreePreview: false,
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/embed/rgaTLrZGlk0',
        content: `# Notes, Scales & Keys — The Foundation of All Music

You don't need to read sheet music to understand the theory that powers every song you love. Here's what you actually need.

## The 12 Notes
Western music uses 12 notes, repeating in cycles (octaves):

**C — C# — D — D# — E — F — F# — G — G# — A — A# — B**

- The **natural notes** (white keys on a piano): C D E F G A B
- The **sharps/flats** (black keys): C# D# F# G# A#

## What Is a Scale?
A scale is a specific set of notes selected from those 12. Think of it as your "color palette" for a song. When all your sounds use notes from the same scale, everything sounds harmonious.

### The Major Scale — Happy, Uplifting
Formula: **Whole Whole Half Whole Whole Whole Half** (W W H W W W H)

**C Major Scale: C D E F G A B**

### The Minor Scale — Emotional, Dark, Soulful
Formula: **W H W W H W W**

**A Minor Scale: A B C D E F G**

> **Pro tip:** C Major and A Minor use the EXACT same notes. They're "relative" scales. Most Afrobeats and R&B is in a minor key.

## What Is a Key?
The "key" of a song just means which note feels like "home." In the key of C Major, the note C feels like the resting point. Your ears want to return to it.

## The Pentatonic Scale — The Cheat Code
Remove 2 notes from the minor scale and you get the **minor pentatonic** — the scale used in 90% of pop, hip-hop, and Afrobeats melodies:

**A Minor Pentatonic: A C D E G**

These 5 notes sound good in almost any combination. Start all your melodies here.

## In Your DAW (Piano Roll)
Look at the piano keyboard on the left of the piano roll:
- Find C (white key to the left of 2 black keys)
- Count up: C D E F G A B = the white keys up to the next C
- Shade ALL notes outside your chosen scale so you don't accidentally use wrong ones

Most DAWs have a "Scale Highlight" feature — turn it on!

## Practical Exercise
In your DAW's piano roll:
1. Set key to **A minor**
2. Draw in these notes one by one: A3 → C4 → D4 → E4 → G4 → A4
3. Play it back. Notice how it sounds musical even played in sequence.
4. Now try rearranging the order randomly. Still sounds good? That's the pentatonic magic.`
      },
      {
        order: 2,
        title: 'Chords — How to Build Them & Use Them',
        isFreePreview: false,
        duration: '22 min',
        videoUrl: 'https://www.youtube.com/embed/J6EPDKiuE-Y',
        content: `# Chords — Making Music Feel Emotional

Chords are what give a song its emotional character. A melody over chords feels completely different from just a melody alone.

## What Is a Chord?
A chord is 3 or more notes played simultaneously.

### The Two Basic Chords

**Major Chord — Happy, bright**
Formula: Root + 4 semitones up + 3 semitones up
- **C Major = C + E + G**

**Minor Chord — Sad, emotional**  
Formula: Root + 3 semitones + 4 semitones
- **A Minor = A + C + E**

## The 7th Chord — Adding Soul
Add one more note (7 semitones above the root) to get a richer chord:
- **Cmaj7 = C + E + G + B** (dreamy, R&B)
- **Am7 = A + C + E + G** (soulful, neo-soul)

## The 4 Chord Progressions Used in Most Songs

### 1. The I–V–vi–IV Progression ("Pop Progression")
Used in: hundreds of pop and Afrobeats songs

In C Major: **C — G — Am — F**

### 2. The i–VII–VI–VII Progression (Minor)
Used in: trap, hip-hop, emotional R&B

In A Minor: **Am — G — F — G**

### 3. The i–VI–III–VII Progression
Used in: Drake-style R&B, soulful beats

In A Minor: **Am — F — C — G**

### 4. The Two-Chord Loop
Used in: most Afrobeats and dancehall bangers

Example: **Dm — Am** (back and forth forever)

## How to Voice Chords for Beats

Don't play all chord notes at once in the low register — it gets muddy. Instead:

**Block chords:** All notes hit at once — works for pads and atmospheric chords
**Arpeggios:** Notes played one by one — works for melodies and leads  
**Stabs:** Short, percussive chord hits — works for Afrobeats and funk

## Practical Exercise
In the piano roll in A minor:
1. Build an **Am chord** (A3, C4, E4) — each note in its own row
2. Duplicate for 4 bars
3. Next 4 bars: change to **F major** (F3, A3, C4)
4. Next 4 bars: **C major** (C4, E4, G4)  
5. Next 4 bars: **G major** (G3, B3, D4)
6. That's the i-VI-III-VII progression. Hit play. That's a chord progression!`
      },
      {
        order: 3,
        title: 'Rhythm, Timing & Groove',
        isFreePreview: false,
        duration: '16 min',
        videoUrl: 'https://www.youtube.com/embed/6IqkPpd84q8',
        content: `# Rhythm, Timing & Groove

You can have the best chords in the world, but if your rhythm is off — nothing works. This lesson is about making your music feel alive.

## The Grid: Bars, Beats, and Subdivisions

**1 Bar = 4 Beats** (in 4/4 time — by far the most common)

Each beat can be divided:
- **Quarter notes** = 1 per beat (the "pulse")
- **Eighth notes** = 2 per beat (twice as fast)
- **Sixteenth notes** = 4 per beat (the subdivision used in trap and hi-hat patterns)
- **Triplets** = 3 per beat (gives that swing/shuffle feel — common in Afrobeats)

## The Core Drum Pattern (Foundational Beat)

Most popular music is built on this foundation:

\`\`\`
Beat:     1       2       3       4
Kick:     X               X
Snare:            X               X
Hi-Hat:   X   X   X   X   X   X   X   X   (eighth notes)
\`\`\`

This is the **4-on-the-floor** pattern. Once you hear it you'll recognize it everywhere.

## Swing & Quantization
**Quantization** = snapping notes to the exact grid. Makes things tight and precise.

**Swing** = slightly delaying the "off-beats" to give a human, groovy feel.

- **0% swing** = robotic, electronic
- **55–60% swing** = human, jazz/hip-hop groove
- **Afrobeats groove** = often uses 1/16 triplets with slight swing

## The Afrobeats Kick Pattern
Afrobeats kicks often land on beat 1 AND the "and" of beat 2:

\`\`\`
Beat:  1  +  2  +  3  +  4  +
Kick:  X        X     X
\`\`\`

That syncopation is what makes it feel like it's "lifting."

## Practical Exercise
In your drum machine / step sequencer:
1. Set BPM to **105**
2. Build the foundational pattern above
3. Add a **closed hi-hat** on every eighth note
4. Add an **open hi-hat** on the "and" of beat 4 only
5. Play for 8 bars and feel the groove
6. Now try adding the Afrobeats kick variation. Notice the difference.`
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  MODULE 3 — Building Your First Beat
  // ─────────────────────────────────────────────────────────
  {
    order: 3,
    title: 'Building Your First Beat Step by Step',
    description: 'Put theory into practice. You\'ll build a complete beat from scratch — drums, bass, melody, chords — in one session.',
    lessons: [
      {
        order: 1,
        title: 'Designing a Drum Pattern That Hits',
        isFreePreview: false,
        duration: '25 min',
        videoUrl: 'https://www.youtube.com/embed/tQLmkobq9CY',
        content: `# Designing a Drum Pattern That Hits

Drums are the backbone of any beat. Whether you're making Afrobeats, Trap, or R&B, the drum pattern determines the genre and feel more than anything else.

## Choosing Your Drum Samples

The quality of your drums matters enormously. Here's what to look for:

### Kick Drum
- Should have a clear "thud" — the sub-frequency punch you feel in your chest
- Avoid kicks that ring too long or sound "boxy"
- For **Afrobeats**: punchy, mid-focused kicks
- For **Trap**: deep 808 sub kicks with long sustain
- For **R&B**: softer, pillowy kicks with less attack

### Snare / Clap
- The snare hits on beats 2 and 4 in most genres
- **Layering** a snare + clap = wider, fatter sound
- Add a tiny bit of reverb to give it space

### Hi-Hats
- **Closed hi-hat**: short, tight tick — used for rhythm subdivision
- **Open hi-hat**: longer "tsss" — used for accents
- Rolling hi-hats (many fast 1/32 notes) = trap style

### Percussion
- Shakers, congas, bongos — key to the African feel in Afrobeats
- Usually sit in between the main kick/snare hits

## Free Sample Packs (Download These)
- **Cymatics** (cymatics.fm) — high-quality free packs weekly
- **Splice Sounds** — subscription service, huge library
- **Looperman** (looperman.com) — free community loops
- **LANDR** — free sample packs with professional quality

## Building an Afrobeats Drum Pattern

**BPM: 104**

Step sequencer (16 steps = 1 bar):

\`\`\`
              1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
Kick:         X        X     X           X        X         X
Snare:                 X              X                    
Open HH:                        X                    X     
Closed HH:    X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X
Shaker:          X     X     X     X     X     X     X     X
Conga:                       X                       X      
\`\`\`

## Building a Trap Drum Pattern

**BPM: 140**

\`\`\`
              1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
808 Kick:     X           X     X        X                  
Snare:                 X              X
HH (16ths):   X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X
HH Roll:                                         XXX XXXXXXX
\`\`\`

*The trap hi-hat roll at the end of bar 1 uses 32nd and 64th notes — program manually in the piano roll.*

## Practical Exercise
1. Pick ONE genre (Afrobeats, Trap, or R&B)
2. Download a free sample pack matching that genre
3. Build the drum pattern from this lesson in your DAW
4. Loop it for 8 bars and listen critically
5. Adjust velocities — not every hit should be at 100% volume. The variation creates feel.
6. Export the drum loop as an MP3 and save it`
      },
      {
        order: 2,
        title: 'Writing a Bass Line',
        isFreePreview: false,
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/embed/pCnvpMDerAA',
        content: `# Writing a Bass Line

The bass line is the glue between your drums and your melody. Get this right and your beat will immediately feel more professional.

## Rule #1: Bass and Kick Must Lock Together

The kick drum and bass need to work together rhythmically. When the kick hits — the bass either hits with it or fills the space right after.

**Locking pattern (Afrobeats style):**
\`\`\`
Kick:  X     X  X     X
Bass:  X  X     X  X  X  X
\`\`\`
Notice how they're interleaved — they complement rather than clash.

## What Notes to Use for Your Bass Line

**Keep bass lines simple.** Here's the rule:
1. Start each chord with the root note (the note the chord is named after)
2. Use only notes from your scale
3. Stay in octaves 1–2 (deep range)

### Bass Line for Am–F–C–G Progression (A Minor)

| Beat | Chord | Bass Note |
|------|-------|-----------|
| Bar 1 | Am | A1 |
| Bar 2 | F | F1 |
| Bar 3 | C | C2 |
| Bar 4 | G | G1 |

That's a complete, professional bass line. Simple works.

## The 808 Bass (Trap & Afrobeats)
The 808 is a long-sustaining bass with a pitch. You program it like a melody.

**Key 808 tips:**
- Use **portamento** (pitch slides between notes) for that sliding trap sound
- Let the 808 ring out — cut the next note's length so the 808 tail fades naturally
- Don't let two 808 notes overlap unless you want the slide effect

## Sidechaining: Making the Bass Pump
Sidechain compression makes the bass duck (get quieter) every time the kick hits. This is the "pumping" sound in all modern productions.

**How to set it up:**
1. Add a compressor on your bass channel
2. Set the sidechain input to your kick channel
3. Fast attack (5ms), moderate release (100ms)
4. The bass will automatically duck when the kick hits
5. Adjust ratio to taste (4:1 to 8:1)

## Practical Exercise
Using your chord progression from Module 2:
1. Open a new MIDI track → assign a bass instrument (choose a bass guitar sample or synth bass)
2. Write a root-note bass line (one note per chord, on beat 1)
3. Add passing notes between chords
4. Set up sidechaining with your kick
5. Loop for 8 bars — feel the difference with vs. without sidechain`
      },
      {
        order: 3,
        title: 'Crafting a Melody',
        isFreePreview: false,
        duration: '23 min',
        videoUrl: 'https://www.youtube.com/embed/Pq6L9-XRUBU',
        content: `# Crafting a Melody That's Memorable

The melody is what people will hum, whistle, and remember. It's the hook of your beat. Here's the practical process for writing one even if you've "never had a musical bone in your body."

## The #1 Approach: Sing It First
Before you touch your keyboard or piano roll — hum or sing a melody out loud. Don't judge it. Record it on your phone. Then translate what you sang into notes.

Most professional producers do this. Pharrell, Metro Boomin, Kel-P — they all sing or hum before they play.

## The Pentatonic Shortcut (Revisited)
Remember A Minor Pentatonic: **A C D E G**

These 5 notes are your safe zone. Pick any 3–5 of them in any order. As long as there's a pattern and repetition, it'll sound like a melody.

## 5 Melody Patterns to Steal (Legally)

### 1. The Step Pattern (Moving by 2nds)
Go up or down scale steps one at a time:
\`A → C → D → E → D → C → A\`
Result: Smooth, vocal-like

### 2. The Leap (Jumping over notes)
Skip notes for a more dramatic feel:
\`A → E → G → E → C\`
Result: Energetic, hook-like

### 3. Repetition with Variation
Start with a 2-note motif (small idea) and repeat it slightly differently:
\`A-C | A-C-D | A-C-E | back to A\`

### 4. Call and Response
Phrase 1 goes up = "question". Phrase 2 comes back down = "answer". 
Just like how a conversation works.

### 5. The One-Note Trick
Stay on one note for several beats, then move. Creates tension and release.

## Rhythm of Melodies
A melody isn't just notes — it's the rhythm of those notes that matters equally.

**Avoid:** Starting the melody EXACTLY on beat 1. It sounds stiff.
**Better:** Start the melody a half beat early (on the "and" of beat 4 of the previous bar). This is called a "pickup" or "anacrusis" — used in almost every hit song.

## Practical Exercise
In your DAW's piano roll (scale: A minor pentatonic):
1. Hum 4 bars of melody out loud. Record yourself.
2. Try to transcribe what you sang into the piano roll using only A, C, D, E, G
3. Quantize to 1/16 note grid
4. Play it over your drums and bass from previous lessons
5. Adjust velocities to give expression (louder on strong beats, softer in between)`
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  MODULE 4 — Sound Design & Instrument Selection
  // ─────────────────────────────────────────────────────────
  {
    order: 4,
    title: 'Sound Design & Choosing the Right Instruments',
    description: 'Learn to shape sounds using synthesis basics, choose the right virtual instruments for each genre, and build a tonal palette for your productions.',
    lessons: [
      {
        order: 1,
        title: 'Introduction to Synthesis — How Sounds Are Made',
        isFreePreview: false,
        duration: '22 min',
        videoUrl: 'https://www.youtube.com/embed/cHDpLKCGFAk',
        content: `# Introduction to Synthesis

Every synth sound in every song was DESIGNED by someone. Understanding the basics means you can create your own unique sounds instead of relying only on presets.

## ADSR — The Shape of Every Sound

Every instrument in your DAW has an **ADSR envelope** — it controls how the volume of a note changes over time.

\`\`\`
Volume
  │
  │      /\\
  │     /  \\    ___________
  │    /    \\  /           \\
  │   /      \\/             \\
  │__/                       \\____
  └──── A ──── D ─ S ──────── R ────▶ Time
\`\`\`

- **A (Attack)** — How fast the sound starts (short = sharp, long = slow fade in)
- **D (Decay)** — How fast it falls to the sustain level after the peak
- **S (Sustain)** — The volume level while the note is held
- **R (Release)** — How long after you release the key the sound continues

### ADSR Examples

| Instrument Feel | Attack | Decay | Sustain | Release |
|----------------|--------|-------|---------|---------|
| Piano | Short | Medium | Medium | Short |
| Strings (pads) | Long | Short | High | Long |
| Pluck synth | Short | Short | 0% | Short |
| Pads | Long | — | High | Long |
| Stabs | Short | Short | Low | Very short |

## Oscillators — The Sound Generator

The oscillator generates the raw sound. Different waveforms have different characters:

- **Sine wave** — Pure, clean, smooth (great for bass)
- **Square wave** — Hollow, nasal, electronic (great for lo-fi leads)
- **Sawtooth wave** — Bright, buzzy, rich (great for supersaw pads and leads)
- **Triangle wave** — Soft, between sine and square

## Filters — Shaping Tone

A **Low-Pass Filter (LPF)** cuts high frequencies. Turning the "cutoff" knob:
- Fully open = bright, full sound
- Rolled back = darker, warmer sound
- Used for: making leads feel distant, making basses feel warm

**Filter Envelope:** Use the ADSR to control how the filter opens and closes over time. This creates the classic "wah" or "vowel" effect on synths.

## Free Synths You Should Download

| Synth | Best For | Cost |
|-------|---------|------|
| VITAL | Everything — pads, leads, bass | Free |
| Surge XT | Electronic, experimental | Free |
| OB-Xd | Warm pads and leads | Free |
| Dexed | FM sounds, bells, electric piano | Free |

**VITAL** is especially recommended — it's used by professional producers and has a massive free preset library.

## Practical Exercise
1. Download VITAL (vital.audio)
2. Load a preset called "Init" (blank patch)
3. Change the oscillator waveform from sine to sawtooth
4. Slowly cut the low-pass filter cutoff — hear the brightness decrease
5. Adjust Attack from 0 to 500ms — hear the slow fade-in
6. Save your new preset as "First Custom Patch"`
      },
      {
        order: 2,
        title: 'Choosing Sounds for Afrobeats, Trap & R&B',
        isFreePreview: false,
        duration: '18 min',
        videoUrl: 'https://www.youtube.com/embed/JMkrn9ljzNA',
        content: `# Choosing Sounds for Your Genre

Every genre has a signature palette of sounds. Here's exactly what you need for the three main styles covered in this course.

## Afrobeats / Afropop Production Stack

### Drums
- **Burna-style kicks**: Deep, boomy, powerful punch
- **Snares**: Tight, sharp, sometimes layered with a rim shot
- **Hi-hats**: 1/8th triplets for that rolling Afrobeats groove
- **Percussion**: Low conga, shaker, djembe, cabasa

### Melodic Instruments
- **Marimba / xylophone**: The signature sound of many Afrobeats hits — bright, wooden, mallet-like tone
- **Steel drums / panflute samples**: Caribbean-influenced, summery
- **Electric piano (Rhodes/Wurli)**: Warm, soulful chord pads
- **Synth leads**: Simple, melodic, call-and-response phrasing

### Production Techniques
- **Heavy sidechain** on the bass to make the kick punch through
- **Lots of reverb** on the marimba/xylophone (medium room reverb)
- **Triplet rhythms** everywhere for the rolling feel

---

## Trap / Hip-Hop Production Stack

### Drums
- **808 bass**: The single most important element in trap — a long-sustaining pitched sub bass
- **Snare/clap layers**: Usually 2–3 sounds layered for thickness
- **Hi-hat rolls**: 1/32 to 1/64 note patterns with velocity automation

### Melodic Instruments
- **Hard-hitting plucks**: Sample-based pluck instruments (type beats)
- **Piano chops**: Short, filtered piano samples  
- **Dark pads**: Atmospheric, minor-key synth pads
- **Violin/strings**: Often pitched up or down for emotional effect

### Production Techniques
- **Pitch automation on 808**: The 808 "slides" from note to note using portamento
- **Loud, saturated mix**: Everything pushed to the edge without clipping
- **Minimal space** — everything close and in-your-face

---

## R&B / Neo-Soul Production Stack

### Drums
- **Soft kicks**: Less attack, more warmth
- **Ghost snares**: Quiet, additional snare hits between main hits for groove
- **Brushed hi-hats**: Smooth, jazzy hi-hat sounds

### Melodic Instruments
- **Rhodes electric piano**: The signature R&B instrument
- **Nylon string guitar or classical guitar samples**
- **Warm synth pads**: Long attack, very smooth
- **Fender bass or finger-style bass**: Round, warm bottom end

### Production Techniques
- **Lots of swing**: 55–65% swing on all MIDI
- **Jazz-influenced chords**: maj7, min9, dominant 7th extensions
- **Dynamics**: Volume variation throughout the track, softer verses and louder chorus

## Practical Exercise
Pick ONE genre for your practice beat and build a 4-instrument stack:
1. Load a drum kit matching the genre
2. Choose a bass sound
3. Choose ONE melodic lead instrument
4. Choose ONE pad/chord instrument
5. Program 4 bars using these 4 sounds — keep it simple`
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  MODULE 5 — Arrangement & Song Structure
  // ─────────────────────────────────────────────────────────
  {
    order: 5,
    title: 'Song Structure & Arrangement',
    description: 'Turn your 8-bar loop into a full 3-minute song. Learn professional arrangement techniques used in every genre.',
    lessons: [
      {
        order: 1,
        title: 'The Anatomy of a Song',
        isFreePreview: false,
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/embed/ICfnTEOMLLI',
        content: `# The Anatomy of a Song

A loop is not a song. A song takes the listener on a journey — tension and release, energy and rest. This lesson teaches you how to build that journey.

## Standard Song Structure

Most songs follow one of these two structures:

### Pop/Afrobeats Structure
\`\`\`
Intro (4–8 bars) → Verse 1 (16 bars) → Pre-Chorus (8 bars) → 
Chorus (16 bars) → Verse 2 (16 bars) → Pre-Chorus → Chorus → 
Bridge (8 bars) → Chorus (×2) → Outro (4–8 bars)
\`\`\`

### Hip-Hop / Trap Structure
\`\`\`
Intro (4 bars) → Verse 1 (16 bars) → Hook (8 bars) → 
Verse 2 (16 bars) → Hook (8 bars) → Bridge (8 bars) → 
Hook (16 bars) → Outro (4 bars)
\`\`\`

## The Energy Map

Map your song's energy. Think of energy as a y-axis:

\`\`\`
Energy
HIGH  │         ____      ____      ______
      │        /    \\    /    \\    /      
MID   │   __  /      \\  /      \\  /       
      │  /  \\/        \\/       \\  /        
LOW   │_/                        \\/         
      └── Intro─Verse─PreC─Chorus─Bridge─Outro ────
\`\`\`

The chorus is always the energy peak. The intro and verses build toward it.

## Key Arrangement Techniques

### 1. Layering (Adding elements progressively)
Don't start with everything at once. Build your track:
- **Intro**: Just drums + bass (stripped back)
- **Verse**: Add melody
- **Pre-chorus**: Add chord pad
- **Chorus**: FULL arrangement — everything playing

### 2. Drops & Breakdowns
At the start of the chorus, sometimes drop all the drums out for 1 beat, then bring them back with impact. This is a "drop" — used in Afrobeats and EDM constantly.

### 3. Ear Candy
Small additional sounds that keep the listener engaged:
- Risers (rising synth sweeps before a drop)
- Impacts / booms (single hits at important transitions)
- Reverse cymbals
- Vinyl crackle for warmth
- Ad-libs ("yeah!", "aye!") even if just as production texture

### 4. The 8-Bar Rule
Every 8 bars, something should change — even if it's small. Add a single shaker. Take away a hi-hat. Change the reverb. This prevents the listener from "tuning out."

## Building a Full Arrangement

Start with your 8-bar loop and duplicate it across the timeline:

\`\`\`
Timeline setup for a 3-minute song at 104 BPM:
Bar 1–4:    Intro (kick + bass only)
Bar 5–8:    Intro (add hi-hat + shaker)
Bar 9–24:   Verse 1 (add melody)
Bar 25–32:  Pre-Chorus (add pad, energy builds)
Bar 33–48:  Chorus (full arrangement)
Bar 49–64:  Verse 2 (drop pad back, but keep melody)
Bar 65–72:  Pre-Chorus
Bar 73–88:  Chorus
Bar 89–96:  Bridge (strip back — maybe half-time drums)
Bar 97–112: Final Chorus (add elements, longest chorus)
Bar 113–120: Outro (strips back to intro level, fade out)
\`\`\`

## Practical Exercise
Take your beat from Module 3:
1. Lay out 120 bars in your DAW
2. Map it to the structure above using labels/markers
3. Create 3 versions of your main loop: FULL, STRIPPED, BREAKDOWN
4. Arrange them according to the energy map
5. Add a riser at bars 32, 64, and 96`
      },
      {
        order: 2,
        title: 'Transitions & Builds',
        isFreePreview: false,
        duration: '15 min',
        videoUrl: 'https://www.youtube.com/embed/e7oWZJ1sTG0',
        content: `# Transitions & Builds — Making Your Song Flow

The difference between an amateur beat and a professional one often comes down to the transitions. How you get FROM one section TO another is an art.

## 5 Essential Transition Techniques

### 1. The Drum Fill
A variation at the end of a phrase (bars 4, 8, 16) that signals a change:
- Add extra snare hits in the last bar before the chorus
- Do a kick roll in the last 2 beats
- Add a ride cymbal crash on beat 1 of the new section

### 2. The Riser
A sound that sweeps upward in pitch and volume leading into a chorus or drop.
- Most DAWs have riser samples in stock
- Can also be automated: slow-filter opening on a white noise track
- Duration: 4–8 bars usually

### 3. The Reverse Crash
Take any cymbal sample, reverse it, place it so it ends RIGHT ON the first beat of the new section. It creates a "sucking" in effect before the drop.

### 4. The Snare Roll
Quarter → Eighth → Sixteenth notes on the snare, increasing in speed over 1–2 bars, leading into the chorus. Classic drum & bass / trap technique.

### 5. The Silence Drop
Remove EVERYTHING for 1–2 beats right before the chorus. The silence creates tension, and when the full beat drops back in, it hits much harder.

## The "DJ Filter" Transition
Automate a high-pass filter to gradually cut the low end over the last 4 bars of a section, then bring the full sound back with impact at the start of the next section.

## Volume Automation for Transitions
Automate volume on individual tracks:
- Bring the pad down in the verse, up in the chorus
- Automate the reverb wet signal to increase into the chorus
- Create a volume "dip" right before a drop

## Practical Exercise
In your arrangement from the previous lesson:
1. Find every section transition point
2. Add a reverse cymbal 2 bars before each chorus
3. Add a drum fill in the last bar before each chorus
4. Add a 1-beat silence before the final chorus drop
5. Export the full track and listen — feel the journey`
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  MODULE 6 — Mixing & Mastering Basics
  // ─────────────────────────────────────────────────────────
  {
    order: 6,
    title: 'Mixing & Mastering for Release-Ready Tracks',
    description: 'Make your music sound loud, clear, and professional on any speaker. Learn the essential mixing and mastering techniques used by professional engineers.',
    lessons: [
      {
        order: 1,
        title: 'The 5 Core Mixing Tools',
        isFreePreview: false,
        duration: '28 min',
        videoUrl: 'https://www.youtube.com/embed/KEu0rPdp3nA',
        content: `# The 5 Core Mixing Tools

Mixing is about making every element of your track audible and clear — on any playback system, from earbuds to club speakers.

## Tool 1: Volume Faders
The most fundamental. Set relative volumes so no single element overwhelms the others.

**Starting point (rough mix):**
| Element | Starting Volume |
|---------|----------------|
| Kick | 0 dB (reference) |
| Bass | −3 dB |
| Snare/Clap | −2 dB |
| Hi-hats | −8 to −12 dB |
| Main Melody | −5 dB |
| Chords/Pads | −10 dB |
| Percussion | −12 dB |
| Vocals | −3 dB |

## Tool 2: EQ (Equalization)
EQ adjusts the frequency content of each sound. Use it to:

### Cut (Subtractive EQ) first:
- **Low-cut every track except kick and bass** — remove muddy low frequencies from instruments that don't need them
- Set a high-pass filter at **80–120 Hz** on guitars, pianos, pads
- Set a high-pass filter at **200–300 Hz** on hi-hats and cymbals

### Common EQ fixes:
- Kick sounds muddy: Cut 200–400 Hz slightly
- Bass clashes with kick: Cut bass at 60–80 Hz, boost kick slightly there
- Melody sounds harsh: Cut 2–5 kHz slightly
- Melody sounds dull: Boost 8–12 kHz (air band)

## Tool 3: Compression
Compression reduces the volume of loud peaks, making the overall sound more even and punchy.

**Key parameters:**
- **Threshold**: The level at which compression kicks in
- **Ratio**: How much compression (4:1 = mild, 10:1 = heavy)
- **Attack**: How quickly it responds (fast = more squashed, slow = more punch)
- **Release**: How fast it lets go

**Recipes:**

*Drumkick (for punch):*
- Threshold: −10 dB, Ratio: 4:1, Attack: 5ms, Release: 50ms

*Bass (for evenness):*
- Threshold: −15 dB, Ratio: 3:1, Attack: 20ms, Release: 100ms

## Tool 4: Reverb
Makes sounds feel like they're in a space. Essential for depth and atmosphere.

**Reverb types:**
- **Room**: Small, natural, used on drums and vocals
- **Hall**: Large, lush, used on pads and strings
- **Plate**: Vintage, smooth, used on snares and vocals

> **Rule:** Use reverb on a separate SEND/RETURN track, not directly on the instrument. This gives you more control and uses less CPU.

## Tool 5: Stereo Width (Panning)
Spread your sounds across the stereo field:

| Element | Pan Position |
|---------|-------------|
| Kick & Bass | CENTER |
| Lead melody | CENTER or slight L/R |
| Chord pads | Wide L + R |
| Hi-hats | Slight right |
| Shaker | Slight left |
| Percussion fills | Spread across field |

## Practical Exercise
Open your beat from Module 3 and:
1. Apply a high-pass filter (80 Hz) to every non-bass track
2. Set rough starting volumes using the table above
3. Apply light compression to the kick (recipe above)
4. Create a reverb return channel and send 25% of the snare to it
5. Pan your chord pads: left pad at −30, right pad at +30`
      },
      {
        order: 2,
        title: 'Mastering Your Track for Streaming',
        isFreePreview: false,
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/embed/WJL5KmvTJx4',
        content: `# Mastering Your Track for Streaming

Mastering is the final step — preparing your track for release on Spotify, Apple Music, YouTube, and Audiomack.

## What Mastering Achieves
1. **Loudness**: Brings your track to streaming platform standards
2. **Tonal balance**: Ensures it sounds right on all speakers
3. **Stereo consistency**: Checks monaural compatibility
4. **Limiting**: Prevents clipping (distortion from too-loud peaks)

## Streaming Loudness Standards

Different platforms have different target loudness (LUFS = Loudness Units Full Scale):

| Platform | Target Loudness |
|----------|----------------|
| Spotify | −14 LUFS (normalized) |
| Apple Music | −16 LUFS |
| YouTube | −14 LUFS |
| Tidal | −14 LUFS |
| SoundCloud | −8 to −10 LUFS (no normalization) |

**Aim for −14 to −12 LUFS on your master.** 

## The Basic Mastering Chain

Apply these in order on your master bus (the final output channel):

\`\`\`
1. EQ (gentle corrections)
   → Small dip at 200–400 Hz if muddy
   → Slight shelf boost at 10 kHz for air

2. Multiband Compressor (optional)
   → Gentle settings, just controlling dynamics per frequency range
   
3. Stereo Imager (optional)
   → Narrow the stereo field below 250 Hz (bass should be mono)
   → Widen slightly above 5 kHz for sparkle

4. Limiter (ESSENTIAL)
   → Ceiling: −0.3 dBTP (for streaming)
   → Adjust input gain until LUFS meter reads −14 to −12
   → Make sure there's NO clipping
\`\`\`

## Free Mastering Tools
- **LUFS Meter** (Youlean Loudness Meter, free) — measure loudness
- **Limiter No6** — free professional limiter
- **TDR Nova** — free dynamic EQ
- **iZotope Ozone Elements** — sometimes free with sample packs

## Online Mastering Service (For When You're Ready)
**LANDR** (landr.com) and **eMastered** offer automatic AI mastering starting at $5–10/track. Good for quick releases while you learn manual mastering.

## Export Settings for Streaming

When bouncing/exporting your final master:
- **Format**: WAV (not MP3 — upload the highest quality to platforms, they compress it themselves)
- **Bit depth**: 24-bit
- **Sample rate**: 44,100 Hz (44.1 kHz)
- **Channels**: Stereo

## Practical Exercise & Final Project
1. Load your arranged beat from Module 5
2. Run through all mixing steps from the previous lesson
3. Add the mastering chain to the master bus
4. Use a LUFS meter to target −14 LUFS
5. Export as 24-bit WAV
6. Upload to SoundCloud (free account) and share the link in the course community
**Congratulations — you've just released your first track!**`
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  MODULE 7 — Releasing & Building a Career
  // ─────────────────────────────────────────────────────────
  {
    order: 7,
    title: 'Releasing Your Music & Building a Career in Africa',
    description: 'How to distribute your music globally, build your brand, find artists to work with, and monetize your production skills in the African creative economy.',
    lessons: [
      {
        order: 1,
        title: 'Distributing Your Music Globally',
        isFreePreview: false,
        duration: '18 min',
        videoUrl: 'https://www.youtube.com/embed/m9bVOfX5enY',
        content: `# Distributing Your Music Globally

Once you have a finished, mastered track, every stream, download, and sync can generate revenue. Here's how to get your music everywhere.

## How Music Distribution Works
Music distributors act as middlemen between you and the streaming platforms. You give them your music → they put it on Spotify, Apple Music, Boomplay, Audiomack, etc. → royalties flow back to you.

## Top Distributors for African Artists

### DistroKid ($22/year — unlimited releases)
- Fastest distribution (often live within 24–48 hours)
- Keeps 100% of royalties
- Automatically collects from 150+ platforms
- Has Spotify Verified Artist integration

### TuneCore ($14.99/year per album)
- Very established, great for Africa-specific reporting
- Collects publishing royalties too
- Good customer support

### Amuse (Free tier)
- Mobile-first — distribute from your phone
- Free plan distributes to major platforms
- No upfront cost, takes a small percentage

### Boomplay Direct (For African-focused releases)
- Largest African music streaming platform
- 80 million users across Africa
- Less competition = higher per-stream rates than Spotify in some cases
- Apply directly at boomplay.com

## What You Need Before Distributing
1. **Mastered WAV file** (24-bit, 44.1 kHz)
2. **Artwork** (3000 × 3000 px, JPG, RGB) — no blur, no pixelation
3. **ISRC code** — most distributors assign this automatically
4. **Release date** — at least 1–2 weeks in the future for pitch submission
5. **Genre & mood tags** — affects algorithmic placement

## Getting on Spotify Editorial Playlists
Submit via **Spotify for Artists** at least 7 days before release:
- Fill in every detail about your track
- Write a compelling story in the pitch section
- Include your location (African artists get Africa-focused playlist consideration)

## Practical Exercise
1. Create accounts on DistroKid (or Amuse for free option) and Boomplay
2. Prepare your artwork (use Canva — free templates)
3. Schedule your export from the previous lesson for release
4. Submit to distributor
5. Set release date 2 weeks out and submit for Spotify editorial pitch`
      },
      {
        order: 2,
        title: 'Building Your Producer Brand in Africa',
        isFreePreview: false,
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/embed/jz2GdWqrz_o',
        content: `# Building Your Producer Brand in Africa

The African music industry is one of the fastest-growing in the world. Afrobeats, Amapiano, Afro-hiphop, and Afropop are generating billions globally. Here's how to position yourself.

## Your Producer Tag
A producer tag is the short phrase or sound that plays at the beginning of a beat to identify you. Think "YO GOTTI" for Southside or "METROO BOOMIN" by Metro Boomin.

**Your tag should be:**
- 2–3 words max
- Distinctive sound (often produced in your own vocal)
- Automatically added to every beat you release

## Where African Producers Are Finding Work (2026)

### Instagram & TikTok
- Post **beat snippets** (30–60 seconds) — this is standard practice
- Use trending sounds to reach new audiences
- Show your process — studio workflow videos outperform finished tracks 3:1
- Tag artists you'd like to work with

### Beatstars & Airbit (Beat Selling Platforms)
- Upload your beats with professional mixing for artists to buy
- License structure: Lease ($30–100), Exclusive ($200–2000)
- Beats with high-quality WAV + trackouts sell for premium
- Connect your account to Instagram bio

### Local Networking
- Attend music events, showcases, concerts in your city
- Connect with vocalists, rappers, and singers on SoundCloud and Boomplay
- Offer 1–2 beats for free to artists with audiences — the credit is worth more early

### Cre8 Platform (You're Already Here!)
- Offer beat-making mentorship sessions on Cre8
- List your courses (like this one) to generate passive income
- Connect directly with aspiring producers who need guidance

## Pricing Your Beats
| License Type | Usage | Suggested Price |
|-------------|-------|----------------|
| MP3 Lease | Demos, SoundCloud, low-budget | $30 – $75 |
| WAV Lease | Professional recordings, streaming | $75 – $150 |
| Trackout Lease | Stem files for professional mixing | $150 – $300 |
| Exclusive | Full ownership, no re-licensing | $500 – $2,000+ |
| Consignment | Per-stream royalty split | 20–50% producer royalty |

## Protecting Your Work
- **Register with a PRO (Performing Rights Organization)**: SOAPI (Rwanda), KECOBO (Kenya), SACEM (Francophone Africa)
- Once registered, you collect royalties whenever your music plays on radio, TV, streaming
- Always include producer credits in song metadata

## Practical Exercise
1. Create a Beatstars account (free)
2. Upload your beat from this course with professional artwork
3. Set a $75 WAV lease price
4. Share the link on Instagram with a 30-second snippet
5. Tag 3 artists in your genre whose style matches your beat`
      }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/cre8');
  console.log('Connected to MongoDB');

  // Find the course
  const course = await Course.findOne({ title: /HOW TO MAKE MUSIC/i });
  if (!course) {
    console.error('Course "HOW TO MAKE MUSIC" not found. Make sure the course exists.');
    process.exit(1);
  }

  // Update the course with full content
  course.description = `Master the art of music production from scratch. In this comprehensive beginner course, you will learn everything from setting up your home studio and understanding music theory, to programming professional drum patterns, writing melodies, mixing, and releasing your music to the world. Designed specifically for aspiring producers in Africa by MUHETO MOHAMED K DIAKITE — no prior music knowledge required.`;
  course.duration = '7 Weeks';
  course.topics = [
    'Set up a professional home studio on any budget',
    'Understand music theory without reading sheet music',
    'Program drum patterns for Afrobeats, Trap, and R&B',
    'Write bass lines, melodies, and chord progressions',
    'Design sounds using synthesis fundamentals',
    'Arrange a full 3-minute song structure',
    'Mix and master your tracks for streaming platforms',
    'Distribute your music on Spotify, Apple Music & Boomplay',
    'Build your producer brand and start earning from beats'
  ];
  course.modules = modules;

  await course.save();
  console.log(`✓ Course "${course.title}" updated with ${modules.length} modules and ${modules.reduce((a, m) => a + m.lessons.length, 0)} lessons.`);
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  mongoose.disconnect();
  process.exit(1);
});
