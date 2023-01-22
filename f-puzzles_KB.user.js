// ==UserScript==
// @name         Fpuzzles_KB
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Makes f-puzzles more keyboard-centric
// @author       Ennead
// @match        https://*.f-puzzles.com/*
// @match        https://f-puzzles.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-end
// ==/UserScript==



    //-------------------------------------------------------------------//
    //                                                                   //
    //                        Custom Shortcuts.                          //
    //                                                                   //
    //      Edit the 'Shortcut' columns below to customise shortcuts.    // 
    //      Valid modifiers are 'shift' or 'ctrl' or 'alt'.              //
    //      The spacebar can't be used as a custom shortcut.             //
    //      Do not edit the 'Action' column or change the order.         //
    //                                                                   //
    //-------------------------------------------------------------------//


const shortcuts = {
    general: {
//      Action                      Shortcut
        'Toggle Solver Console':    'tab',
        'Open Constraint Tools':    't',
        'Toggle Selected Tool':     'g',
        'Redo':                     'r',
        'Undo':                     'u',
        'Mode':                     'shift m',
        'Clear':                    'shift delete',
        'Settings':                 'shift s',
        'New Grid':                 'shift n',
        'Export':                   'end',
        'Edit Info':                'insert',
        'Connect':                  'shift enter'
    },

    movement: {
//      Action                      Shortcut
        'Cursor Left':              'h',
        'Cursor Down':              'j',
        'Cursor Up':                'k',
        'Cursor Right':             'l'
    },

    console: {
//      Action                      Shortcut
        'Solution Path':            '?',
        'Step':                     '>',
        'Check':                    '~',
        'Solution Count':           '#',
        'True Candid.':             '@',
        'Cancel':                   'q'             
    },

    toggleConstraint: {
//      Action                      Shortcut
        'Diagonal +':               '+',
        'Diagonal -':               '-',
        'Antiknight':               '!',
        'Antiking':                 '^',
        'Disjoint Groups':          '%',
        'Nonconsecutive':           '$',
        'Regions':                  'shift r'
    },

    constraint: {
//      Action                      Shortcut
        'Open Cosmetic Tools':      't',
        'Arrow':                    'a',
        'Between Line':             'b',
        'Clone':                    'c',
        'Clock':                    'shift c',
        'Difference':               'd',
        'Even':                     'e',
        'Extra Region':             'shift e',
        'Thermometer':              'h',
        'Killer Cage':              'k',
        'Little Killer Sum':        'shift k',
        'Lockout':                  'l',
        'Minimum':                  'm',
        'Maximum':                  'shift m',
        'N-Chain':                  'n',
        'Odd':                      'o',
        'Palindrome':               'p',
        'AntiPalindrome':           'shift p',
        'Weak Palindrome':          'ctrl p',
        'Quadruple':                'q',
        'Renban':                   'r',
        'Ratio':                    'shift r',
        'Sandwich Sum':             's',
        'Whispers':                 'w',
        'Chinese Whispers':         'shift w',
        'XV':                       'x',
        'Sum Dot (Intersection)':   '.',
        'Sum Dot (Border)':         '|',
        'Sweeper Cell':             '*'             
    },

    cosmetic: {
//      Action                      Shortcut
        'Text':                     't',
        'Circle':                   'c',
        'Rectangle':                'r',
        'Line':                     'l',
        'Cage':                     'shift c'       
    }
};


    //-------------------------------------------------------------------//
    //                                                                   //
    //                    Custom Constraint Colours.                     //
    //                                                                   //
    //      Edit the array below to create a custom colour pallette.     //
    //      Uncomment the default colours to use/edit them.              //
    //      There is no limit on the number of colours in a pallette.    //
    //      The pallette can be left empty to only use recent colours.   //
    //                                                                   //
    //-------------------------------------------------------------------//


const customConstraintCols =    [   
                    //  '#839496', '#268BD2', '#6C71C4', '#2AA198', 
                    //  '#859900', '#B58900', '#D33682', '#CB4B16'              
                    ];


                //-------------------------------------//
                //                                     //
                //          End of user edits.         //
                //                                     //
                //-------------------------------------//







let generateShortcutArr = function(type) {
    const scObj = shortcuts[type];
    const scArr = [];

    for (let sc in scObj) {

        if (scObj[sc].includes(' ')) {
            let key = scObj[sc].split(' ');
            scArr.push(key[1]);
        } else {
            scArr.push(scObj[sc]);
        }
    }
    let uniqueScArr = [...new Set(scArr)];
    return uniqueScArr;
}
const generalShortcuts = generateShortcutArr('general');
const movementShortcuts = generateShortcutArr('movement');
const constraintShortcuts = generateShortcutArr('constraint');
const consoleShortcuts = generateShortcutArr('console');
const cosmeticShortcuts = generateShortcutArr('cosmetic');
const toggleConstraintShortcuts = generateShortcutArr('toggleConstraint');

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

let clickSimSidebar = function(sidebar, ref, ifId) {
    const sideb =  sidebars.filter(sb => sb.title === sidebar)[0];
    const button = ifId ? sideb.buttons.filter(b => b.id === ref)[0] : 
                                sideb.buttons.filter(b => b.title === ref)[0];

    if (!button) return;

    button.origHov = button.hovering;
    button.hovering = function(){return true};
    button.click();
    button.hovering = button.origHov;
}

let clickSimButtons = function(ref) {
    const button = buttons.filter(b => b.id === ref)[0];
    if (!button) return;

    button.origHov = button.hovering;
    button.hovering = function(){return true};
    button.click();
    button.hovering = button.origHov;
}

let setNewGrid = function(ev, key) {
    let num = ev.ctrlKey ? (parseInt(key) + 10) : parseInt(key);
    createGrid(num, false, true);
    closePopups();
}

let doShortcut = function(ev, key, type) {
    const scObj = shortcuts[type];
    if (!scObj) return;
    let modifier = null;

    if (ev.shiftKey) modifier = 'shift';
    else if (ev.ctrlKey) modifier = 'ctrl';
    else if (ev.altKey) modifier = 'alt';

    for (let sc in scObj) {
        if (!(modifier && scObj[sc].includes(modifier) && scObj[sc].endsWith(key)) != 
            !(scObj[sc] === key)) {
            switch (type) {
                case 'general':
                    switch (key) {
                        case generalShortcuts[0]:
                            event.preventDefault();
                            clickSimSidebar('Main', 'Camera', 'id');
                            break;
                        case generalShortcuts[1]:
                            togglePopup('Constraint Tools');
                            break;
                        case generalShortcuts[2]:
                            if(currentTool === 'Given Digit') setCurrentTool(lastTool);
                            else setCurrentTool('Given Digit');
                            break;
                        case generalShortcuts[3]:
                            redo();
                            break;
                        case generalShortcuts[4]:
                            undo();
                            break;
                        case generalShortcuts[5]:
                            clickSimSidebar('Main', 'Mode', 'id');
                            break;
                        case generalShortcuts[6]:
                            clickSimSidebar('Main', 'Clear', 'id');
                            break;
                        case generalShortcuts[7]:
                            clickSimSidebar('Constraints', 'Settings');
                            break;
                        case generalShortcuts[8]:
                            clickSimSidebar('Constraints', 'New Grid');
                            break;
                        case generalShortcuts[9]:
                            clickSimSidebar('Constraints', 'Export');
                            break;
                        case generalShortcuts[10]:
                            clickSimButtons('EditInfo');
                            break;
                        case generalShortcuts[11]:
                            clickSimButtons('Connect');
                            break;
                    }
                    break;
                case 'console':
                    if (!buttons.filter(b => b.title === 'Disconnect')[0]) break;
                    clickSimSidebar('Console', sc);
                    break;
                case 'constraint':
                case 'cosmetic':
                case 'toggleConstraint':
                    clickSimSidebar('Constraints', sc);
                    break;
            }
        }
    }
}

let checkHex = function(str) {
    const hexChars = '#0123456789abcdefABCDEF';
    for (let i = 0; i < str.length; i++) {
        if (hexChars.includes(str[i])) continue;
        return false;
    }
    return (str.length === 7 ? true : false);
}

const colArr = customConstraintCols;
colArr.splice(0, 0, '#FFFFFF', '#000000');
let storeCol = function(colInput) {
    let col = document.getElementById(colInput).value;
    if (checkHex(col) && !colArr.includes(col)) 
        colArr.push(col);
    console.log('store');
}

let cycleCol = function(elem)  {
    let nextCol = colArr.indexOf(elem.value) + 1;
    elem.value = (nextCol < colArr.length) ? colArr[nextCol] : colArr[0];
}

document.getElementById('baseC').addEventListener('focusout', (event) => storeCol('baseC'));
document.getElementById('outlineC').addEventListener('focusout', (event) => storeCol('outlineC'));
document.getElementById('fontC').addEventListener('focusout', (event) => storeCol('fontC'));
const colInputs = ['baseC', 'fontC', 'outlineC'];

(function() {
    'use strict';

    const doShim = function() {


        const prevOnKeyDown = document.onkeydown;
        document.onkeydown = function(event) {
            const key = event.key.toLowerCase();
            const elem = document.activeElement;

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

            if (key === ' ' && colInputs.includes(elem.id)) cycleCol(elem);

            if (!event.key ||

                (popup === 'Constraint Tools' &&
                !constraintShortcuts.includes(key)) ||

                (popup === 'Cosmetic Tools' &&
                !cosmeticShortcuts.includes(key)) ||

				(popup === 'Export') ||

                (popup === 'New Grid' && 
                !['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) ||

                (!popup && !toolCosmetics.includes(currentTool) &&
                !(consoleShortcuts.includes(key) || generalShortcuts.includes(key) ||
                  toggleConstraintShortcuts.includes(key) || movementShortcuts.includes(key))) || 

                (popup === 'Edit Info') ||
                toolCosmetics.includes(currentTool) ||
                disableInputs ||
                testPaused() ||
                event.metaKey) 
            {
                prevOnKeyDown(event);
                return;
            }

            event.preventDefault();

            if (!popup && movementShortcuts.includes(key)) {
                if (selection.length) {
                    switch(key) {
                        case shortcuts.movement['Cursor Left']:
                            moveCursor('lt');
                            break;
                        case shortcuts.movement['Cursor Down']:
                            moveCursor('dn');
                            break;
                        case shortcuts.movement['Cursor Up']:
                            moveCursor('up');
                            break;
                        case shortcuts.movement['Cursor Right']:
                            moveCursor('rt');
                            break;
                    }
                } else {
                    selection.push(grid[0][0]);
                }
            }

            if (!popup && generalShortcuts.includes(key)) {
                doShortcut(event, key, 'general');

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

                } else if (popup === 'New Grid') {
                    setNewGrid(event, key);

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
