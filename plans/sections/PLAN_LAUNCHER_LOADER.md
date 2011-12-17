Plan: Launcher Section
========
##Collin Hover, Graduate Thesis: Kaiopua

####Plan Version
1.0.09.15.2011

####Section Description
Launcher section of website will be a simple screen where the user is presented with a basic HTML title, links to source code and sharing (Facebook, Twitter, etc), a re-usable / background asset loader, and the start menu.

##Basics
####Summary
* Total load time of section low as possible.
* First ranked in terms of smallest total file size relative to all game sections.
* Composed of only essential starting files:
    * HTML page
    * CSS
    * Core libraries (i.e. jQuery, Signals, Three)
    * Core game scripts (i.e. Main, Game, Shared, LauncherSection)
    * Launcher section models and textures
* Builds a simple, interactive 3D scene to entertain user.
* Begins game's loader to load all game assets immediately.

####Launcher
* Shows user an interactive start menu while loading.
* Main scene is visual translation of game name: Kaiopua, Clouds over the Ocean.
    * Clouds
    * Sea or ocean waves
    * Light rays coming through waves
* Player looks at center of ocean to see both above (clouds) and under (light rays)
* Allow player to move mouse around to shift view slightly

####Loader
* When in launcher section, show user loading bar by filling up an empty horizontal box.
* Loading sectioned into 2 parts similar to Blizzard's Game Launcher:
    * Setup: game unavailable, core files loading (gameplay scripts, intro and tutorial models and textures, player models, textures, and animations / morph targets)
    * Playable: intro and tutorial available, secondary files loading (game world terrain and environment models, textures, and animations / morph targets)
    * Complete: full game available, post-intro & tutorial files loaded
* Loader works in background even after player transitions away from Launcher Section.
* Show loading visual in corner of screen to inform player of loading assets.
* If player is in Intro or Tutorial section and wishes to transition to full game, pause game, dim screen, and pop up loading bar.
* Allow player to continue into full game once Loading reaches complete.
* Ideally, player spends enought time in Intro and Tutorial sections to allow loading of main game to finish before player needs to move on.