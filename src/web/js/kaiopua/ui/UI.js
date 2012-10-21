/*
 *
 * UI.js
 * Handles game UI.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/core/UI.js",
		_UI = {},
		_UIQueue;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _UI,
		requirements: [
			"js/kaiopua/ui/UIQueue.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uiq ) {
		console.log('internal UI', _UI);
		
		// modules
		
		_UIQueue = uiq;
		
		// properties
		
		_UI.pause = pause;
		_UI.resume = resume;
		
		// dom elements
		
		shared.domElements = shared.domElements || {};
		
		shared.domElements.cloneables = shared.domElements.cloneables || {};
		shared.domElements.cloneables.$reward = $( '<div class="reward"><button class="btn btn-large btn-circle-large"><img src="" class="iconk-giant reward-icon"></button><p class="reward-name"></p><p><small class="reward-type"></small></p></div>' );
		
		shared.domElements.$uiGameDimmer = $('#uiGameDimmer');
		shared.domElements.$uiBlocker = $('#uiBlocker');
		shared.domElements.$ui = $('#ui');
		shared.domElements.$uiHeader = $( '#uiHeader' );
		shared.domElements.$uiBody = $( '#uiBody' );
		shared.domElements.$uiInGame = $( '#uiInGame' );
		shared.domElements.$uiOutGame = $( '#uiOutGame' );
		
		shared.domElements.$dropdowns = $( '.dropdown' );
		
        shared.domElements.$tabToggles = $( '.tab-toggles' ).find( '[href^="#"]' ).not( '.tab-toggle-empty' );
		
		shared.domElements.$stickied = $( ".is-sticky" );
		
		shared.domElements.$actionsActive = $( '#actionsActive' );
		shared.domElements.$actionsInactive = $( '#actionsInactive' );
		shared.domElements.$actionItems = $('.action-item');
		
		shared.domElements.$menus = shared.domElements.$uiOutGame.find( '.menu' );
		shared.domElements.$menuDefault = $();
		shared.domElements.$menusInner = $();
		shared.domElements.$menuToggles = $();
		shared.domElements.$menuToggleDefault = $();
		shared.domElements.$menuActive = $( '#menuActive' );
		shared.domElements.$menuInactive = $( '#menuInactive' );
		shared.domElements.$menuFarming = $('#menuFarming');
		shared.domElements.$menuOptions = $('#menuOptions');
		
		shared.domElements.$navbars = $( '.navbar, .subnavbar' );
		shared.domElements.$navMenus = $('#navMenus');
		shared.domElements.$navMenusButtons = shared.domElements.$navMenus.find( ".nav li a" );
		shared.domElements.$navStart = $( '#navStart' );
		
		// major buttons
		
		shared.domElements.$buttonGamePause = $('#buttonGamePause');
		shared.domElements.$buttonsGamePause = $('.game-pause');
		shared.domElements.$buttonGameResume = $('#buttonGameResume');
		shared.domElements.$buttonsGameResume = $('.game-resume');
		shared.domElements.$menuFarmingToggle = $('a[href="#menuFarming"]');
		
		// ui menus
		
		shared.domElements.$tools = $('#puzzleTools');
		
		shared.domElements.$puzzle = $('#puzzle');
		shared.domElements.$puzzleActive = $( "#puzzleActive" );
		shared.domElements.$puzzleActiveWarning = $( "#puzzleActiveWarning" );
		shared.domElements.$puzzleActiveStarted = $( "#puzzleActiveStarted" );
		shared.domElements.$puzzleActiveStartedPlan = $( "#puzzleActiveStartedPlan" );
		shared.domElements.$puzzleActiveStartedPlanReady = $( "#puzzleActiveStartedPlanReady" );
		shared.domElements.$puzzleActiveName = $( ".puzzle-active-name" );
		shared.domElements.$puzzleActiveScoreBar = $( "#puzzleActiveScoreBar" );
		shared.domElements.$puzzleActiveElementCount = $( ".puzzle-active-elementCount" );
		shared.domElements.$puzzleActiveNumElementsMin = $( ".puzzle-active-numElementsMin" );
		shared.domElements.$puzzleActiveShapesCounter = $( "#puzzleActiveShapesCounter" );
		shared.domElements.$puzzleActiveNumShapesChosen = $( ".puzzle-active-numShapesChosen" );
		shared.domElements.$puzzleActiveNumShapesRequired = $( ".puzzle-active-numShapesRequired" );
		shared.domElements.$puzzleActiveShapes = $( "#puzzleActiveShapes" );
		shared.domElements.$puzzleActiveShapesRequiredWarning = $( "#puzzleActiveShapesRequiredWarning" );
		shared.domElements.$puzzleActiveShapesPicker = $( "#puzzleActiveShapesPicker" );
		shared.domElements.$puzzleActiveStatusIcons = $( ".puzzle-statusIcon" );
		shared.domElements.$puzzleActiveCompletionIcons = $( ".puzzle-completionIcon" );
		shared.domElements.$puzzleActiveStatusText = $( "#puzzleActiveStatusText" );
		shared.domElements.$puzzleActiveCompletionText = $( "#puzzleActiveCompletionText" );
		shared.domElements.$puzzleActiveReady = $( "#puzzleActiveReady" );
		shared.domElements.$puzzleActiveMap = $( "#puzzleActiveMap" );
		shared.domElements.$puzzleActiveRewards = $( "#puzzleActiveRewards" );
		
		shared.domElements.$score = $( "#score" );
		shared.domElements.$scorePuzzleName = $( ".score-puzzle-name" );
		shared.domElements.$scoreTitle = $( "#scoreTitle" );
		shared.domElements.$scoreElementCount = $( ".score-element-count" );
		shared.domElements.$scoreElementCountGoal = $( ".score-element-count-goal" );
		shared.domElements.$scoreBar = $( "#scoreBar" );
		shared.domElements.$scorePoor = $( "#scorePoor" );
		shared.domElements.$scoreGood = $( "#scoreGood" );
		shared.domElements.$scorePerfect = $( "#scorePerfect" );
		shared.domElements.$scorePct = $( ".score-pct" );
		shared.domElements.$scoreRewards = $( "#scoreRewards" );
		shared.domElements.$rewardsPoor = $( "#rewardsPoor" );
		shared.domElements.$rewardsGood = $( "#rewardsGood" );
		shared.domElements.$rewardsPerfect = $( "#rewardsPerfect" );
		shared.domElements.$rewardsPoorList = shared.domElements.$rewardsPoor.find( ".reward-list" );
		shared.domElements.$rewardsGoodList = shared.domElements.$rewardsGood.find( ".reward-list" );
		shared.domElements.$rewardsPerfectList = shared.domElements.$rewardsPerfect.find( ".reward-list" );
		shared.domElements.$scoreHint = $( "#scoreHint" );
		
		shared.domElements.$plant = $('#plant');
		shared.domElements.$plantActive = $("#plantActive");
		shared.domElements.$plantActiveWarning = $("#plantActiveWarning");
		shared.domElements.$plantActivePortrait = $("#plantActivePortrait");
		shared.domElements.$plantActiveShape = $("#plantActiveShape");
		shared.domElements.$plantActiveShapeIcon = $("#plantActiveShapeIcon");
		shared.domElements.$plantActiveSkin = $("#plantActiveSkin");
		shared.domElements.$plantActiveSkinIcon = $("#plantActiveSkinIcon");
		
		shared.domElements.$collection = $('#collection');
		
		// set all images to not draggable
		
		if ( Modernizr.draganddrop ) {
			
			$( 'img' ).attr( 'draggable', false );
			
		}
		
		// all links that point to a location in page
		
		$( 'a[href^="#"]' ).each( function () {
			
			var $element = $( this ),
				$section = $( $element.data( 'section' ) ),
				$target = $( $element.attr( 'href' ) );
			
			// remove click
			
			$element.attr( 'onclick', 'return false;' );
			
			// if has section or target, prioritize section over target
			
			if ( $section.length > 0 || $target.length > 0 ) {
				
				$element.on( 'tap', function () {
					
					( $section[0] || $target[0] ).scrollIntoView( true );
					
				} );
				
			}
				
		} );
		
		// handle disabled items only if pointer-events are not supported
		
		if ( shared.supports.pointerEvents === false ) {
			
			main.dom_ignore_pointer( $(".ignore-pointer, .disabled"), true );
			
		}
		
		// primary action items
		
		shared.domElements.$actionItems.each( function () {
			
			var $item = $( this );
			
			if ( $item.parent().is( shared.domElements.$actionsActive ) && $item.is( '.hidden, .collapsed' ) ) {
				
				shared.domElements.$actionsInactive.append( $item );
				
			}
			
		} ).on('show.active', function () {
			
			shared.domElements.$actionsActive.append( this );
			
		})
		.on('hidden.active', function () {
			
			shared.domElements.$actionsInactive.append( this );
			
		});
		
		// for all drop downs
		
		shared.domElements.$dropdowns.each( function () {
			
			var $dropdown = $( this );
			
			// close when drop down item is selected
			
			$dropdown.find( '.dropdown-menu a' ).each( function () {
				
				var $button = $( this );
				
				$button.on( 'tap', function () {
						
						$button.parent().removeClass( 'active' );
						
						$dropdown.removeClass('open');
						
					} );
				
			} );
			
		} );
		
		// for each navbar
		
		shared.domElements.$navbars.each( function () {
			
			var $navbar = $( this ),
				$buttonCollapse = $navbar.find( '[data-toggle="collapse"]' ),
				$navCollapse = $navbar.find( '.nav-collapse' );
			
			// if has collapsable
			
			if ( $buttonCollapse.length > 0 && $navCollapse.length > 0 ) {
				
				$navCollapse.find( 'a' ).each( function () {
					
					var $button = $( this );
					
					$button.on( 'tap', function () {
							
							if( $buttonCollapse.is( '.collapsed' ) !== true ) {
								
								$buttonCollapse.trigger( 'click' );
								
							}
							
						} );
					
				} );
				
			}
			
		} );
		
		// sticky elements
		
		shared.domElements.$stickied.each( function () {
			
			var $stickied = $( this ),
				$relative = $( $stickied.data( "relative" ) ),
				$target = $( $stickied.data( "target" ) );
			
			// if relative empty, assume uiHeader
			
			if ( $relative.length === 0 ) {
				
				$relative = shared.domElements.$uiHeader;
				
			}
			
			// if target empty, assume uiOutGame
			
			if ( $target.length === 0 ) {
				
				$target = shared.domElements.$uiOutGame;
				
			}
			
			$stickied.removeClass( 'is-sticky' ).sticky( {
				
				topSpacing: function () {
					
					return $relative.offset().top + $relative.outerHeight( true );
					
				},
				scrollTarget: $target,
				handlePosition: false
				
			} );
			
		} );
		
		// for each menu
		
		shared.domElements.$menus.each( function () {
			
			var $menu = $( this ),
				$inner = $menu.find( '.menu-inner' ),
				$toggle = shared.domElements.$navMenusButtons.filter( '[href="#' + $menu.attr( 'id' ) + '"]' ),
				activate,
				deactivate,
				first,
				last,
				open,
				close,
				toggle;
			
			$menu.data( '$inner', $inner );
			$menu.data( '$toggle', $toggle );
			$menu.data( 'scrollTop', 0 );
			
			shared.domElements.$menusInner = shared.domElements.$menusInner.add( $inner );
			
			// functions
			
			activate = function () {
				
				main.pause( false, true );
				
				if ( $toggle.length > 0 ) {
					
					$toggle.closest( 'li' ).addClass( 'active' );
						
				}
				
				$menu.addClass( 'active' );
				
				main.dom_fade( {
					element: $menu,
					opacity: 1
				} );
				
				// resize and scroll to last location for this tab
				
				$( window ).trigger( 'resize' );
				
				shared.domElements.$uiOutGame.scrollTop( $menu.data( 'scrollTop' ) );
				
			};
			
			deactivate = function () {
				
				// store scroll position
				
				$menu.data( 'scrollTop', shared.domElements.$uiOutGame.scrollTop() );
				
				if ( $toggle.length > 0 ) {
					
					$toggle.closest( 'li' ).removeClass( 'active' );
					
				}
				
				$menu.removeClass( 'active' );
				
				main.dom_fade( {
					element: $menu,
					time: 0
				} );
				
			};
			
			first = function () {
				
				main.pause( false, true );
				
			};
			
			last = function () {
				
				main.dom_fade( {
					element: shared.domElements.$uiOutGame
				} );
				
				main.resume();
				
			};
			
			open = function () {
				
				_UIQueue.add( {
						element: $menu,
						container: shared.domElements.$uiOutGame,
						activate: activate,
						deactivate: deactivate,
						first: first,
						last: last
					} );
				
			};
			
			close = function () {
				
				_UIQueue.remove( $menu );
				
			};
			
			toggle = function () {
				
				if ( $menu.is( '.active' ) === true ) {
					
					$menu.trigger( 'close' );
					
				}
				else {
					
					$menu.trigger( 'open' );
					
				}
				
			};
			
			$menu.on( 'open', open )
				.on( 'close', close )
				.on( 'toggle', toggle );
			
			// attach events to toggle when present
			
			if ( $toggle.length > 0 ) {
				
				$toggle.data( '$menu', $menu );
				
				shared.domElements.$menuToggles = shared.domElements.$menuToggles.add( $toggle );
				
				// events
				
				$toggle.on( 'tap',  toggle );
				
			}
			
			// find default menu
			
			if ( shared.domElements.$menuDefault.length === 0 && $menu.is( '.active' ) === true ) {
				
				shared.domElements.$menuDefault = $menu;
				shared.domElements.$menuToggleDefault = $toggle;
				
				deactivate();
				
			}
			
		} );
		
		// for each tab toggle
		
		 shared.domElements.$tabToggles.each( function () {
			
			var $toggle = $( this ),
				$tab = $( $toggle.attr( 'href' ) );
				
				$toggle.data( '$tab', $tab );
				
				// make toggle-able
				
				$toggle.on( 'tap', function ( e ) {
					
					if ( $tab.is( '.active' ) === true ) {
						
						$toggle.trigger( 'showing' );
						
					}
					else {
						
						$toggle.tab('show');
						
					}
					
				} )
				.on( 'shown', function () {
					
					$toggle.trigger( 'showing' );
					
				} );
			
		} );
		
		// pause / resume
		
		shared.domElements.$buttonsGamePause.on( 'tap', pause );
		shared.domElements.$buttonsGameResume.on( 'tap', resume );
		
		// hide uiOutGame
		
		main.dom_fade( {
			element: shared.domElements.$uiOutGame,
			time: 0
		} );
		
		// show menus nav
		
		main.dom_fade( {
			element: shared.domElements.$navMenus,
			opacity: 1
		} );
		
		// signals
		
		shared.signals.onGamePaused.add( pause );
		shared.signals.onGameResumed.add( resume );
		
	}
	
	/*===================================================
    
    pause
    
    =====================================================*/
	
	function pause ( preventDefault, preventMenuChange ) {
		
		// hide pause button
		
		main.dom_fade( {
			element: shared.domElements.$buttonGamePause,
			time: 0
		} );
		
		// pause priority
		
		if ( preventDefault === true ) {
			
			// block ui
			
			main.dom_fade( {
				element: shared.domElements.$uiBlocker,
				opacity: 0.9
			} );
			
		}
		else {
			
			// uiGameDimmer
			
			main.dom_fade( {
				element: shared.domElements.$uiGameDimmer,
				opacity: 0.9
			} );
			
			// swap to default menu
			
			if ( preventMenuChange !== true && shared.domElements.$menuToggleDefault.length > 0 ) {
				
				shared.domElements.$menuToggleDefault.trigger( 'tap' );
				
			}
			
			// show resume button
			
			main.dom_fade( {
				element: shared.domElements.$buttonGameResume,
				opacity: 1
			} );
			
			// add listener for click on uiGameDimmer
			
			shared.domElements.$uiGameDimmer.on( 'tap.resume', resume );
			
		}
		
	}
	
	/*===================================================
    
    resume
    
    =====================================================*/
	
	function resume () {
		
		// hide resume button
		
		main.dom_fade( {
			element: shared.domElements.$buttonGameResume,
			time: 0
		} );
		
		// hide pause message
		
		main.dom_collapse( {
			element: shared.domElements.$pauseMessage
		} );
		
		// unblock ui
		
		main.dom_fade( {
			element: shared.domElements.$uiBlocker
		} );
		
		_UIQueue.clear( shared.domElements.$uiOutGame );
		
		// uiGameDimmer
		
		shared.domElements.$uiGameDimmer.off( '.resume' );
		main.dom_fade( {
			element: shared.domElements.$uiGameDimmer
		} );
		
		// show pause button
		
		main.dom_fade( {
			element: shared.domElements.$buttonGamePause,
			opacity: 1
		} );
		
	}
	
} (KAIOPUA) );