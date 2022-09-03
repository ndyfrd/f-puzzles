//
// ==UserScript==
// @name		 Fpuzzles-KB
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

		let clickSim = function(sidebar, ref, isTitle) {
			const sideb = sidebars.filter(sb => sb.title === sidebar)[0];
			let button = null;

			if (!isTitle) button = sideb.buttons.filter(b => b.id === ref)[0];
			else button = sideb.buttons.filter(b => b.title === ref)[0];

			if (!button) return;

			button.origHov = button.hovering;
			button.hovering = function(){return true};
			button.click();
			button.hovering = button.origHov;
		}

		let tabbed = 0;
		const prevOnKeyDown = document.onkeydown;
		document.onkeydown = function(event) {
			const key = event.key.toLowerCase();
			
			if (key === 'tab' && !popup) {
				event.preventDefault();
				if (tabbed) {
					setCameraX(0);
					tabbed = 0;
				} else {
					setCameraX(cameraMoveAmount);
					tabbed = 1;
				}
			}

			if (!event.key ||

				(popup === 'Constraint Tools' &&
				!['a', 'b', 'c', 'd', 'e', 'h', 'k', 'l', 'm', 'o', 'p', 'q', 
				  'r', 's', 't', 'w', 'x', '.', '|', '*'].includes(key)) ||

				(popup === 'Cosmetic Tools' &&
				!['c', 'l', 'r', 't', 'w'].includes(key)) ||

				(!popup && !tabbed && !toolCosmetics.includes(currentTool) &&
				!['g', 'h', 'j', 'k', 'l', 'r', 't', 'u', 'delete'].includes(key)) ||

				(tabbed &&
				!['?', '>', '#', '@', '!', 'q', 'delete'].includes(key)) ||
				
				disableInputs ||
				testPaused() ||
				toolCosmetics.includes(currentTool) ||
				event.ctrlKey ||
				event.altKey ||
				event.metaKey) 
			{
				prevOnKeyDown(event);
				return;
			}

			event.preventDefault();
			
			if (popup === 'Constraint Tools') {
				if (key === 't') {
					togglePopup('Cosmetic Tools');
					return;
				}

				switch (key) {
					case 'a': 
						setCurrentTool('Arrow');
						break;
					case 'b': 
						setCurrentTool('Between Line');
						break;
					case 'c': 
						if (event.shiftKey) setCurrentTool('Clock');
						else setCurrentTool('Clone');
						break;
					case 'd': 
						setCurrentTool('Difference');
						break;
					case 'e': 
						setCurrentTool('Even');
						break;
					case 'h': 
						setCurrentTool('Thermometer');
						break;
					case 'k': 
						setCurrentTool('Killer Cage');
						break;
					case 'l': 
						setCurrentTool('Little Killer Sum');
						break;
					case 'm': 
						if (event.shiftKey) setCurrentTool('Maximum');
						else setCurrentTool('Minimum');
						break;
					case 'o': 
						setCurrentTool('Odd');
						break;
					case 'p': 
						if (event.shiftKey) setCurrentTool('AntiPalindrome');
						else if (event.ctrlKey) setCurrentTool('Weak Palindrome');
						else setCurrentTool('Palindrome');
						break;
					case 'q': 
						setCurrentTool('Quadruple');
						break;
					case 'r': 
						if (event.shiftKey) setCurrentTool('Ratio');
						else setCurrentTool('Renban');
						break;
					case 's': 
						setCurrentTool('Sandwich Sum');
						break;
					case 'w': 
						if (event.shiftKey) setCurrentTool('Chinese Whispers');
						else setCurrentTool('Whispers');
						break;
					case 'x': 
						if (event.shiftKey) setCurrentTool('XV');
						else setCurrentTool('Extra Region');
						break;
					case '.': 
						setCurrentTool('Sum Dot (Intersection)');
						break;
					case '|': 
						setCurrentTool('Sum Dot (Border)');
						break;
					case '*': 
						setCurrentTool('Sweeper Cell');
						break;
				}
				closePopups();

			} else if (popup === 'Cosmetic Tools') {
				switch (key) {
					case 'c': 
						if (event.shiftKey) clickSim('Constraints', 'Cage');
						else clickSim('Constraints', 'Circle');
						break;
					case 'l': 
						clickSim('Constraints', 'Line');
						break;
					case 'r': 
						clickSim('Constraints', 'Rectangle');
						break;
					case 't': 
						clickSim('Constraints', 'Text');
						break;
				}

			} else if (tabbed) {
				switch(key) {
					case '?': 
						clickSim('Console', 'SolvePath');
						break;
					case '>': 
						clickSim('Console', 'SolveStep');
						break;
					case '#': 
						clickSim('Console', 'CountSolutions');
						break;
					case '@': 
						clickSim('Console', 'TrueCandidates');
						break;
					case '!': 
						clickSim('Console', 'CheckUnique');
						break;
					case 'q': 
						clickSim('Console', 'Cancel', 'title');
						break;
					case 'delete':
						if (event.shiftKey) clickSim('Main', 'Clear');
						break;
				}

			} else if (['h', 'j', 'k', 'l'].includes(key)) {
				if (selection.length) {
					switch(key) {
						case 'h': 
							moveCursor('lt');
							break;
						case 'j': 
							moveCursor('dn');
							break;
						case 'k': 
							moveCursor('up');
							break;
						case 'l': 
							moveCursor('rt');
							break;
					}
				} else {
					selection.push(grid[0][0]);
				}

			} else { 
				switch (key) {
					case 'g':
						if(currentTool === 'Given Digit') setCurrentTool(lastTool);
						else setCurrentTool('Given Digit');
						break;
					case 'r':
						redo();
						break;
					case 't':
						togglePopup('Constraint Tools');
						break;
					case 'u':
						undo();
						break;
					case '@': 
						clickSim('Console', 'TrueCandidates');
						break;
					case 'delete':
						if (event.shiftKey) clickSim('Main', 'Clear');
						break;

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
