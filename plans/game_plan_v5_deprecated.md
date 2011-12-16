Game Plan
============
##Collin Hover, Graduate Thesis: Kaiopua

####Plan Version
5.0.09.27.2011

####Project
MFA Graduate Thesis in epistemic gaming based visual communication and learning

####Working Name
Kaiopua

####Game Summary
Science fiction puzzle game, in which the player assumes the role of a simple boy named Iki. Iki is stranded on a moon sized worm-like creature named Kaiopua, who is broken and needs help to restore power to his life systems. The game will be accessible and playable via website, and will not require any third party plug-ins or software beyond the web browser of player’s choice.

![visual_style_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_visual_style_001.jpg "Game Visual Style")

####Core Goal
The core goal of the project is to teach players how to solve communication and design problems efficiently. Communication efficiency is one of those core values of professional web design, where a web designer uses the smallest number of resources in the most efficient way to add as much to a user's experience as possible. For the full core goal description, see [Main README](https://github.com/collinhover/kaiopua).

####Core Mechanic
The game's core mechanic is the ability to change the size or scale of the player's environment. This includes everything in the game, from scaling the entire world to resizing individual parts of a plant. This is like a combination of a shrink ray and a giant growth potion, and works as follows:

*   May be used on any visible surface in the game.
*   Player only has a limited amount of scaling energy.
    * Enough to allow player to resize several objects
    * Not enough to let player warp or destroy entire world (i.e. break game)
*   The player may use the ability in two basic point and shoot methods:
    * A. Shrink light (make things smaller >> lighter weight, less affected by gravity)
    * B. Grow light (make things bigger >> heavier weight, more affected by gravity)
*   Anything that light types A & B touch will change scale.
*   Anything scaled will keep the energy used and stay at that scale until the player takes the energy back.
*   By default a player scales individual faces of the game's objects.
*   If a player tries to scale the whole world, they will scale themselves, making the world seem to change scale.
*   Players can also scale entire objects or sets of objects at once using a third method:
    * C. Lasso light
    * Point and shoot once to select (lasso) an object.
    * Point and shoot again to deselect an object.
    * All objects selected get scaled at the same rate.
    * Uses energy based on amount of objects scaled.
*   The ability takes the form of a bottle of sunshine that shoots beams of light.

####Setting
The game takes place on a moon sized worm-like creature named Kaiopua. The name Kai’Opua comes from Hawaiian culture, known as the opua or pink cumulus cloud formations that hang low over ‘kai’, the ocean. These clouds are regarded as omens of good fortune and good weather. Kaiopua is a giant white worm, split into a face with two eyes, a mouth, and a small farmer's shack (like a horn), and a stubby tail at the back. Between the face and tail are the individual levels of the game in the form of rings, containing all the puzzles and majority of the gameplay. The player may be gated or hindered from accessing some rings at any time during the game, and it may be that only 1 ring shows up at a time. The head serves three purposes: (a) it is the starting point of the game, (b) it may speak to the player to provide story or hints, and (c) it is the where a player may feed combinable objects that have been found while exploring.

####Level Plans
[Launcher & Loader](https://github.com/collinhover/kaiopua/blob/master/plans/levels/PLAN_LAUNCHER_LOADER.md)  
[Intro & Tutorial](https://github.com/collinhover/kaiopua/blob/master/plans/levels/PLAN_INTRO_TUTORIAL.md)  
[Level 1](https://github.com/collinhover/kaiopua/blob/master/plans/levels/PLAN_LEVEL_001.md)  

![world_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_world_001.jpg "Game World")

####Plot
Iki, a simple boy with a big head, wakes from dreams of clouds over the ocean and rolls out of his tiny cot into his hawaiian farmer's hut. After a great warrior's yawn, Iki grabs his pack basket, throws it on his back, picks up  a strange bottle with a miniature sun bobbing around in it, and heads out the door. As he walks down the steps from his hut, Iki uncorks the bottle and pours some of the escaping light onto a plant, which causes it to grow enormously! Hearing something strange, Iki looks around and spots an giant feral pig rooting around near the house. Thinking quickly, Iki points the bottle of sunshine at the pig and zaps it down into a knee high piglet, which he gives a friendly pat.

Suddenly, a huge roar of "HIIIIIIIIIIII!" explodes from every direction, and Iki calls back a friendly greeting to the moon sized worm named Kaiopua on whose face he lives. Running down to talk to Kaiopua, Iki learns that something strange has been going on in the rings that is making Kaiopua feel sick, and so he sets off to find out about the disturbances.

####Gameplay
The gameplay of Kaiopua consists of a third-person journey through a moon sized worm called Kaiopua. The player can explore by pressing and holding the WASD or arrow keys to move, while using the mouse to select and interact with objects. Players begin their journey on the face of Kaiopua, and quickly transition into the first ring. Players will learn immediately about the core mechanic of the game, and find out about movement, turning, looking, interacting with objects, and solving problems shortly after.

To complete the game, players must explore Kaiopua’s surface, solve puzzles, and battle creatures. Player’s overall objective is to find out about the disturbances and fix the worm's rings. To fix each ring, the player will need to restore its power sources by finding and activating them. As each of the rings gets fixed, Kaiopua becomes happier and happiers until finally he is able to fly through space.

To solve puzzles, players will need to use the core mechanic of shrinking and growing objects to activate and change the environment in order to continue along their path. Each power source in a ring will always be unreachable by a player until they’ve found the right way to change the environment or themselves to get to it. Once the player reaches the power source, they will only need to activate it to restore power, and once all power sources on a ring are restored, the player completes the ring.

While solving puzzles, players may unlock ‘collectible’ or ‘combine’ objects. Combine objects serve no direct purpose in solving puzzles or restoring parts, but instead allow the player to feed combine objects to the world three at a time to receive a buff. These buffs enhance a player’s basic movement / abilities as well as visually modifying the character, and are intended to reward the player for exploration and travel.

The player is given very little background before starting. At the beginning of the game only a single goal of exploring for the source of the disturbances is laid out. As the player quickly discovers, there is no time within which the player must complete the game, and so the game unfolds at the player’s pace and is solved through a combination of observation, experimentation, creativity, and logical thinking.

##Game Details
####Setting
*   Giant space worm made of face, tail, and variable number of rings.
*   Face and tail are pre-modeled/animated
*   Rings are made of generated grid + pre-modeled/animated objects.
*   Player solves puzzles and collects objects in a cycle

![world_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_world_002.jpg "World")
![house_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_house_001.jpg "Character House")
![house_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_house_002.jpg "Character House")
![walls_rocks_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_walls_rocks_001.jpg "Walls and Rocks")
![plants_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_plants_001.jpg "Plants")

####Player
*   Simple boy with a farmer’s pack basket and a bottle of sunshine
*   All white body, with two black eyes (near top of head) and black mouth
*   Large head, long arms (almost to ground), short legs
*   All units in game based on player character, which has bounds of 1 W x 2 H x 1 D
*   Head = 1 W/H/D, body = 0.8 W, 1 H, 0.5 D

![character_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_001.jpg "Character Front")
![character_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_002.jpg "Character Side")
![character_003](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_animation_001.jpg "Character Animation")
![character_004](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_animation_002.jpg "Character Animation")
![character_005](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_faces_001.jpg "Character Faces")
![character_006](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_lantern_001.jpg "Character Lantern")

####Levels
*   Cylinder / ring shape, gravity at center
*   Player walks along outside
*   Constructed by a grid of 1 x 1 unit squares
*   Radius of rings = 16 units (8 player characters stacked head to toe from center)
*   Width of rings = 20 units
*   Circumference of rings = 100 units
*   Surface area of each ring is about 2010 units
*   Each grid square can contain an object, and some objects may span multiple squares
*   Angle change = (1 / ring radius) x (180 degrees / PI)
*   Angle change from one square (around ring) to next/prev square = 3.58 degrees
*   Total Angle change for objects that cross multiple squares:
*   (# of squares - 1) x base angle change per square

![world_003](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_world_003.jpg "Levels")
![environment_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_environment_001.jpg "Environment")
![creatures_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_creatures_001.jpg "Creatures")
![creatures_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_creatures_002.jpg "Creatures")
![environment_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_geography_001.jpg "Environment")

####Overall Objective
*   Fix the worm
*   Fix each ring
*   For each ring, restore power
*   As worm gets fixed, worm gets happier

![puzzle_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_puzzles_001.jpg "Power Source")

####Puzzles
*   All puzzles are simple individually: change the right parts of the environment or player
*   Puzzles work in sequence, i.e. solve one to access the next

![puzzle_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_puzzle_shaka_001.jpg "Puzzle: Shaka")
![puzzle_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_puzzle_tiki_001.jpg "Puzzle: Tiki")

####Combine Objects
*   Certain objects are collectable
*   These objects don’t solve puzzles
*   Player can feed 3 of these objects to world at a time to receive a buff
*   Buffs change character appearance
*   These function as an alternative objective and reward system in the game

![upgrades_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_upgrades_001.jpg "Upgrades")
![upgrades_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_upgrades_002.jpg "Upgrades")
![upgrades_003](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_upgrades_003.jpg "Upgrades")

####User Interface
The gameplay will take place from a 3D perspective and exploration view. In the 3D perspective and exploration view, players will see the world in 3D from a third person / over the shoulder viewpoint with minimal or no GUI interaction. In this mode, players can explore the world physically, interact with the objects, feed the world, battle creatures, and most importantly solve puzzles.  
  
Additionally, player may have a 2D map view to see pathways and locations of power sources.

![ui_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_ui_001.jpg "UI")
![ui_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_ui_002.jpg "UI")

##Game Mechanics
####Basics
*   Game style: Puzzle
*   Perspective: Third-person
*   Visuals:
    * Low-poly models with textures doing a lot of the heavy lifting.
    * Visuals will be playful and vibrant, and should attempt to stay away from the brown/dead feel of games attempting realism. 
    * Visuals should draw from influences such as ROME (ro.me), Legend of Zelda: The Wind Waker, Super Paper Mario, and Okami.
    * As performance allows and aesthetic direction suggests, may additionally include: cel-shading, depth of field (dof), ambient occlusion (ao, if not handled by textures), vertex colors / shading, displacement mapping.
*   Difficulty: Mid range, allow for reasonable failure and don’t punish player by adding time wasters such as long runs, grind based goals (i.e. repetitive and dull tasks), and overpriced progression.
*   Pace: Do not artificially extend the time players spend in game. The game pace should be constant and exciting, but not pushy (i.e. no count-down timers) or irritating (i.e. player should not fail because of a random number generator).
*   Resolution: Dynamic based on frames per second (fps) achieved by player computer. If player can meet or exceed 20 fps, the game will be rendered at the full size of the browser window. If player drops below this, game will be rendered at a reduced size and scaled up to match browser window, resulting in pixellated visuals.
*   Frames per second: Default and maximum is 60, with minimum at 20. Below min, warn player and reduce quality.
*   Configurable Options: Low or no priority for allowing player to change options for resolution, difficulty, and keybindings.

####Features
*   Movement: (Max priority) Players will be able to move in space (using WASD / arrows keys). Preferred additions include jumping (space bar). All modes of movement may be augmented by abilities.
*   Abilities: (Max priority) Player will find objects that may be used as tools to perform certain abilities in game.
*   Task / Quest Log: Not planned for implementation.
*   Inventory: Not planned for implementation.
*   Equipment: Not planned for implementation.
*   Character Customization: (Min priority) Player will find objects that may modify his/her character’s appearance in game.
*   Leveling Up / Stats: Not planned for implementation.
*   Achievements: (Min priority) If time permits, limited social media based achievements may be implemented.
*   HUD  (High priority): Heads up display (HUD) will be minimal by default, with most information derived from visual based queues instead, but exceptions will be made:
    * Lifebar will be shown
    * Energy bar will be shown
    * Abilities as list (scrollable / selectable)
    * Options / Menu buttons (pause on use)
*   Life and Death: (High priority) The player will be able to die in game but will never get a game over. Instead, upon dieing the player will be spit out of the world’s mouth.
*   Saving: May be added if time permits.
*   Loading: May be added if time permits.

####Progression
*   Physical Combat: Physical combat will be a part of the game in a simple format similar to Mario, Zelda, or Megaman.
*   Puzzle Solving: Mental or thought based situations will be the primary progression method, and will require the player to think creatively to solve a single complex design problem by solving increasingly advanced smaller problems.
*   Building: Puzzles may be solved through the combination and use of objects to build solutions.

####NPC Interaction	
*   Presence: There will likely be minimal non-player characters (NPCs) aside from the organism itself, as their presence may not be necessary for players to progress and complete the game.
*   Dialogue: (Medium Priority) Minor dialogue and voice acting may be added if time permits.

##Visual Style

The following are examples of the visual style of the game.

![character_003](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_character_003.jpg "Characters")
![visual_style_003](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_visual_style_003.jpg "Visual Style")
![visual_style_004](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_visual_style_004.jpg "Visual Style")
![visual_style_005](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_visual_style_005.jpg "Visual Style")
![visual_style_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_visual_style_002.jpg "Visual Style")
