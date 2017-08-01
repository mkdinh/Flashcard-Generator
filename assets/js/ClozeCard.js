 // * This file should define a Node module that exports a constructor for creating cloze-deletion flashcards, e.g.:
 //    `module.exports = ClozeCard;`

var ClozeCard = function(text,cloze,num){

	if (!(this instanceof ClozeCard)){
        return new ClozeCard(text,cloze);
   	}

	var checkMatch = new RegExp(cloze,'gi'); 
	if(!text.match(checkMatch)){
		console.log("'" + cloze + "' is not part of " + "'" + text + "'");
		return;
	}
//  * The constructor should throw or log an error when the cloze deletion does _not_ appear in the input text.
	
//  * Use prototypes to attach these methods, wherever possible.
//  * The constructor should accept two arguments: `text` and `cloze`.
	this.cloze = cloze;
//  * The constructed object should have a `cloze` property that contains _only_ the cloze-deleted portion of the text.
	this.partial = text.replace(cloze,' ... ');
//  * The constructed object should have a `partial` property that contains _only_ the partial text.
	this.fullText = text;
//  * The constructed object should have a `fullText` property that contains _only_ the full text.
	this.num = num;
}

//  var firstPresidentCloze = ClozeCard(
//     "George Washington was the first president of the United States.", "George Washington");

// // "George Washington"
// console.log(firstPresidentCloze.cloze); 

// // " ... was the first president of the United States.
// console.log(firstPresidentCloze.partial); 

// // "George Washington was the first president of the United States.
// console.log(firstPresidentCloze.fullText); 

// // Should throw or log an error because "oops" doesn't appear in "This doesn't work"
// var brokenCloze = ClozeCard("This doesn't work", "oops");
// console.log(brokenCloze)
module.exports = ClozeCard;