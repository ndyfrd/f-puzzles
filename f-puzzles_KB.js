// ==UserScript==
// @name		 Fpuzzles_KB
// @namespace	 http://tampermonkey.net/
// @version		 1.0
// @description  Makes f-puzzles more keyboard-centric
// @author		 Ennead
// @match		 https://*.f-puzzles.com/*
// @match		 https://f-puzzles.com/*
// @icon		 data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant		 none
// @run-at		 document-end
// ==/UserScript==



   	      //----------------------------------------------------------------//
  	     //   				  Custom Shortcuts.                            //
	    //                                                                //
  	   //   Edit the 'Shortcut' columns below to customise shortcuts.    // 
	  //   	Valid modifers are 'shift' or 'ctrl' or 'alt'.              //
	 //   	The spacebar can't be used as a shortcut.                  //
 	//    	Do not edit the 'Action' column. Things will break...     //
   //----------------------------------------------------------------//


const shortcuts = {
	general: {
// 		Action 						Shortcut
	 	'Toggle Solver Console': 	'tab',
	 	'Open Constraint Tools': 	't',
	 	'Toggle Selected Tool': 	'g',
	 	'Redo':						'r',
	 	'Undo':						'u',
	 	'Clear':					'shift delete',
	 	'Export':					'shift enter',
	 	'New Grid':					'shift n',
	 	'Cursor Left': 				'h',
	 	'Cursor Down': 				'j',
	 	'Cursor Up': 			  	'k',
	 	'Cursor Right': 			'l'
	},

	console: {
// 		Action 						Shortcut
		'Solution Path':			'?',
		'Step':						'>',
		'Check':					'~',
		'Solution Count':			'#',
		'True Candid.':				'@',
		'Cancel':					'q' 			
	},

	toggleConstraint: {
// 		Action 						Shortcut
	 	'Diagonal +':				'+',
	 	'Diagonal -':				'-',
	 	'Antiknight':				'!',
	 	'Antiking':					'^',
	 	'Disjoint Groups':			'%',
	 	'Nonconsecutive':			'$',
	 	'Regions':					'shift r'
	},

	constraint: {
// 		Action 						Shortcut
		'Open Cosmetic Tools':		't',
		'Arrow':					'a',
		'Between Line':				'b',
		'Clone':					'c',
		'Clock':					'shift c',
		'Difference':				'd',
		'Even':						'e',
		'Extra Region':				'shift e',
		'Thermometer':				'h',
		'Killer Cage':				'k',
		'Little Killer Sum':		'l',
		'Minimum':					'm',
		'Maximum':					'shift m',
		'Odd':						'o',
		'Palindrome':				'p',
		'AntiPalindrome':			'shift p',
		'Weak Palindrome':			'ctrl p',
		'Quadruple':				'q',
		'Renban':					'r',
		'Ratio':					'shift r',
		'Sandwich Sum':				's',
		'Whispers':					'w',
		'Chinese Whispers':			'shift w',
		'XV':						'x',
		'Sum Dot (Intersection)':	'.',
		'Sum Dot (Border)':			'|',
		'Sweeper Cell':				'*'				
	},

	cosmetic: {
// 		Action 						Shortcut
		'Text':						't',
		'Circle':					'c',
		'Rectangle':				'r',
		'Line':						'l',
		'Cage':						'shift c' 		
	}
};


  	  //-------------------------------------------------------------//
 	 // End of user edits.                                          //
	//-------------------------------------------------------------//






let generateShortcutArr = function(type) {
	const scObj = shortcuts[type];
	const scArr = [];

	for (let sc in scObj) {

		if (scObj[sc].includes(' ')) {
			key = scObj[sc].split(' ');
			scArr.push(key[1]);
		} else {
			scArr.push(scObj[sc]);
		}
	}
	uniqueScArr = [...new Set(scArr)];
	return uniqueScArr;
}

let moveCursor = function(dir) {
	var x = selection[selection.length - 1].i;
	var y = selection[selection.length - 1].j;

	switch (dir) {
		case 'up':
			x -= 1;
			break;
		case 'dn':
			x += 1;
			break;
		case 'lt':
			y -= 1;
			break;
		case 'rt':
			y += 1;
			break;
	}

	let newPos = grid[(x + size)%size][(y + size)%size];

	if (event.shiftKey) {
		newPos.select();
		selection.push(selection.splice(selection.indexOf(newPos), 1)[0]);
	} else {
		selection = [newPos];
	}
}

let clickSim = function(sidebar, ref, ifId) {
	const sideb =  sidebars.filter(sb => sb.title === sidebar)[0];
	const button = ifId ? sideb.buttons.filter(b => b.id === ref)[0] : 
								sideb.buttons.filter(b => b.title === ref)[0];

	if (!button) return;

	button.origHov = button.hovering;
	button.hovering = function(){return true};
	button.click();
	button.hovering = button.origHov;
}

let doShortcut = function(ev, key, type) {
	const scObj = shortcuts[type];
	if (!scObj) return;
	let modifier = null;
	let count = 0;

	if (ev.shiftKey) modifier = 'shift';
	else if (ev.ctrlKey) modifier = 'ctrl';
	else if (ev.altKey) modifier = 'alt';

	for (let sc in scObj) {
		let scInclModifier = scObj[sc].includes(modifier) ;
		if (!(modifier && scInclModifier && scObj[sc].endsWith(key)) != !(scObj[sc] === key)) {
			switch (type) {
				case 'general':
					switch (key) {
						case shortcuts.general[count]:
							event.preventDefault();
							clickSim('Main', 'Camera', 'id');
							break;
						case shortcuts.general[count]:
							togglePopup('Constraint Tools');
							break;
						case shortcuts.general[count]:
							if(currentTool === 'Given Digit') setCurrentTool(lastTool);
							else setCurrentTool('Given Digit');
							break;
						case shortcuts.general[count]:
							redo();
							break;
						case shortcuts.general['Undo'].split(' ')[scInclModifier ? 1 : 0]:
							undo();
							break;
						case shortcuts.general['Clear'].split(' ')[scInclModifier ? 1 : 0]:
							clickSim('Main', 'Clear', 'id');
							break;
					}
					break;
				case 'console':
					clickSim('Console', sc);
					break;
				case 'constraint':
				case 'cosmetic':
				case 'toggleConstraint':
					clickSim('Constraints', sc);
					break;
			}
			count++;
		}
	}
}

const generalShortcuts = generateShortcutArr('general');
const constraintShortcuts = generateShortcutArr('constraint');
const consoleShortcuts = generateShortcutArr('console');
const cosmeticShortcuts = generateShortcutArr('cosmetic');
const toggleConstraintShortcuts = generateShortcutArr('toggleConstraint');

(function() {
	'use strict';

	const doShim = function() {

		let origCreateSidebarConstraints = createSidebarConstraints;
		createSidebarConstraints = function() {
			origCreateSidebarConstraints();
			var x = gridX - (sidebarDist + sidebarW/2);
			var y = gridY - buttonLH - buttonGap;

			const constraintsSidebar = sidebars.filter(sb => sb.title === 'Constraints')[0];
			constraintsSidebar.sections.push(new section(x, y, currentTool));
		}

		let origCreateSidebarConsole = createSidebarConsole;
		createSidebarConsole = function() {
			origCreateSidebarConsole();
			var x = gridX + gridSL + (sidebarDist + sidebarW) + (sidebarGap + sidebarW/2);
			var y = gridY - buttonLH - buttonGap;

			const consoleSidebar = sidebars.filter(sb => sb.title === 'Console')[0];
			consoleSidebar.sections.push(new section(x, y, currentTool));
		}

		const prevOnKeyDown = document.onkeydown;
		document.onkeydown = function(event) {
			const key = event.key.toLowerCase();

			if (!event.key ||

				(popup === 'Constraint Tools' &&
				!constraintShortcuts.includes(key)) ||

				(popup === 'Cosmetic Tools' &&
				!cosmeticShortcuts.includes(key)) ||

				(!popup && !toolCosmetics.includes(currentTool) &&
				!(consoleShortcuts.includes(key) || generalShortcuts.includes(key) ||
				  toggleConstraintShortcuts.includes(key))) || 

				disableInputs ||
				testPaused() ||
				toolCosmetics.includes(currentTool) ||
				event.metaKey) 
			{
				prevOnKeyDown(event);
				return;
			}

			event.preventDefault();

			if (!popup && generalShortcuts.includes(key)) {

				doShortcut(event, key, 'general');

				if (selection.length) {
					switch(key) {
						case shortcuts.general['Cursor Left']:
							moveCursor('lt');
							break;
						case shortcuts.general['Cursor Down']:
							moveCursor('dn');
							break;
						case shortcuts.general['Cursor Up']:
							moveCursor('up');
							break;
						case shortcuts.general['Cursor Right']:
							moveCursor('rt');
							break;
					}
				} else {
					selection.push(grid[0][0]);
				}

			} else {
				if (popup === 'Constraint Tools') {
					if (key === shortcuts.constraint['Open Cosmetic Tools']) {
						togglePopup('Cosmetic Tools');
						return;
					}

					doShortcut(event, key, 'constraint');
					closePopups();

				} else if (popup === 'Cosmetic Tools') {
					doShortcut(event, key, 'cosmetic');

				} else if (consoleShortcuts.includes(key)) {
					doShortcut(event, key, 'console');

				} else if (toggleConstraintShortcuts.includes(key)) {
					doShortcut(event, key, 'toggleConstraint');

				}
			}
		}
	}

	let intervalId = setInterval(() => {
		if (!document.onkeydown) {
			return;
		}

		clearInterval(intervalId);
		doShim();
	}, 16);
})();
