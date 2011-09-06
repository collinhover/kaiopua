Level Design: Lono's Clouds over the Ocean (001)
========
##Collin Hover, Graduate Thesis: Kaiopua

####Plan Version
1.0.09.06.2011

####Level Description
The name Kai’Opua comes from Hawaiian culture, known as the opua or pink cumulus cloud formations that hang low over ‘kai’, the ocean. These clouds are regarded as omens of good fortune and good weather, and in Hawaii Lono is the god that controls storms and rain. The player will begin their journey here, on the ring that is a physical recreation of the game's name. On this ring there are four islands: one large, one medium, and two small. The large island is the player’s starting location, on which is located the travel blowhole and a small beach-shack with the player’s first ability object. Within sight of this island is a medium sized island with the ring’s power source and a small pink/purple air balloon. The two small islands are around the ring by 135 and 225 degrees from the starting island, and are each locations of the second and third ability objects. In this ring, the clouds float low enough that the two small islands appear to be flat topped mountains rising through the cloud line. The player will use the clouds and wind to solve puzzles and work their way from the starting island around to find the second and third ability objects, and use all three ability objects to reach the power source.

####Level Summary
*   First ring of Opua, starting from head. 
*   Environment is composed of water, sand, clouds, and wind. 
*   The player can walk safely on the clouds and islands.
*   Clouds and wind will be used both by the environment and player in puzzles.
*   Some clouds are pre-modeled static clouds, while others are usable (code generated).
*   All usable clouds are 1 W x 1 H x 1 D (cube) unit blocks.
*   Some usable clouds will be dangerous to the player, and will look like lightning clouds.
*   If player falls off a cloud into the water, they will be returned to the last checkpoint.
*   Checkpoints will be set every time a player steps onto a new cloud.

##Abilities
####Ability Object 1: Bottle of Sunshine
*   Found on starting island.
*   Object is a small bottle that fits in the player’s hand.
*   Player can face any lightning cloud and shine the sun to destroy it.

####Ability Object 2: Conch Shell
*   Found on first small island.
*   Object is a small conch shell that fits in the player’s hand like a megaphone.
*   Player can blow conch to create a single moving cloud infront of themselves.
*   Conch cloud moves in the direction the player faces at time of blowing conch.
*   Conch cloud lasts only a short time.

####Ability Object 3: Puffer Fish
*   Found on second small island.
*   Object is a small puffer fish that fits in the player’s hand.
*   Allows the player to manipulate the position of usable clouds.
*   The puffer fish can be pointed at a usable cloud at any distance and will inhale that cloud.
*   The puffer fish can exhale an inhaled cloud at any location directly around the player.

##Puzzles
####Cloud Breaker
*   Player must navigate from starting island to first small island using the clouds.
*   Passage will be blocked at various locations by lightning clouds.
*   Player must use bottle of sunshine to destroy clouds blocking the way.

####Cloud Jumper
*   Player must navigate from first small island to second small island using the clouds.
*   Passage will be blocked at various locations by gaps in clouds.
*   Player must use conch shell to ride over cloud gaps.

####Cloud Eater
*   Player must navigate from second small island to the power source island using the clouds.
*   There will be many usable clouds in this puzzle, but most will be near sides of path.
*   There will be several static clouds spaced very far apart.
*   Center of path will be largely devoid of clouds.
*   Player must use conch shell to create moving clouds.
*   Player must use puffer fish to store usable clouds and place them when moving cloud runs out.
