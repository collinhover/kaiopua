Project Plan
============
##Collin Hover, Graduate Thesis: Kaiopua

####Plan Version
4.0.08.30.2011

####Project
MFA Graduate Thesis in epistemic gaming based visual communication and learning

####Working Name
Kaiopua

####Game Summary
Science fiction builder puzzle game, in which the player assumes the role of a simple boy named Kai. Kai is stranded on a moon sized worm-like creature named Opua, who is broken and needs help to restore power to his life systems. The game will be accessible and playable via website, and will not require any third party plug-ins or software beyond the web browser of player’s choice.

Level plans: [Level 1](https://github.com/collinhover/kaiopua/blob/master/src/plans/PLAN_LEVEL_001.md) - [Level 2](https://github.com/collinhover/kaiopua/blob/master/src/plans/PLAN_LEVEL_002.md) - [Level 3](https://github.com/collinhover/kaiopua/blob/master/src/plans/PLAN_LEVEL_003.md) - [Level 4](https://github.com/collinhover/kaiopua/blob/master/src/plans/PLAN_LEVEL_004.md)

![visual_style_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_visual_style_001.jpg "Opua")

####Setting
The game takes place on a moon sized worm-like creature named Opua, which begins as a newborn or seedling. Opua is a giant white worm, split into a face with two eyes, a mouth, and a blowhole, and a stubby tail at the back. Between the face and tail are the individual levels of the game in the form of rings, containing all the puzzles and majority of the gameplay. The player may be gated or hindered from accessing some rings at any time during the game. The head serves three purposes: (a) it is the starting point of the game, (b) it may speak to the player to provide story or hints, and (c) it is the where a player may feed Opua combinable objects that have been found while exploring.

![world_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_world_001.jpg "Opua")

####Plot
Kai, a simple boy with a rice farmer’s pack basket on his pack, finds himself in a small cave with no way out but up. After exploring, Kai realizes that the hole in the roof is too high up for him to jump to, so he must find another way to solve the puzzle. The only things in the room are a massive ooze plugging a hole in the floor, a large cinnamon bun, and a small flaming splinter stuck in the wall. Taking the cinnamon bun, Kai gets his first ability object, ‘Feed Bun’, which gives him the ability to feed something a cinnamon bun. If fed to the flaming splinter, his ‘Feed Bun’ turns into a ‘Flaming Bun’, which can be thrown at things to set them on fire. Once Kai sets the ooze on fire, the entire cave starts to shake and Kai is shot out of the top of the cave by a massive geyser. Landing on the wrong side of his face, Kai is surprised to find himself standing on the giant sleeping face of a moon sized worm. Woken by the sudden explosion, the creature is also surprised to find Kai standing on its face, but that surprise quickly turns to sadness. As the creature begins to talk, Kai realizes that the creature’s language is very similar to whale sounds, and that he keeps hearing the word ‘Opua’. Kai decides that he will call this creature Opua, and that he will find out what is making Opua so sad.

![character_003](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_character_003.jpg "Characters")

####Gameplay
The gameplay of Kaiopua consists of a third-person journey through a growing moon sized worm called Opua. The player can explore by pressing and holding the WASD or arrow keys to move, while using the mouse to select and interact with objects. Players begin their journey in the blowhole of Opua, a small cave structure that later serves as a fast travel system throughout the game. At this starting location, players will find a basic puzzle that serves as a tutorial on movement, turning, looking, interacting with objects, and solving problems.

To complete the game, players must explore Opua’s surface, collect objects, solve puzzles, fix Opua’s power sources, and battle creatures. Player’s overall objective is to fix the worm, and to do so they must fix each of the rings between its head and tail. To fix each ring, the player will need to restore its power source by finding specific ‘ability’ objects located in that ring. Ability objects serve several purposes in the game: (a) they grant the player an ability to use in solving puzzles, and (b) they are used to restore a ring’s power source. As the power is restored in a ring, it will begin to rotate faster. As each of the rings gets fixed and begins to rotate faster, Opua becomes happier, grows whale fins, grows a tail, and finally is able to use his fins and tail to fly through space.

To solve puzzles, players will need to use ability objects to activate and change the environment in order to release or access further ability objects. Each ability object will exist in the game from the beginning, but only one will be accessible to the player initially on each ring. The player will begin each ring by solving an exploration puzzle, which will require no abilities, to find the first ability object. Then the player will solve puzzles by using and finding further ability objects. The power source itself is always unreachable by a player until they’ve found the final ability object on a ring. Once the player reaches the power source, they will only need to activate it to restore power and complete the ring.

While solving puzzles, players may unlock ‘collectible’ or ‘combine’ objects instead of ability or key objects. Combine objects serve no direct purpose in solving puzzles or restoring parts, but instead allow the player to feed combine objects to Opua three at a time to receive a buff. These buffs enhance a player’s basic movement / abilities as well as visually modifying the character, and are intended to reward the player for exploration and travel.

The player is given very little background before starting. At the beginning of the game no obvious goals or objectives are laid out, which means that players must simply begin to explore Opua. As the player quickly discovers, there is no time within which the player must complete the game, and so the game unfolds at the player’s pace and is solved through a combination of observation, experimentation, creativity, and logical thinking.

##Game Details
####Setting
*   Giant space worm made of face, tail, and variable number of rings.
*   Face and tail are pre-modeled/animated
*   Rings are made of generated grid + pre-modeled/animated objects.
*   Fast travel through worm’s blowhole
*   Player solves puzzles and collects objects in a cycle

![world_002](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_world_002.jpg "Opua")

####Player
*   Simple boy with a rice farmer’s pack basket on back (inventory)
*   All white body, with two black eyes (near top of head) and black mouth
*   Large head, long arms (almost to ground), short legs
*   All units in game based on player character, which has bounds of 1 W x 2 H x 1 D
*   Head = 1 W/H/D, body = 0.8 W, 1 H, 0.5 D

![character_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_character_001.jpg "Kai Front")
![character_002](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_character_002.jpg "Kai Side")

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

![world_003](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_world_003.jpg "Levels")
![environment_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_environment_001.jpg "Environment")

####Overall Objective
*   Fix the worm
*   Fix each ring
*   For each ring, restore power
*   Use ability objects to get to power source and restore it
*   Once a ring is restored, it grows a pair of fins (and/or begins to spin?)
*   As worm gets fixed, major parts grow (like fins and tail propellor) and start to work

![puzzle_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_puzzles_001.jpg "Power Source")

####Object Types
*   Ability objects solve puzzles
*   Combine objects fed to worm and give buffs
*   All object types are found through solving puzzles

####Puzzles
*   1 puzzle per ability object per ring
*   variable # of ability objects and combine objects
*   All puzzles are simple individually: use the right ability object to solve
*   Puzzles work in sequence, i.e. solve one to access the next

####Ability Objects
*   Ability objects each have a function and use in game
*   To solve puzzles, use the right ability object at the right place
*   Ex1: Use gravity pull to cause lava flow to redirect and allow passage
*   Ex2: Use gravity push to place stones in lava pool to allow passage
*   Ex3: Use vortex to pull player across large gaps to reach power source

####Combine Objects
*   Certain objects are collectable
*   These objects don’t solve puzzles
*   Player can feed 3 of these objects to Opua at a time to receive a buff
*   Buffs change character appearance
*   These function as an alternative objective and reward system in the game

![upgrades_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_upgrades_001.jpg "Upgrades")
![upgrades_002](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_upgrades_002.jpg "Upgrades")
![upgrades_003](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_upgrades_003.jpg "Upgrades")

####User Interface
The gameplay will take place from a 3D perspective and exploration view. In the 3D perspective and exploration view, players will see the world in 3D from a third person / over the shoulder viewpoint with minimal or no GUI interaction. In this mode, players can explore the world physically, interact with the objects, feed Opua, battle creatures, and most importantly solve puzzles.  
  
Once the game starts, the player gains the ability to examine any object they are currently holding. This examination creates a radial context menu based on the object being examined, which shows simple icon flowchart for the current object and what sort of abilities it has. Key objects always show the ability to restore a part. Combine objects show only an icon for the area of the character’s body that they will visually modify. Ability objects show icons for each possible function they may be used for in puzzle solving.

![ui_001](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_ui_001.jpg "UI")
![ui_002](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_ui_002.jpg "UI")

##Game Mechanics
####Basics
*   Game style: Puzzle / Builder
*   Perspective: Third-person
*   Visuals:
    * Low-poly models with textures doing a lot of the heavy lifting.
    * Visuals will be playful and vibrant, and should attempt to stay away from the brown/dead feel of games attempting realism. 
    * Visuals should draw from influences such as ROME (ro.me), Legend of Zelda: The Wind Waker, Legend of Zelda: Phantom Hourglass, Super Paper Mario, and Okami.
    * Expected to include: multiple lights, normal mapping, cel-shading, depth of field (dof).
    * And as performance allows and aesthetic direction suggests, may additionally include: ambient occlusion (ao, if not handled by textures), texture filters, vertex colors / shading, displacement mapping.
*   Difficulty: Mid range, allow for reasonable failure and don’t punish player by adding time wasters such as long runs, grind based goals (i.e. repetitive and dull tasks), and overpriced progression.
*   Pace: Do not artificially extend the time players spend in game. The game pace should be constant and exciting, but not pushy (i.e. no count-down timers) or irritating (i.e. player should not fail because of a random number generator).
*   Resolution: Dynamic based on frames per second (fps) achieved by player computer. If player can meet or exceed 20 fps, the game will be rendered at the full size of the browser window. If player drops below this, game will be rendered at a reduced size and scaled up to match browser window, resulting in pixellated visuals.
*   Frames per second: Default and maximum is 60, with minimum at 20. Below min, warn player and reduce quality.
*   Configurable Options: Low or no priority for allowing player to changeoptions for resolution, difficulty, and keybindings.

####Features
*   Movement: (Max priority) Players will be able to move in space (using WASD / arrows keys). Preferred additions include jumping (space bar). All modes of movement may be augmented by abilities.
*   Abilities: (Max priority) Player will find objects that may be used as tools to perform certain abilities in game.
*   Task / Quest Log: Not planned for implementation.
*   Inventory: Objects collected by player will be organized by type in an easy to use interface.
*   Equipment: Not planned for implementation.
*   Character Customization: (Min priority) Player will find objects that may modify his/her character’s appearance in game.
*   Leveling Up / Stats: Not planned for implementation.
*   Achievements: (Min priority) If time permits, limited social media based achievements may be implemented.
*   HUD  (High priority): Heads up display (HUD) will be minimal by default, with most information derived from visual based queues instead, but exceptions will be made:
    * Lifebar will be shown
    * Ability Objects as list (scrollable / selectable)
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

![visual_style_003](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_visual_style_003.jpg "Visual Style")
![visual_style_004](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_visual_style_004.jpg "Visual Style")
![visual_style_005](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_visual_style_005.jpg "Visual Style")
![visual_style_002](https://github.com/collinhover/kaiopua/raw/master/src/concepts/kaiopua_sketch_visual_style_002.jpg "Visual Style")
