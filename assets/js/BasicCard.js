
// * This file should define a Node module that exports a constructor for creating basic flashcards, e.g.:
//   `module.exports = BasicCard;`
var BasicCard = function(front,back,num,color){
	if (!(this instanceof BasicCard)){
        return new BasicCard(front,back,num,color);
   	}
// * The constructor should accept two arguments: `front` and `back`.
	this.front = front;
// * The constructed object should have a `front` property that contains the text on the front of the card.
	this.back = back;
// * The constructed object should have a `back` property that contains the text on the back of the card.
	this.num = num;
// * create an id for card
	this.type = 'basic';

	this.color = color
}
//   ex:

// var firstPresident = new BasicCard(
//  "Who was the first president of the United States?", "George Washington",1);

// console.log(firstPresident)
// "Who was the first president of the United States?"
// console.log(firstPresident.front);

// "George Washington"
// console.log(firstPresident.back);

module.exports = BasicCard;
