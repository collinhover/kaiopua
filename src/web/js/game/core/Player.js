/*
Player.js
Player module, handles player in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		player = core.player = core.player || {},
		ready = false,
		assets,
		objectmaker,
		physics,
		world,
		scene,
		camera,
		cameraModes = {
			follow: 'follow',
			freelook: 'freelook'
		},
		cameraMode = cameraModes.follow,
		cameraFollowSettings,
		cameraFreelookControls,
		keybindings = {},
		keybindingsDefault = {},
		playerCharacter,
		line1,
		line2,
		line3,
		line4;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	player.init = init;
	player.enable = enable;
	player.disable = disable;
	player.show = show;
	player.hide = hide;
	player.allow_control = allow_control;
	player.remove_control = remove_control;
	
	// getters and setters
	Object.defineProperty(player, 'cameraMode', { 
		get : function () { return cameraMode; },
		set : set_camera_mode
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
		
			// assets
			
			assets = main.utils.loader.assets;
			
			// workers
			
			objectmaker = game.workers.objectmaker;
			
			// core
			
			physics = core.physics;
			
			world = core.world;
			
			// initialization
			
			init_camera();
			
			init_keybindings();
			
			init_controls();
			
			init_character();
			
			// signals
			
			shared.signals.paused.add( pause );
			
			ready = true;
			
		}
		
	}
	
	function init_camera () {
		
		// init camera follow settings
		
		cameraFollowSettings = {
			offset: {
				pos: new THREE.Vector3( 0, 0, 200 ),
				rot: new THREE.Quaternion( -0.1, 0.1, 0, 1 )
			},
			clamps: {
				minRotX: -0.4,
				maxRotX: 0.1,
				minRotY: -1,
				maxRotY: 1,
				minPosZ: -100,
				maxPosZ: 300
			}
		}
		
		// set default camera mode
		
		set_camera_mode();
		
	}
	
	function init_keybindings () {
		
		var kbMap;
		
		// init keybindings
		
		kbMap = keybindingsDefault;
		
		// default keybindings
		
		// mouse buttons
		
		kbMap[ 'clickleft' ] = {
			mousedown: function () { 
				console.log('key down: clickleft');
			},
			mouseup: function () { console.log('key up: clickleft'); }
		};
		kbMap[ 'clickmiddle' ] = {
			mousedown: function () { console.log('key down: clickmiddle'); },
			mouseup: function () { console.log('key up: clickmiddle'); }
		};
		kbMap[ 'clickright' ] = {
			mousedown: function () { console.log('key down: clickright'); },
			mouseup: function () { console.log('key up: clickright'); }
		};
		
		// wasd / uldr
		
		kbMap[ '38' /*up*/ ] = {
			keydown: function () { console.log('key down: up'); },
			keyup: function () { console.log('key up: up'); }
		};
		kbMap[ '87' /*w*/ ] = kbMap[ 'w' ] = {
			keydown: function () { characterMove(); },
			keyup: function () { console.log('key up: w'); }
		};
		
		kbMap[ '40' /*down*/ ] = {
			keydown: function () { console.log('key down: down'); },
			keyup: function () { console.log('key up: down'); }
		};
		kbMap[ '83' /*s*/ ] = kbMap[ 's' ] = {
			keydown: function () { console.log('key down: s'); },
			keyup: function () { console.log('key up: s'); }
		};
		
		kbMap[ '37' /*left*/ ] = {
			keydown: function () { console.log('key down: left'); },
			keyup: function () { console.log('key up: left'); }
		};
		kbMap[ '65' /*a*/ ] = kbMap[ 'a' ] = {
			keydown: function () { console.log('key down: a'); },
			keyup: function () { console.log('key up: a'); }
		};
		
		kbMap[ '39' /*right*/ ] = {
			keydown: function () { console.log('key down: right'); },
			keyup: function () { console.log('key up: right'); }
		};
		kbMap[ '68' /*d*/ ] = kbMap[ 'd' ] = {
			keydown: function () { console.log('key down: d'); },
			keyup: function () { console.log('key up: d'); }
		};
		
		// numbers
		
		kbMap[ '49' /*1*/ ] = kbMap[ '1' ] = {
			keyup: function () { console.log('key up: 1'); }
		};
		kbMap[ '50' /*2*/ ] = kbMap[ '2' ] = {
			keyup: function () { console.log('key up: 2'); }
		};
		kbMap[ '51' /*3*/ ] = kbMap[ '3' ] = {
			keyup: function () { console.log('key up: 3'); }
		};
		kbMap[ '52' /*4*/ ] = kbMap[ '4' ] = {
			keyup: function () { console.log('key up: 4'); }
		};
		kbMap[ '53' /*5*/ ] = kbMap[ '5' ] = {
			keyup: function () { console.log('key up: 5'); }
		};
		kbMap[ '54' /*6*/ ] = kbMap[ '6' ] = {
			keyup: function () { console.log('key up: 6'); }
		};
		
		// misc
		
		kbMap[ '81' /*q*/ ] = kbMap[ 'q' ] = {
			keyup: function () { console.log('key up: q'); }
		};
		
		kbMap[ '69' /*e*/ ] = kbMap[ 'e' ] = {
			keyup: function () { console.log('key up: e'); }
		};
		
		kbMap[ '82' /*r*/ ] = kbMap[ 'r' ] = {
			keyup: function () { console.log('key up: r'); }
		};
		
		kbMap[ '70' /*f*/ ] = kbMap[ 'f' ] = {
			keyup: camera_toggle_free_look
		};
		
		// set default as current
		
		set_keybindings( kbMap );
		
	}
	
	function init_controls () {
		
		
		
	}
	
	function init_character () {
		
		playerCharacter = {};
		
		// model
		
		var mat = new THREE.MeshNormalMaterial();
		
		var playerCharacterGeometry = new THREE.CubeGeometry( 50, 100, 50 );
		
		// three
		
		playerCharacter.model = objectmaker.make_model({
			geometry: playerCharacterGeometry,
			materials: mat
		});
		
		playerCharacter.model.mesh.position.set( 0, 0, 1800 );
		
		// rigidbody
		
		playerCharacter.model.rigidBody = physics.translate( playerCharacter.model.mesh, {
			bodyType: 'box',
			rotatable: false
		});
		
		// initial orientation
		
		playerCharacter.orientation = new THREE.Quaternion().copy( playerCharacter.model.mesh.quaternion );
		
		
		// lines for testing
		
		var geom = new THREE.Geometry();
		geom.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat1 = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 1, linewidth: 3 } );
		
		line1 = new THREE.Line(geom, lineMat1);
		
		var geom2 = new THREE.Geometry();
		geom2.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom2.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat2 = new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: 1, linewidth: 3 } );
		
		line2 = new THREE.Line(geom2, lineMat2);
		
		var geom3 = new THREE.Geometry();
		geom3.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom3.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat3 = new THREE.LineBasicMaterial( { color: 0x00ffff, opacity: 1, linewidth: 3 } );
		
		line3 = new THREE.Line(geom3, lineMat3);
		
		var geom4 = new THREE.Geometry();
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat4 = new THREE.LineBasicMaterial( { color: 0xff00ff, opacity: 1, linewidth: 3 } );
		
		line4 = new THREE.Line(geom4, lineMat4);
		
	}
	
	/*===================================================
    
    camera
    
    =====================================================*/
	
	function set_camera_mode ( modeType ) {
		
		var cameraRot = new THREE.Quaternion();
		
		// update camera
		
		camera = game.camera;
		
		cameraRot.setFromRotationMatrix( camera.matrix );
		
		camera.useQuaternion = true;
		camera.quaternion = cameraRot;
		
		// set mode
		
		cameraMode = modeType;
		
		if ( modeType === cameraModes.freelook ) {
			
			remove_control();
			
			if ( typeof cameraFreelookControls === 'undefined' ) {
				
				cameraFreelookControls = new THREE.FlyControls( camera );
				cameraFreelookControls.rollSpeed = 0.5;
				cameraFreelookControls.movementSpeed = 800;
				
			}
			else {
				
				cameraFreelookControls.object = camera;
				cameraFreelookControls.moveVector.set( 0, 0, 0 );
				cameraFreelookControls.rotationVector.set( 0, 0, 0 );
				
			}
			
		}
		else {
			
			allow_control();
			
		}
		
	}
	
	function update_camera () {
		
		// update camera based on mode
		
		if ( cameraMode === cameraModes.freelook ) {
			
			camera_free_look();
			
		}
		else {
			
			camera_follow_character();
			
		}
		
	}
	
	function camera_toggle_free_look () {
		
		if ( cameraMode === cameraModes.freelook ) {
			
			set_camera_mode();
			
		}
		else {
			
			set_camera_mode( 'freelook' );
			
		}
		
	}
	
	function camera_free_look () {
		
		// update camera controls
		cameraFreelookControls.update();
		
	}
	
	function camera_follow_character () {
		
		var offset = cameraFollowSettings.offset,
			srcOffsetPos = offset.pos,
			srcOffsetRot = offset.rot,
			clamps = cameraFollowSettings.clamps,
			pcMesh,
			pcQuat,
			camOffsetPos,
			camOffsetRot,
			camOffsetRotHalf,
			camPosNew;
		
		pcMesh = playerCharacter.model.mesh;
		pcQuat = pcMesh.quaternion;
		
		camPosNew = pcMesh.position.clone();
		camOffsetPos = new THREE.Vector3( srcOffsetPos.x, srcOffsetPos.y, srcOffsetPos.z );
		camOffsetRot = new THREE.Quaternion( srcOffsetRot.x, srcOffsetRot.y, srcOffsetRot.z, srcOffsetRot.w );
		camOffsetRotHalf = new THREE.Quaternion( camOffsetRot.x * 0.5, camOffsetRot.y * 0.5, camOffsetRot.z * 0.5, camOffsetRot.w);
		
		pcQuat.multiplyVector3( camOffsetPos );
		camOffsetRot.multiplyVector3( camOffsetPos );
		
		camPosNew.addSelf( camOffsetPos );
		
		camera.position = camPosNew;
		
		camera.quaternion.copy( pcQuat );
		
		camera.quaternion.multiplySelf( camOffsetRotHalf );
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function set_keybindings ( map ) {
		
		var key;
		
		// set all new keybindings in map
		
		for ( key in map ) {
			
			if ( map.hasOwnProperty( key ) === true ) {
				
				keybindings[ key ] = map[ key ];
				
			}
			
		}
		
	}
	
	/*===================================================
    
    controls
    
    =====================================================*/
	
	function allow_control () {
		
		// signals
		
		shared.signals.mousedown.add( onMouseClicked );
		shared.signals.mouseup.add( onMouseClicked );
		
		shared.signals.keydown.add( onKeyboardUsed );
		shared.signals.keyup.add( onKeyboardUsed );
		
	}
	
	function remove_control () {
		
		// signals
		
		shared.signals.mousedown.remove( onMouseClicked );
		shared.signals.mouseup.remove( onMouseClicked );
		
		shared.signals.keydown.remove( onKeyboardUsed );
		shared.signals.keyup.remove( onKeyboardUsed );
		
	}
	
	function onMouseClicked ( e ) {
		
		var button,
			arguments = [];
		
		switch ( e.button ) {
			
			case 2: button = 'clickright'; break;
			case 1: button = 'clickmiddle'; break;
			case 0: button = 'clickleft'; break;
			
		}
		
		triggerKey( button, e.type );
		
	}
	
	function onKeyboardUsed ( e ) {
		
		triggerKey( (e.key || e.keyCode).toString().toLowerCase(), e.type );
		
	}
	
	function triggerKey ( keyName, eventType, arguments ) {
		
		var kbMap = keybindings,
			kbInfo;
		
		if ( kbMap.hasOwnProperty( keyName ) === true ) {
			
			kbInfo = kbMap[ keyName ];
			
			if ( kbInfo.hasOwnProperty( eventType ) === true ) {
				
				kbInfo[ eventType ].apply( this, arguments );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	function update_character () {
		
		var pc = playerCharacter,
			pcModel = pc.model,
			pcRot = pc.orientation,
			pcRotExpected,
			pcRotMat,
			rb = pcModel.rigidBody,
			rbState = rb.get_currentState(),
			rbMass = rb.get_mass(),
			rbRotNew,
			gravitySource = {
				pos: new jiglib.Vector3D()
			},
			gravityDir,
			gravityPull,
			forceGravity = world.gravityMagnitude * rb.get_mass(),
			upDirBase = new jiglib.Vector3D( 0, 1, 0 ),
			upDirNew,
			upDirDiffAxis,
			upDirDiffAngle;
		
		// get normalized vector between character and gravity source
		
		gravityDir = gravitySource.pos.subtract( rbState.position )
		gravityDir.normalize();
		
		// get pull of gravity
		
		gravityPull = gravityDir.clone();
		gravityPull.scaleBy( forceGravity );
		
		// apply world impulse
		rb.applyWorldImpulse( gravityPull, gravitySource.pos, true );
		
		// set expected rotation
		
		upDirNew = gravityDir.clone().negate();
		upDirNew.normalize();
		
		upDirDiffAngle = Math.acos( upDirBase.dotProduct( upDirNew ) ) * -1;
		
		upDirDiffAxis = upDirBase.crossProduct( upDirNew );
		upDirDiffAxis.normalize();
		
		pcRotExpected = new THREE.Quaternion();
		pcRotExpected.setFromAxisAngle( upDirDiffAxis, upDirDiffAngle );
		
		pcRotMat = new THREE.Matrix4().setRotationFromQuaternion( pcRotExpected );
		
		rbRotNew = new jiglib.Matrix3D( pcRotMat.flatten() );
		
		rbState.orientation = rbRotNew;
		
		// line testing
		
		var normalX = new jiglib.Vector3D( 0, 0, 1 ).crossProduct( gravityDir );
		var normalZ = normalX.crossProduct( gravityDir );
		
		normalX.normalize();
		normalZ.normalize();
		
		/*
		var angleX = Math.acos( right.dotProduct( normalX ) ) * -1;
		var angleZ = Math.acos( forward.dotProduct( normalZ ) ) * -1;
		
		var axisX = right.crossProduct( normalX );
		var axisZ = forward.crossProduct( normalZ );
		
		axisX.normalize();
		axisZ.normalize();
		
		var qx = new THREE.Quaternion();
		qx.setFromAxisAngle( axisX, angleX );
		var qy = new THREE.Quaternion();
		qy.setFromAxisAngle( axisY, angleY );
		var qz = new THREE.Quaternion();
		qz.setFromAxisAngle( axisZ, angleZ );
		*/
		
		var lineStart = new THREE.Vector3( normalZ.x, normalZ.y, normalZ.z );
		lineStart.addSelf( rbState.position );
		var normalClone = normalZ.clone().scaleBy( 100 );
		var lineEnd = lineStart.clone();
		lineEnd.addSelf( normalClone );
		
		line1.geometry.vertices[0].position = lineStart;
		line1.geometry.vertices[1].position = lineEnd;
		line1.geometry.__dirtyVertices = true;
		line1.geometry.__dirtyElements = true;
		
		
		var ls2 = new THREE.Vector3( normalX.x, normalX.y, normalX.z );
		ls2.addSelf( rbState.position );
		var nc2 = normalX.clone().scaleBy( 100 );
		var le2 = ls2.clone();
		le2.addSelf( nc2 );
		
		line2.geometry.vertices[0].position = ls2;
		line2.geometry.vertices[1].position = le2;
		line2.geometry.__dirtyVertices = true;
		line2.geometry.__dirtyElements = true;
		
		
		var ls3 = new THREE.Vector3( upDirNew.x, upDirNew.y, upDirNew.z );
		ls3.addSelf( rbState.position );
		var nc3 = upDirNew.clone().scaleBy( 100 );
		var le3 = ls3.clone();
		le3.addSelf( nc3 );
		
		line3.geometry.vertices[0].position = ls3;
		line3.geometry.vertices[1].position = le3;
		line3.geometry.__dirtyVertices = true;
		line3.geometry.__dirtyElements = true;
	}
	
	function characterMove ( direction ) {
		
		var pc = playerCharacter,
			pcModel = pc.model,
			rb = pcModel.rigidBody,
			rbState = rb.get_currentState(),
			rbPos = rbState.position;
			console.log('character move');
			
			rb.setLineVelocity( new jiglib.Vector3D( 200, 0, 0 ) );
			
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function pause () {
		
		disable();
		
		shared.signals.resumed.add( resume );
		
	}
	
	function resume () {
		
		shared.signals.resumed.remove( resume );
		
		enable();
		
	}
	
	function enable () {
		
		shared.signals.update.add( update );
		
		allow_control();
		
	}
	
	function disable () {
		
		remove_control();
		
		shared.signals.update.remove( update );
		
	}
	
	function show () {
		
		scene = game.scene;
		
		scene.add( line1 );
		scene.add( line2 );
		scene.add( line3 );
		scene.add( line4 );
		
		scene.add( playerCharacter.model.mesh );
		
		physics.add( playerCharacter.model.mesh, { rigidBody: playerCharacter.model.rigidBody } );
		
	}
	
	function hide () {
		
		scene.remove( playerCharacter.model.mesh );
		
		physics.remove( playerCharacter.model.mesh, { rigidBody: playerCharacter.model.rigidBody } );
		
	}
	
	function update () {
		
		// character
		
		update_character();
		
		// camera
		
		update_camera();
		
	}
	
	return main;
	
}(KAIOPUA || {}));