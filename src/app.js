// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// dependencies
const md = require('./markdown');
var fs = require('fs');
const DAO = require('./DAO');
const tree = require('./tree');
const util = require('./util');
const searchEngine = require('./searchEngine');
var Split = require('split.js')

// anchor objects
const markedWrapper = document.getElementById("marked")
const treeView = document.getElementById('tree-view');

var treeViewList = document.createElement('ul');
var p =  document.createElement('div');
var commandLine = document.getElementById('command-line');
var commandLinePopUp = document.getElementById('command-line__popup')

markedWrapper.appendChild(p);

var notePaths = DAO.getNotePaths();
var currentNote = DAO.getConfig()['currentNote'];
if (currentNote) {
  selectNote(currentNote)
}

var treeList = tree.getFileList(notePaths, clickTreeNote);
treeView.appendChild(treeList);

commandLine.addEventListener('keydown', function (e) {
  if (e.which == 9) {
    e.preventDefault();
    console.log("autocomplete");
  } else if (e.which == 13) {
    console.log("return");
  } else if (e.which == 40) {
    console.log("move to list");
  }
});

function getSearchResultsAsUl(results) {
  ul = document.createElement('ul')
  ul.classList.add('popup__list')
  results.forEach(function(el){
    li = document.createElement('li');
    li.classList.add('popup__list-item')
    li.addEventListener('click', function(e){console.log("FOO");selectNote(el.note.path)});
    li.innerHTML = el.note.path.file
    ul.appendChild(li)
  });
  return ul
}

commandLine.onblur = function(){ commandLinePopUp.classList.remove('shown')}

commandLine.oninput = function(){
  text = commandLine.value;
  results = searchEngine.findWithString(text, notePaths.map(function(note){
    return {
      path: note,
      content: DAO.loadNote(note)
    }
  }))
  if (results && results.length) {
    commandLinePopUp.classList.add('shown');
    util.removeAllChildren(commandLinePopUp);
    commandLinePopUp.appendChild(getSearchResultsAsUl(results));
  } else {
    commandLinePopUp.classList.remove('shown')
  }
}

var leftPane = document.getElementById('left-pane');
var rightPane = document.getElementById('right-pane');

Split([leftPane, rightPane], {
  sizes: [20, 80],
  minSize: [100, 300],
  gutterSize: 5,
})

function clickTreeNote(ev) {
    path = ev.target.getAttribute('note-path')
    selectNote(path)
}

function selectNote(notePath) {
  raw = DAO.loadNote(notePath)
  p = md.markdown(raw)
  markedWrapper.removeChild(markedWrapper.firstChild)
  markedWrapper.appendChild(p)
  DAO.setConfig("currentNote", notePath);
  currentNote = notePath
}

module.exports = {
  close() {
    DAO.setConfig("currentNote", currentNote);
  }
}
