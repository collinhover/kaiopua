Game Plan
========
###Collin Hover, Graduate Thesis: Kaiopua

####Plan Version
6.0.12.16.2011

####Project
MFA Graduate Thesis in gaming-based visual communication and learning

####Working Name
Kaiopua
  
####Summary
This is a video game that has the player adopt the identity of a pacific islander, lost at sea, who finds a home aboard the most unexpected of creatures by learning the ways of taro farming.

##Game Overview
The player, a young boy lost at sea in his canoe, is found by a dying whale and offered a deal: they may live happily on the whale, but in return must cultivate plant life on the whale's surface to return the whale to health. Players live through a series of days, where each day they are given a supply of plants which can be used to heal a neglected area, or field, on the whale's surface.

####Its like Tetris, but...
Instead the goal is to use the modular pieces (plants) to fill the entire grid-based space of a field, and eventually all the fields on the whale's surface, using as few pieces as possible.

####Goals
*   Make the whale strong and healthy by creating a living environment on its surface
*   Design a living environment by planning and planting as many of the available fields as possible
*   Create a home for the character to live in
*   Collect all the companion animals

####Gameplay
The gameplay of Kaiopua consists of a third-person journey of healing a creature called Kai 'Opua. The player can explore by pressing and holding the WASD or arrow keys to move, while using the mouse to select and interact with objects. Players begin their journey lost at sea, and are found (or find) the whale after a very short period of exploring the ocean. Players will learn immediately about the core mechanic of the game, and find out about movement, turning, looking, interacting with objects, and solving problems shortly after.

![gameplay_mapping](https://github.com/collinhover/kaiopua/raw/master/plans/gameplay_mapping.png "Gameplay Mapping")

####Setting and Structure
The game takes place on a moon sized whale-like creature named Kai 'Opua. The name Kai 'Opua comes from Hawaiian culture, known as the 'Opua or pink cumulus cloud formations that hang low over 'Kai', the ocean. These clouds are regarded as omens of good fortune and good weather.  
    
*   The whale is a roughly spherical creature around which the player can walk, much like a small planet
*   The whale has two eyes, a mouth, fins, and a tail
*   The whale has a thermometer in its mouth to show how healthy it is
*   The whale also has other environment objects to make it appear more like an island, such as a volcano, palm trees, hills, etc
*   The surface of the whale is divided into a series of connected(touching) modular fields

![visual_style_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_visual_style_001.jpg "Game Visual Style")

####Section Plans
See the following for specifics about sections of the game:
[Launcher & Loader](https://github.com/collinhover/kaiopua/blob/master/plans/sections/PLAN_LAUNCHER_LOADER.md) - 
[Intro & Tutorial](https://github.com/collinhover/kaiopua/blob/master/plans/sections/PLAN_INTRO_TUTORIAL.md)

####Player
*   Simple boy with a lantern
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

##Game Design Details

####Daily Planting Puzzles
*   The player begins each day with the choice of completing any field touching a field already completed
*   The player also begins each day with a new supply of plant seeds
*   The player must use that day's limited seed supply to fill the field(s)
*   A player can place and dig up plants as many times as necessary
*   However, once a field is completed, it cannot be modified
*   Each day has a limited amount of time, where the player begins at sunrise and must complete at least 1 field by sundown

![environment_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_geography_001.jpg "Environment")

####Modular Fields
*   Each field is constructed by a modular grid of square units
*   Only a single field, the beginning field, is a square grid
*   All fields beyond the beginning field are organic in shape
*   A basic field may occupy space along 2 dimensions, i.e. it lies only along the surface
*   An advanced field may occupy space along 3 dimensions, i.e. it lies along the surface as well as occupying space away from the surface
*   Fields may include grid units that cannot be planted on or only allow certain plants

![walls_rocks_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_walls_rocks_001.jpg "Walls and Rocks")

####Success and Failure
*   Succeeding at completing a field, activates a power source within that field
*   The power source gives rewards, one of which is a new plant, and feeding it to the whale causes the whale's health to improve
*   As the whale's health improves, its skin color shifts towards a healthy grey/blue, it smiles, the clouds get brighter, and the waves around become calm
*   If the player cannot complete a field within the time of any day, the whale's health declines and the opposite effects of improving health occur
*   The most obvious indicator of success and failure is the whale's thermometer, which fills as the whale gets healthier

####Day Cycle
*   Sunrise to sundown takes 20 minutes of player time (may change after testing)
*   The time of day is marked by the sun's position in the sky
*   Sunrise is marked by the sound of a rooster, while sundown is marked by the sound of a wolf
*   A player may play through the night to catch up if they failed the day time
*   A player may go to sleep at their house (or what is built of it) to fast forward to the beginning of the next day
*   Any seeds remaining at the end of the day are placed into a seed bank

![sun_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_sun_001.jpg "Sunshine")

####Seed Bank
*   The seed bank serves to reward players that solve fields efficiently
*   Remaining seeds roll over to following days (with some exceptions), which the player can draw from at any time
*   The seed bank keeps roll over seeds separate from daily seeds until the player withdraws, to allow players to easily see the scope of that day's supply

####Plants of Varied Shape
*   Each plant occupies space in terms of the field grid units
*   Players begin with seeds, which grow instantly into plants when added to a field
*   Basic plants occupy only a single space
*   Intermediate plants occupy multiple connected spaces (ex: a box of four spaces, or a line of four spaces)
*   Advanced plants occupy multiple disconnected spaces (ex: a diagonal line of three spaces)
*   Specialty plants unlock spaces or give special properties to other plants (ex: use a fire plant to melt a frozen area of spaces for other plants)
*   Players get a preview of the space occupied by any plant by selecting a seed and hovering over field spaces

![plants_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_plants_001.jpg "Plants")
![environment_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_environment_001.jpg "Environment")

####Pathways
*   Pathways are made by a special type of seed that does not roll over each day
*   Pathways are the only planted thing that a player can walk on/through, and are key to allowing the player to access other fields

####Rewards
*   Three rewards are given for completing a field: a new plant, a piece of the player's home, and a companion animal
*   New plants should be fed to the whale, which heals the whale and gives the players that plant's seed starting the following day
*   All rewards are given by the power source on the end of each of its tongues

![puzzle_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_puzzles_001.jpg "Power Source")

####Player House
*   A player gathers parts by completing fields
*   Players may customize parts to change color
*   Players may receive multiple modular parts that fulfill the same purpose, such as a banana leaf door and a wooden door
*   Players may add to and swap parts from their house at any time

![house_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_house_001.jpg "Character House")
![house_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_house_002.jpg "Character House")

####Companion animals
*   Companion animals follow the player and act as vanity items (visual modifiers to the character or game's appearance)
*   A player may have one companion animal present at a time

![creatures_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_creatures_001.jpg "Creatures")
![creatures_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_creatures_002.jpg "Creatures")

####User Interface
The gameplay will take place from a 3D perspective and exploration view. In the 3D perspective and exploration view, players will see the world in 3D from a third person / over the shoulder viewpoint with minimal or no GUI interaction. In this mode, players can explore the world physically, interact with the objects, feed the world, battle creatures, and most importantly solve puzzles.  
  
Additionally, player may have a 2D map view to see pathways and locations of power sources.

![ui_001](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_ui_001.jpg "UI")
![ui_002](https://github.com/collinhover/kaiopua/raw/master/plans/concepts/kaiopua_sketch_ui_002.jpg "UI")

##Concepts Taught

####Modular / object oriented thinking
The player has to activate all available spaces in a grid using modular objects, and must understand how these modules fit together.

####Efficient problem solving
Players are rewarded for designing solutions using as few resources as possible.

####Layout concept: Grid
Players must learn to control space in a grid based layout.

####Layout concept: Spacing
Players must learn to understand spacing between, around, and created by individual parts of a grid.

####Layout concept: Order vs Chaos
Players must learn to make decisions that create order (as opposed to chaos) in order to satisfy the needs of the problem.

####Design concept: Planning Ahead
Players will need to plan ahead beyond their current problem to ensure each solution does not disable future possibilities.

####Design concept: Visualization of Parts vs Whole
Players must understand how all the individual elements work together as a whole to satisfy the requirements of the problem.

####Asynchronous vs synchronous thinking
Players can use any module, or plant, at any time in an asynchronous manner, while the overall surface of the planet is solved largely in a linear or synchronous manner, where any given field must be completed before moving to another.

##Game Mechanics
####Technical
*   Game style: Puzzle
*   Perspective: Third-person
*   Visuals:
    * Low-poly models with textures doing a lot of the heavy lifting.
    * Visuals will be playful and vibrant, and should attempt to stay away from the brown/dead feel of games attempting realism. 
    * Visuals should draw from influences such as ROME (ro.me), Legend of Zelda: The Wind Waker, Super Paper Mario, and Okami.
    * As performance allows and aesthetic direction suggests, may additionally include: cel-shading, depth of field (dof), ambient occlusion (ao, if not handled by textures), vertex colors / shading, displacement mapping.
*   Difficulty: Mid range, allow for reasonable failure and don�t punish player by adding time wasters such as long runs, grind based goals (i.e. repetitive and dull tasks), and overpriced progression.
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
*   Character Customization: (Min priority) Player will find objects that may modify his/her character�s appearance in game.
*   Leveling Up / Stats: Not planned for implementation.
*   Achievements: (Min priority) If time permits, limited social media based achievements may be implemented.
*   HUD  (High priority): Heads up display (HUD) will be minimal by default, with most information derived from visual based queues instead, but exceptions will be made:
    * Lifebar will be shown
    * Energy bar will be shown
    * Abilities as list (scrollable / selectable)
    * Options / Menu buttons (pause on use)
*   Life and Death: (High priority) The player will be able to die in game but will never get a game over. Instead, upon dieing the player will be spit out of the world�s mouth.
*   Saving: May be added if time permits.
*   Loading: May be added if time permits.

####Progression
*   Physical Combat: Physical combat will likely not be a part of the game.
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
