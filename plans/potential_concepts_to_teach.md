Potential Concepts to Teach
========
###Collin Hover, Graduate Thesis: Kaiopua
  
####Efficiency

Why: To help a player understand the value of efficiency in problem solving.   
   
Major concept: We tend to prefer methods that arrive at solutions in the simplest and quickest manner.   
   
Concern: Too abstract or broad?   
   
####Gestalt Principles of Grouping
   
Why: To help a player understand the gestalt principles of grouping and the ways in which they aid our interpretation of our experiences.   
   
Major concept: We tend to order and understand our experiences in a way that is regular, orderly, symmetric, and simple.   
   
Concern: No explanation for how our brain does this, only that it does... can this be taught?   
   
Relevant sub-concepts:   
* Proximity - stimuli close together are grouped into the same object.
* Similarity - stimuli of similar physical resemblance, such as shape, size, color, etc, are grouped into the same object.
* Closure - stimuli are seen as complete objects even in cases where only partial information is given, or individual stimuli that form a known shape are grouped into the same object.
* Continuation - stimuli that intersect or overlap are seen as individual uninterrupted objects, and preference is given to continuing in a similar direction over abrupt changes.
* Common Fate - stimuli of similar movement and direction are grouped into the same object.
* Multistability - stimuli with more than one interpretation will move unstably between them, and may seem to move between being figure (positive) or ground (negative).
* Symmetry - stimuli that can be grouped into symmetrical parts of the same object are preferrable.
   
####Color Control
   
Why: To help a player understand color and the properties of additive (RGB) color creation.   
   
Major concept: Additive colors begin with red, green, and blue, and eventually add up to white.   
   
Concern: Too simple a concept?   
   
##Implementations
   
####Planting and watering
   
What: A player plants seeds to change the environment's color, shape, and physical properties   
   
How: The player has three seeds, a red, a green, and a blue, and each, when planted, grows into a plant that changes the environment in a small radius   
* The seeds can be planted on any surface the player can see
* Each seed will affect the environment around it visually
* Seed areas of influence can overlap to create areas functionality
   
Color and environment change:   
* Red, Blue, Green = environment changes only (i.e. lava, forest, etc)
* Cyan = objects and character magnetized to surface
* Magenta = objects and character float away from surface
* Yellow = character can change the scale of objects (grow/shrink them)
* White = destroys all seeds with areas overlapping to create white
   
Example Problem:   
* A player becomes aware of a goal located on the underside of a cliff, which can be reached by a number of ledges and floating platforms
* The player must plant a red seed and a blue seed to create a magenta area to allow them to float up to the first ledge
* Upon the first ledge, the player must plant green and red seeds to create a yellow area so that they can grow a nearby floating pebble into a stable platform
* Upon the platform, the player again uses red and blue seeds again to float further up
* When close enough to the underside of the cliff, the player plants green and blue seeds to change gravity to the underside and pull him/her-self to the goal
   
####Stream Routing
   
What: A player connects a series of colored liquid pools to their destinations around the world   

How: A series of colored liquids begin in pools around the world, and the player must dig rivers to connect them to each color's goal around the world   
* Players can dig shallow rivers for the pools to flow into
* Rivers that cross or combine create a new pool of colored liquid
* Each color of liquid changes the laws of physics near it
* Rivers of two or more colors in close proximity create either analagous or complementary relationships, which dampen or amplify (respectively) the effects of the liquids
   
Example Problem:   
* Pools of red, green, and blue liquid are located around the world
* The goals require yellow, magenta, and blue
* The player digs rivers in such a way that blue splits and crosses with both red and green on its way to its own goal
* The player digs rivers in such a way that red and green combine with each blue split to create magenta and yellow respectively
* The player uses concepts of additive color theory to create and route all the required colors to their destinations
   
####Gestalt Perspective
   
What: A player's perspective on any set of two or more chosen objects controls the laws of physics for those objects.   
   
How: Each principle of grouping is given a physical property and a value, and a set of objects gains the physical property of the principle they have satisfied (from the player's perspective) with the highest value
* In 3D space, objects can satisfy different concepts of the principles of grouping when viewed at different angles.
* For example, two close objects from one angle satisfy proximity, but satisfy continuity by overlapping from another angle.
* Objects only affect each other when selected and activated by the player.
* Players are given the ability to move and modify objects to create relationships that satisfy the princples of grouping.
   
Physical property assignments:   
* Proximity = causes objects to pull each other closer, value 1   
* Similarity = causes objects to pull each other closer, value 2   
* Dissimilarity = causes object to repel each other, value 2   
* Continuation = causes objects to repel each other, value 3   
_(not all principles may be able to be evaluated or implemented)_   
   
Example Problem:   
* A player becomes aware of a goal located atop a pillar   
* This pillar has rectangular stairs starting from the top, circling around, and ending half-way down   
* The lowest step is too high for the player to reach   
* Nearby are scattered more rectangular stair pieces   
* The player notices that directly below each stair around the pillar is a single stone disk on the ground   
* The player places a stair piece atop each disk around the pillar missing a step above it   
* Next, the player activates each set of disk and stair piece, and based on both their dissimilarity and overlap (continuity) causes them to repel each other   
* Because the disk is being repelled into the ground, it is stationary, but the stair piece moves upward into place   
* The player uses the gestalt laws of grouping to push the similar stair pieces together to form the known shape of a staircase and solve the problem of reaching his/her goal   