/*
  auth: AJ Boyd
  date: 7/16/23
  desc: this is a webgame that plays Hangman!
*/

//global variables
var hangman; //the hangman object
const click = new Sound('Media/Sounds/click.wav'); //click sound effect
const win = new Sound('Media/Sounds/win.wav'); //win sound effect
const lose = new Sound('Media/Sounds/lose.wav'); //lose sound effect

//sound class
function Sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

//word class
class Word{
  constructor(w, h){
    this.word = w;
    this.hint = h;
  }
}

//hangman class
class Hangman{
  constructor(wb){
    this.wordbank = wb; //the list of potential clues (Wod objects)
    this.word = ""; //the selected clue
    this.stage = 1; //the stage of the hanged man
    this.guessed = []; //the list of guessed letters
    this.flag = false; //a flag indicating if a letter has been correctly guessed
    this.gameover = false; //a flag indicating if the game is over
    this.correct = 0; //the number of correct letters guessed
  }

  //sorts the Words in the wordbank into the appropriate categories
  sortWords(){
    for(var i = 0; i < this.wordbank.length; i++){
      //get word and hint
      this.wordbank[i] = this.wordbank[i].trim();
      var word = this.wordbank[i].substring(0, this.wordbank[i].indexOf("|"));
      var hint = this.wordbank[i].substring(1 + this.wordbank[i].indexOf("|"));

      //sorting into categories
      if(hint == "noun")
        this.wordbank[i] = new Word(word, "Noun");
      else if(hint == "verb")
        this.wordbank[i] = new Word(word, "Verb");
      else if(hint == "adj")
        this.wordbank[i] = new Word(word, "Adjective");
      else if(hint == "vehicle")
        this.wordbank[i] = new Word(word, "Vehicles & Transportation");
      else if(hint == "govt")
        this.wordbank[i] = new Word(word, "Government, Politics & Law");
      else if(hint == "family")
        this.wordbank[i] = new Word(word, "Family Life");
      else if(hint == "art")
        this.wordbank[i] = new Word(word, "Art");
      else if(hint == "nature")
        this.wordbank[i] = new Word(word, "Nature & Science");
      else if(hint == "feeling")
        this.wordbank[i] = new Word(word, "Feeling");
      else if(hint == "bad")
        this.wordbank[i] = new Word(word, "Bad Thing");
      else if(hint == "good")
        this.wordbank[i] = new Word(word, "Good Thing");
      else if(hint == "fun")
        this.wordbank[i] = new Word(word, "Fun & Entertainment");
      else if(hint == "weapon")
        this.wordbank[i] = new Word(word, "Weapons & Warfare");
      else if(hint == "food")
        this.wordbank[i] = new Word(word, "Food");
      else if(hint == "obj")
        this.wordbank[i] = new Word(word, "Object");
      else if(hint == "time")
        this.wordbank[i] = new Word(word, "Time/Date");
      else if(hint == "occupation")
        this.wordbank[i] = new Word(word, "Occupation");
      else if(hint == "place")
        this.wordbank[i] = new Word(word, "Place");
      else if(hint == "study")
        this.wordbank[i] = new Word(word, "Study");
      else if(hint == "organism")
        this.wordbank[i] = new Word(word, "Living Organism");
      else{
        //this shouldn't happen
        this.wordbank[i] = new Word(word, "???");
        console.log("ERROR WITH WORD: " + word + " @ INDEX: " + i + " (hint): " + hint );
      }
    }
  }
  //initalizes the word property by randomly selecting a word from the wordbank
  chooseWord(){
    var index = Math.floor(Math.random() * this.wordbank.length);
    console.log(index)
    this.word = this.wordbank[index].word.toUpperCase();
    console.log(this.word)
    this.styleWord();
    document.getElementById("hint").innerText = this.wordbank[index].hint;
  }

  //styles the clue word on the screen
  styleWord(){
    var wordElem = document.getElementById("word");
    for(var i = 0; i < this.word.length; i++){
      let letterElem = document.createElement("button"); //create new element representing a letter in the clue word
      letterElem.classList.add("clueLetter");
      letterElem.id = "clue" + i;
      wordElem.appendChild(letterElem); //put it on screen
    }
  }
  
  //a user guesses a letter in the clue word
  guess(letter){
    var elem = document.getElementById(letter); //get the HTML element of the selected letter
    if(!elem.classList.contains("selected")){
      elem.classList.add("selected"); //add it to the selected 
      for(var i = 0; i < this.word.length; i++){
        console.log(letter + " " + this.word[i])
        if(letter == this.word[i]){
          elem.classList.add("correct"); //add to correct class
          hangman.flag = true; //raise correct flag
          document.getElementById("clue" + i).innerText = letter; //reveal correct letter in the clue
          this.correct++;

          //if player guesses all letters, the game ends in victory
          if(this.correct == this.word.length){
            win.play();
            this.gameover = true;
            document.getElementById("title").innerText = "You won!";
            document.getElementById("playAgain").style.display = "block";
          }
        }
      }
      //if flag has not been raised, letter is incorrect
      if(!hangman.flag){
        elem.classList.add("wrong");
        this.advanceStage();
      }
      hangman.flag = false; //reset correct flag
    }
  }

  //advances the stage of the hanged man
  advanceStage(){
    var hangedman = document.getElementById("hangman");
    this.stage++;
    hangedman.style.backgroundImage = "url('Media/Images/stage" + this.stage + ".png')";
    if(this.stage == 7){
      this.endGame();
    }
  }

  //end game in case of losing
  endGame(){
    lose.play();
    this.revealWord();
    this.gameover = true;
    document.getElementById("title").innerText = "You lost! The word was: " + this.word + ".";
    document.getElementById("playAgain").style.display = "block";
  }

  revealWord(){
    var letters = document.getElementsByClassName("clueLetter");
    for(var i = 0; i < letters.length; i++){
      if(letters[i].innerText == ""){
        letters[i].style.color = "red";
        letters[i].innerText = this.word[i];
      }
    }
  }
}

//read in words from text file using asynchronous fetch request
async function fetchWordArray() {
  try {
    const response = await fetch('words.txt');
    const data = await response.text();
    const wordArray = data.split('\n'); //the wordbank of hangman clues
    return wordArray;
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
}

fetchWordArray()
  .then(wordArray => {
    //start games
    start(wordArray);
  })
  .catch(error => {
    // Handle the error
  });

//wrapper functions
function start(wordArray){
  hangman = new Hangman(wordArray);
  hangman.sortWords();
  hangman.chooseWord();
}

function guess(letter){
  if(hangman.gameover == false){
    click.play();
    hangman.guess(letter);
  }
}