(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// * This file should define a Node module that exports a constructor for creating basic flashcards, e.g.:
//   `module.exports = BasicCard;`
var BasicCard = function(front,back,num){
	if (!(this instanceof BasicCard)){
        return new BasicCard(front,back,num);
   	}
// * The constructor should accept two arguments: `front` and `back`.
	this.front = front;
// * The constructed object should have a `front` property that contains the text on the front of the card.
	this.back = back;
// * The constructed object should have a `back` property that contains the text on the back of the card.
	this.num = num;
// * create an id for card
	this.type = 'basic'
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

},{}],2:[function(require,module,exports){
 // * This file should define a Node module that exports a constructor for creating cloze-deletion flashcards, e.g.:
 //    `module.exports = ClozeCard;`

var ClozeCard = function(text,cloze,num){
	if (!(this instanceof ClozeCard)){
        return new ClozeCard(text,cloze,num);
   	}

	var checkMatch = new RegExp(cloze,'gi');
	if(!text.match(checkMatch)){
		console.log("'" + cloze + "' is not part of " + "'" + text + "'");
		return false;
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

	this.type = 'cloze'
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

},{}],3:[function(require,module,exports){
// document ready function
$(document).ready(function(){

    // ---------------- INTIAL VARIABLES ----------------------

    var basic = require('./BasicCard.js');
    var cloze = require('./ClozeCard.js');

    var database;
    var curType;
    var cardContent;
    var curCard;
    var totalCard;
    var userInfo;
    var cardContainer

    // ---------------- Functions ----------------------

    function uploadCardFirebase(){
         // get current type
         console.log(cardContainer,curCard,totalCard)

        // save previous card to firebase
        var curFrontText = $('#front').val().trim();
        var curBackText = $('#back').val().trim();

        if(curType === 'basic'){
            cardContent = basic(curFrontText,curBackText,curCard);
        }
        else if(curType === 'cloze'){
            cardContent = cloze(curFrontText,curBackText,curCard);
        }
        if(!$.isEmptyObject(cardContent)){
             database.ref('users').child(userInfo.uid).child('cards').child(cardContent.num).set(cardContent);
             console.log('card updated to firebase')
             return true;
        }else{
          Materialize.toast('"' + curBackText + '"' + " is not part of " + '"' + curFrontText + '"', 2000)
               return false
        }
    }

    function updatecurContent(){
         // update input fields with card content
         var frontText = $('#text-front-'+curCard).text();
         var backText = $('#text-back-'+curCard).text();

         $('#front').val(frontText);
         $('#back').val(backText);

         // show previous page
       $('#card-'+curCard).show();

       // update card count
       $('.card-count').html(curCard+ '/' + totalCard)

       // refocus front input
       $('#front').focus();
       console.log(curType)

         if(curType  === 'cloze'){
            $('#card-state-basic').css('font-weight','normal');
            $('#card-state-cloze').css('font-weight','bold');
            $('.switch-card').attr('data-state','cloze')

            $('#front-label').text('Full Text');
            $('#back-label').text('Cloze');

         }
         else if(curType === 'basic'){
            $('#card-state-basic').css('font-weight','bold');
            $('#card-state-cloze').css('font-weight','normal');
            $('.switch-card').attr('data-state','basic');

            $('#front-label').text('Front');
            $('#back-label').text('Back');

            curType = 'basic';
         }
     }



    // ---------------- FIREBASE AUTH APPLICATIONS ----------------------

    // Initialize Firebase

    var config = {
        apiKey: "AIzaSyDvRv6pUSPJtsZkyj3tLwRiy6yFJBtRUiU",
        authDomain: "flashcard-2f92f.firebaseapp.com",
        databaseURL: "https://flashcard-2f92f.firebaseio.com",
        projectId: "flashcard-2f92f",
        storageBucket: "flashcard-2f92f.appspot.com",
        messagingSenderId: "449820137874"
    };
    firebase.initializeApp(config);

     // assigning firebase database fn to a variable
     database = firebase.database();

    // sign up with firebase
    function signup(){
        var email = $('#signup-email').val().trim();
        var pass = $('#signup-password').val().trim();

        firebase.auth().createUserWithEmailAndPassword(email,pass)
        .then(function(user){

            // set firebase profile to input name
            user.updateProfile({
                displayName: $('#signup-first_name').val().trim()
            })


            // create initial object with uid in database
            database.ref('users').child(user.uid).set({
                name: user.displayName,
                email: user.email,
                card: {}
            })

            $('#modal-signup').modal('close');
        })
        .catch(function(err){
            console.log(err.message)
        })
    };

    // activate signup on clicking #signup-submit
    $('#signup-submit').click(function(){
        signup()
    })

    // sign in with firebase
    function signin(){
        var email = $('#signin-email').val().trim();
        var pass = $('#signin-password').val().trim();

        firebase.auth().signInWithEmailAndPassword(email,pass)
            .then(function(){
                // reset signin modal to default settings
                $('#modal-signin').modal('close');
                $('#signin-error').val('');
            })
            .catch(function(err){
                console.log(err)
                $('#signin-error').text(err.message)

            })
    };

    // activate signin on clicking #signin-submit
    $('#signin-submit').click(function(){
        signin()
    });

    // sign out with firebase
    function signout(){
        firebase.auth().signOut()
            .then(function(){
                alert('Signout Completed')

            })
    };

    // activate signin on clicking #signin-submit
    $('#signout').click(function(){
        signout()
    });


    // observe state change of user
    firebase.auth().onAuthStateChanged(function(user){
        if(user){
            userInfo = user;
            // Materialize.toast(message, displayLength, className, completeCallback);
            setTimeout(function(){
                Materialize.toast('Hello ' + user.displayName, 4000)
            },500) // 4000 is the duration of the toast

            // hide signin btn/show signout btn
            $('#modal-signin-btn').hide()
            $('#signout').show()

            //initialize flashcard object if new user;
            database.ref('users').child(userInfo.uid).once('value')
            .then(function(snap){
               if(!snap.child('cards').exists()){
                    curType = 'basic'
                    curCard = 1;
                    totalCard = 1;
                    cardContainer = [];

                    // create new card
                    cardContainer[1] = basic('','',curCard);
                    uploadCardFirebase()

                    // create new html wrapper for card
                    var textWrapper = $('<div>');
                    textWrapper.addClass('card-text-wrapper valign-wrapper');
                    textWrapper.attr('id','card-1');

                    // new front
                    var front = $('<p>');
                    front.addClass('card-text card-text-front center');
                    front.attr('id','text-front-1');
                    textWrapper.append(front);

                    // new back
                    var back = $('<p>');
                    back.addClass('card-text card-text-back center');
                    back.attr('id','text-back-1');
                    textWrapper.append(back);

                    $('#flashcard-content').append(textWrapper);
               }
               // else load firebase data
               else{
                    console.log('inside firebase data retrieval')
                    cardContainer = snap.child('cards').val();
                    totalCard = cardContainer.length-1;
                    curCard = totalCard;
                    curType = cardContainer[totalCard].type;
                    console.log('total-card',totalCard)

                    for(i = 1; i <= totalCard; i++){
                         // create new wrapper for card
                         var textWrapper = $('<div>');
                         textWrapper.addClass('card-text-wrapper valign-wrapper');
                         textWrapper.attr('id','card-'+i);

                         // hide all card except the last ones
                         if(i < totalCard){
                              textWrapper.hide();
                         }
                         // new front
                         var front = $('<p>');
                         front.addClass('card-text card-text-front center');
                         front.attr('id','text-front-'+i);
                         front.append(cardContainer[i].front)
                         textWrapper.append(front);

                         // new back
                         var back = $('<p>');
                         back.addClass('card-text card-text-back center');
                         back.attr('id','text-back-'+i);
                         back.append(cardContainer[i].back)
                         textWrapper.append(back);
                         console.log(textWrapper)
                         $('#flashcard-content').append(textWrapper);

                         // update input field
                         if(cardContainer[totalCard].type === 'basic'){
                              front.text(cardContainer[i].front);
                              back.text(cardContainer[i].back);
                         }else if(cardContainer[totalCard].type === 'cloze'){
                              front.text(cardContainer[i].fullText);
                              back.text(cardContainer[i].cloze);
                         }
                    }

                    // update current content
                    updatecurContent()
               }
            })
        }
        else{
            $('#modal-signin-btn').show()
            $('#signout').hide()
        }
    });


    // ---------------- FIREBASE DATABASE APPLICATIONS ---------------------

    // create new card when press right
    $(window).keydown(function(e){
         if(e.altKey && e.which === 39){

             var updated = uploadCardFirebase();
             if(!updated){return}

              if(curCard === totalCard){
                    // hide content
                    $('#card-'+curCard).hide();

                    // increase totalcard & curCard
                    curCard++;
                    totalCard++;

                    // create new card
                    var textWrapper = $('<div>');
                    textWrapper.addClass('card-text-wrapper valign-wrapper');
                    textWrapper.attr('id','card-'+totalCard);

                    // new front
                    var front = $('<p>');
                    front.addClass('card-text card-text-front center');
                    front.attr('id','text-front-'+totalCard);
                    textWrapper.append(front);

                    // new back
                    var back = $('<p>');
                    back.addClass('card-text card-text-back center');
                    back.attr('id','text-back-'+totalCard);
                    textWrapper.append(back);

                    // empty input fields
                    $('#front').val('');
                    $('#back').val('');

                    // append new card to html
                    $('#flashcard-content').prepend(textWrapper);
               }else{
                    // hide current page
                    $('#card-'+curCard).hide();

                    // increase current page by 1
                    curCard++;
                    // update card html
                    updatecurContent()
               }

               // show previous page
              $('#card-'+curCard).show();

              // update card count
              $('.card-count').html(curCard+ '/' + totalCard)

              // refocus front input
              $('#front').focus();
          }

          // show previous card when press left
          if(e.altKey && e.which === 37){
               var updated = uploadCardFirebase();
               if(!updated){return}

               // hide current page
               $('#card-'+curCard).hide();

               if(curCard === 1){
                    // if card is at the first one, go to the last card
                    curCard = totalCard;
                    console.log(curCard,totalCard)
               }else{
        		     // decrease current page by 1
                    curCard--;
               }

               var checkupdate = updatecurContent();
          }
    })
    // update sidenav

    // ---------------- HTML DOM INTERACTIONS ----------------------


    // Initialize collapse button
    $('.button-collapse').sideNav({
        menuWidth: 300, // Default is 300
        edge: 'right', // Choose the horizontal origin
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true, // Choose whether you can drag to open on touch screens,
        }
    );

    // initialize modal DOM
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
    $('#modal-signup-btn').click(function(){
        $('#modal-signup').modal('open');
    })

    // texts on front and back input field show on card
    $('.input-field').keyup(function(e){
        if($('#front').is(':focus')){
            var text = $('#front').val().trim();
            $('#text-front-'+curCard).text(text)
        }
        if($('#back').is(':focus')){
            var text = $('#back').val().trim();
            $('#text-back-'+curCard).text(text)
        }
    })

    // onkeypress function if input field is focused
    $('.input-field').keydown(function(e){
    // change color on alt + 1-4
        if(e.altKey && e.which === 49){
            $('.card-text-wrapper').css('color','red');
        }
        if(e.altKey && e.which === 50){
            $('.card-text-wrapper').css('color','blue');
        }
        if(e.altKey && e.which === 51){
             $('.card-text-wrapper').css('color','green');
        }
        if(e.altKey && e.which === 52){
            $('.card-text-wrapper').css('color','black');
        }

    // change type card of alt + 5
        if(e.altKey && e.which === 53){
            if($('.switch-card').attr('data-state') === 'basic'){
                $('#card-state-basic').css('font-weight','normal');
                $('#card-state-cloze').css('font-weight','bold');
                $('.switch-card').attr('data-state','cloze')

                $('#front-label').text('Full Text');
                $('#back-label').text('Cloze');
                curType = 'cloze';

            }
            else{
                $('#card-state-basic').css('font-weight','bold');
                $('#card-state-cloze').css('font-weight','normal');
                $('.switch-card').attr('data-state','basic');

                $('#front-label').text('Front');
                $('#back-label').text('Back');
                curType = 'basic';
            }
        }

    })

    // Hide front or back if the other is focused
    $('#front').on('focusin', function(){
        $('#text-back-' + curCard).css('display','none');
        $('#text-front-' + curCard).css('display','block');
    });

    $('#back').on('focusin', function(){
        $('#text-back-' + curCard).css('display','block')
        $('#text-front-' + curCard).css('display','none')
    });

    // toggle between front and back on tab
    $('.input-field').keydown(function(e){
        if(e.which === 9){
            if($('#front').is(':focus')){
                e.preventDefault();
                $('#back').focus();
            }
            else{
                e.preventDefault();
                $('#front').focus();
            }
        }
    })
})

},{"./BasicCard.js":1,"./ClozeCard.js":2}]},{},[3]);
