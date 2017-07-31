(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// * This file should define a Node module that exports a constructor for creating basic flashcards, e.g.:
//   `module.exports = BasicCard;`
var BasicCard = function(front,back){
// * The constructor should accept two arguments: `front` and `back`.
	this.front = front;
// * The constructed object should have a `front` property that contains the text on the front of the card.
	this.back = back;
// * The constructed object should have a `back` property that contains the text on the back of the card.
}
//   ex: 

// var firstPresident = new BasicCard(
//  "Who was the first president of the United States?", "George Washington");

// "Who was the first president of the United States?"
// console.log(firstPresident.front); 

// "George Washington"
// console.log(firstPresident.back); 

module.exports = BasicCard;
},{}],2:[function(require,module,exports){
 // * This file should define a Node module that exports a constructor for creating cloze-deletion flashcards, e.g.:
 //    `module.exports = ClozeCard;`

var ClozeCard = function(text,cloze){

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
// ---------------- INTIAL VARIABLES ----------------------

var basic = require('./BasicCard.js');
var cloze = require('./ClozeCard.js');

var database;
var curCard = 1;
var totalCard = 1;
var userInfo;

// document ready function
$(document).ready(function(){


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
            console.log(user)
            userInfo = user;
            // Materialize.toast(message, displayLength, className, completeCallback);
            setTimeout(function(){
                Materialize.toast('Hello ' + user.displayName, 4000)
            },500) // 4000 is the duration of the toast
            
            // hide signin btn/show signout btn
            $('#modal-signin-btn').hide()
            $('#signout').show()

            //initialize flashcard object if new user;

        }
        else{
            $('#modal-signin-btn').show()
            $('#signout').hide()
        }
    });


    // ---------------- FIREBASE DATABASE APPLICATIONS ----------------------

    // assigning firebase database fn to a variable
    database = firebase.database();

    // create new card when press right
    $(window).keydown('alt',function(e){
        if(e.which === 39){
            if(curCard === totalCard){

            // create new wrapper for card
            var textWrapper = $('<div>');
            textWrapper.addClass('card-text-wrapper valign-wrapper');
            textWrapper.attr('id','card-'+totalCard)

            // new front
            var front = $('<p>');
            front.addClass('card-text card-text-front center');
            front.attr('id','text-front-'+totalCard)
            textWrapper.append(front)

            // new back
             var back = $('<p>');
            back.addClass('card-text card-text-back center');
            back.attr('id','text-back-'+totalCard)
            textWrapper.append(back)

            }else{

            }
        }

    // show previous card when press left
        if(e.which === 37){

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
    $('.input-field').keydown(function(e){
        if($('#front').is(':focus')){
            var text = $('#front').val().trim();
            $('#text-front-'+curCard).text(text)
        }
        if($('#back').is(':focus')){
            var text = $('#back').val().trim();
            console.log(text)
            $('#text-back-'+curCard).text(text)
        }
    })

    // onkeypress function if input field is focused
    $('.input-field').keydown('alt', function(e){
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
        if(e.which === 53)  {
            console.log(e.which)
            if($('.switch-card').attr('data-state') === 'basic'){  
                $('#card-state-basic').css('font-weight','normal');
                $('#card-state-cloze').css('font-weight','bold');
                $('.switch-card').attr('data-state','cloze')
            }
            else{
                $('#card-state-basic').css('font-weight','bold');
                $('#card-state-cloze').css('font-weight','normal');
                $('.switch-card').attr('data-state','basic')
            }
        }

    })

    // Hide front or back if the other is focused
    $('#front').is(':focus', function(){
        console.log('inside function fosuced')
        $('#text-back-' + curCard).css('display','none');
        $('#text-front-' + curCard).css('display','block');
    });

    $('#back').is(':focus', function(){
        $('#text-back-' + curCard).css('display','none')
        $('#text-front-' + curCard).css('display','block')
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
