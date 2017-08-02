// document ready function
$(document).ready(function(){

    // ---------------- INTIAL VARIABLES ----------------------

    var basic = require('./BasicCard.js');
    var cloze = require('./ClozeCard.js');

    var database;
    var curType;
    var curColor = 'black';
    var cardContent;
    var curCard;
    var totalCard;
    var userInfo;
    var cardContainer;

    // ---------------- Functions ----------------------
    function createInitialCard(){
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

    function uploadCardFirebase(){
         // get current type
         console.log(curType)
        // save previous card to firebase
        var curFrontText = $('#front').val().trim();
        var curBackText = $('#back').val().trim();

        if(curType === 'basic'){
            cardContent = basic(curFrontText,curBackText,curCard,curColor);
        }
        else if(curType === 'cloze'){
            cardContent = cloze(curFrontText,curBackText,curCard,curColor);
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
        console.log(cardContainer[curCard]);
        console.log(curCard);
        curType = cardContainer[curCard].type;
         // update input fields with card content
         if (curType === 'basic'){
              var frontText = cardContainer[curCard].front;
              var backText = cardContainer[curCard].back;
         }
         if (curType === 'cloze'){
              var frontText = cardContainer[curCard].fullText;
              var backText = cardContainer[curCard].cloze;
         }
         // update curType
         curType = cardContainer[curCard].type;
         // update input fields
         $('#front').val(frontText);
         $('#back').val(backText);

         // show previous page
       $('#card-'+curCard).show();

       // update card count
       $('.card-count').html(curCard+ '/' + totalCard)

       // refocus front input
       $('#front').focus();

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
            $('#flashcard-content').empty();
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
                    uploadCardFirebase();
                    createInitialCard();
               }
               // else load firebase data
               else{
                    cardContainer = snap.child('cards').val();
                    totalCard = cardContainer.length-1;
                    curCard = totalCard;
                    curType = cardContainer[totalCard].type;
                    console.log(cardContainer)

                    for(i = 1; i <= totalCard; i++){
                         // create new wrapper for card
                         var textWrapper = $('<div>');
                         textWrapper.addClass('card-text-wrapper valign-wrapper');
                         textWrapper.attr('id','card-'+i);
                         textWrapper.css('color',cardContainer[i].color);
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

          // update cardContainer on change of any child of user cards
          database.ref('users').child(userInfo.uid).child('cards').on('value', function(snap){
               cardContainer = snap.val()
               console.log(cardContainer)
            })
        }
        else{
          // if user is not signed in
            $('#modal-signin-btn').show();
            $('#signout').hide();

            curType = 'basic';
            curCard = 1;
            totalCard = 1;
            cardContainer = [];
            $('#flashcard-content').empty();
            createInitialCard();

            $('.card-count').text('1/1')
            $('#front').val('');
            $('#back').val('');
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
               }else{
        		     // decrease current page by 1
                    curCard--;
               }

               updatecurContent();
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
        if(curType === 'basic'){
             if($('#front').is(':focus')){
                 var text = $('#front').val().trim();
                 $('#text-front-'+curCard).text(text)
             }
             if($('#back').is(':focus')){
                 var text = $('#back').val().trim();
                 $('#text-back-'+curCard).text(text)
            }
       }

       if(curType === 'cloze'){
            if($('#front').is(':focus')){
               var text = $('#front').val().trim().toLowerCase();
               var cloze = $('#back').val().trim().toLowerCase();
               var partial = text.replace(cloze,'...');
               $('#text-front-'+curCard).text(partial)

            }
            if($('#back').is(':focus')){
               var text = $('#back').val().trim();
               $('#text-back-'+curCard).text(text)
          }
     }
    })

    // onkeypress function if input field is focused
    $('.input-field').keydown(function(e){
    // change color on alt + 1-4
        if(e.altKey && e.which === 49){
            $('#card-' + curCard).css('color','red');
            curColor = 'red';
        }
        if(e.altKey && e.which === 50){
            $('#card-' + curCard).css('color','blue');
            curColor = 'blue';
        }
        if(e.altKey && e.which === 51){
             $('#card-' + curCard).css('color','green');
             curColor = 'green';
        }
        if(e.altKey && e.which === 52){
            $('#card-' + curCard).css('color','black');
            curColor = 'black';
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
                database.ref('users').child(userInfo.uid).child('cards').child(curCard).update({'type':curType})

            }
            else if($('.switch-card').attr('data-state') === 'cloze'){
                $('#card-state-basic').css('font-weight','bold');
                $('#card-state-cloze').css('font-weight','normal');
                $('.switch-card').attr('data-state','basic');

                $('#front-label').text('Front');
                $('#back-label').text('Back');

                curType = 'basic';
                database.ref('users').child(userInfo.uid).child('cards').child(curCard).update({'type':curType})
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
