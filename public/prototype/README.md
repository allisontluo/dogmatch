# Pawfect Match — restructured prototype

A separate, working proposal at https://allisontluo.github.io/dogmatch/prototype/. The main website is unchanged.

## New structure

- **Welcome:** a fullscreen introduction with six named dog portraits and Start matching.
- **Questionnaire:** one question at a time, four clickable chapters, blank first-run answers, readable hours/minutes, and a conditional care-plan question. Activity and hours away use sliders; training and care support use dropdowns.
- **Review:** all answers grouped by chapter. Edit any answer directly and return to review.
- **Your dogs:** Recommended (six initial choices), Favorites, and the complete 52-type Browse catalog; immediate name/type search and profile dialogs. Scores appear only after completing the questionnaire.
- **Discover:** adaptive rounds of up to ten dogs, swipe or Like/Pass buttons, keyboard arrows, Undo, coat preference, and a fresh round that preserves favorites.
- **Compare:** up to three dogs side by side; drag handles and earlier/later buttons; fit differences and dog-type needs; an activity experiment that changes saved answers only when applied.
- **Top pick:** confirmation, a large photo and optional confetti; the choice remains changeable.
- **Accessibility:** saved text sizing (85–150%), light/dark mode, reduced animation, keyboard controls, visible focus and native dialogs.

## Implementation

Static HTML, CSS and JavaScript. `index.html` loads `experience.css`, `experience.js`, and `questions.mjs`. It reuses `../engine.mjs`, `../profiles.mjs`, `../comparison-tools.mjs`, and existing dog photographs. Earlier prototype files remain in the repository but are not loaded.

State uses `pawfect-prototype-v2`; appearance uses `pawfect-prototype-v2-preferences`. Reset affects this prototype only. The main site's state and earlier prototype storage are separate.

```sh
python3 -m http.server 8093 --directory public
# Open http://localhost:8093/prototype/
node --test tests/*.test.mjs
```

Serve over HTTP; ES modules do not support opening this directly as a file URL. There is no account or backend.

## Design and validation

Taste direction: **Editorial greeting**, seed **2035120197**, no redraws. Retains the blue/white palette, Times New Roman, named dog profiles, and existing photo credits. Uses a labelled sidebar, an open canvas and a 1100px twelve-column grid instead of the main site's long page and adjacent recommendation panel.

Validated with 18 passing tests, a clean JavaScript syntax check, and Taste source lint with 0 failures / 0 warnings. Browser checks cover desktop 1440×900, tablet 768×1024, phone 390×844, and enlarged text/dark mode. The standalone Taste browser inspector was not run; supported browser tooling was used for screenshot and DOM checks instead.

Most dog identities are existing examples, not adoption listings. Winnie, Link, Mit and Monty carry owner-confirmed details; unknown owner details remain unknown. Matching percentages are simplified dog-type estimates, not an adoption suitability assessment. No new dog facts, outside photos or third-party packages were introduced.
