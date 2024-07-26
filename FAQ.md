# Notoner FAQs

<div align="center"><p><img src="markdown/logo-outline.png"></p></div>

---

## Intro

I'm well aware that tons of programs and platforms allow you to play board games digitally and Notoner may be _yet another one of them_.

During my spare time, I usually like to work on projects built around a narrow set of features based on my personal needs and my spare time availability. Then, I love to share it with others who may have the same need - or want to see how I've implemented it.

Notoner makes no difference, so if you've fiddled with Notoner and asked yourself why it misses a feature or acts weird, it may be done on purpose and I'm collecting these decisions here. Anyway, this is here to _document_ these decisions and aren't a set of stoppers or rules: feel free to suggest improvements or ask more questions!

### File management

**Q: Why does file saving and loading act weird?**

A: File API on browsers aren't the same, so sometimes it is possible to directly open and overwrite a file on your device as regular software and sometimes it's just possible to load a file or save a new file. Notoner attempts to act as regular software when possible... or it switches to just load/save new mode when it can't.

### Elements
    
**Q: Why I can't add any number of sheets?**

A: Notoner works on your browser and doesn't send anything of your table to a server. That means loading and saving happen on your device but are limited by your browser features. Sadly, loading and saving big chunks of data may take some time so I preferred to limit the writable sheet amount to keep it as responsive as possible. Anyway, this limit doesn't apply if you create your own save file or table template so feel free to experiment!

### Macros

**Q: Why are you not using a scripting language for macros?**

A: As Notoner is a tool to _help_ you play some print-and-play games, macros have been added to make little interactions easy and not to implement a full board game. Based on this requirement, I've built a simple macro engine that fits this requirement, using the JSON structure that was already in place to store the macro instructions.

**Q: But the Klondike game...**

A: The Notoner base template library is mostly _a way to test and document how Notoner works_. I've used the Klondike game to test macros' flexibility and set their boundaries and that's why it's a little more _videogamey_ than the others.

### Browsers

**Q: What about iOS?**

A: Ugh, _Safari Mobile._ There are some hacks in place (menu button placement on fullscreen, disabled scaling, fixed position to UI elements, popup menu initial scroll position, disabled magnifying glass) but it should work quite fine. I suggest you add Notoner to the Home Screen and launch it from there to avoid some annoyances, such as the "It looks like you are typing while in fullscreen" dialog when playing in full screen.

**Q: What about Firefox?**

A: For some reason I've got better performance on Firefox. Sadly, there still are some hacks in place (digital pen detection, preventDefault slowdowns, SVG sprite coordinates correction).

### Design

**Q: Why there is a counter element?**

A: It has been a _hard choice_. Counters as a concept are a key element in board games, which have been implemented by board game designers in many physical ways: a token moving on a numbered track, tokens collected in an area, boxes with numbers to scribble, rows of squares to tick, etc. Notoner pushes on element manipulation and can implement most of these techniques... but, on a digital device, the most straightforward way to keep a counter is probably... using a counter. Moreover, some board games use cardboard spin counters (the one with some wheels pinned to a plate with tiny windows) so I've decided to implement it anyway, so you can choose whether to use them.
