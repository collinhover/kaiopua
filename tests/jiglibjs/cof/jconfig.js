(function(jigLib){
	/**
	 * @namespace JConfig a collection of configuration values
	 * @property {string} solverType the solver to use - can be one of FAST NORMAL or ACCUMULATED
	 * @property {string} boxCollisionsType can be one of EDGEBASE or SORTBASE
	 * @property {string} rotationType the unit of rotation - can be one of DEGREES or RADIANS
	 * @property {boolean} aabbDetection whether to execute aabb detection
	 * @property {boolean} doShockStep whether to perform the shock step (helps with stacking)
	 * @property {number} allowedPenetration the amount of penetration to be permitted
	 * @property {number} collToll collision detection tolerance
	 * @property {number} velThreshold the line velocity threshold for freezing
	 * @property {number} angVelThreshold the angle velocity threshold for freezing
	 * @property {number} posThreshold the threshold for detecting position changes during deactivation
	 * @property {number} orientThreshold the threshold for detecting orientation changes during deactivation
	 * @property {number} deactivationTime how long it takes to go from active to frozen when stationary
	 * @property {number} numPenetrationRelaxationTimesteps the number of timesteps over which to resolve penetration
	 * @property {number} numCollisionIterations the number of collision iterations
	 * @property {number} numContactIterations the number of contact iterations
	 * @property {number} numConstraintIterations number of constraint iterations
	 **/
	jigLib.JConfig={
		solverType: "ACCUMULATED",
		boxCollisionsType: "EDGEBASE",
		rotationType: "DEGREES",
		aabbDetection: true,
		doShockStep:  false,
		allowedPenetration: 0.015,
		collToll: 0.01,
		velThreshold: 0.1,
		angVelThreshold: 5,
		posThreshold: 0.1,
		orientThreshold: 0.1, 
		deactivationTime: 0.1, 
		numPenetrationRelaxationTimesteps: 20,
		numCollisionIterations: 4,
		numContactIterations: 5,
		numConstraintIterations: 15
	};
	 
})(jigLib);
