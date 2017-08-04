// document ready function
$(document).ready(function(){

    // ---------------- INTIAL VARIABLES ----------------------

    var basic = require('./BasicCard.js');
    var cloze = require('./ClozeCard.js');

    var database;
    var cardContent;
    var curCard;
    var curInfo;
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
        // save previous card to firebase
        curInfo.front = $('#front').val().trim();
        curInfo.back = $('#back').val().trim();
        if(curInfo.type === 'basic'){
            cardContent = basic(curInfo.front,curInfo.back,curCard,curInfo.color);
        }
        else if(curInfo.type === 'cloze'){
            cardContent = cloze(curInfo.front,curInfo.back,curCard,curInfo.color);
        }

        console.log(cardContent)

        if(userInfo){
            if(!$.isEmptyObject(cardContent)){
                 database.ref('users').child(userInfo.uid).child('cards').child(cardContent.num).set(cardContent);
                 return true;
            }else{
              Materialize.toast('"' + curInfo.back + '"' + " is not part of " + '"' + curInfo.front + '"', 2000)
                   return false
            }
        }else{
            cardContainer[curCard] = cardContent;
            return true
        }
    }

    function updatecurContent(){
        curInfo = cardContainer[curCard];
        curInfo.type = cardContainer[curCard].type;

         // update input fields with card content
         if (curInfo.type === 'basic'){
              var front = cardContainer[curCard].front;
              var back = cardContainer[curCard].back;
         }
         if (curInfo.type === 'cloze'){
              var front = cardContainer[curCard].fullText;
              var back = cardContainer[curCard].cloze;
         }
         // update curType
         curInfo.type = cardContainer[curCard].type;

         // update CurColor
         curInfo.color = cardContainer[curCard].color;

         // update input fields
         $('#front').val(front);
         $('#back').val(back);

         // show previous page
         $('#card-'+curCard).show();

         // update card count
         $('.card-count').html(curCard+ '/' + totalCard)

         // refocus front input
         $('#front').focus();

         if(curInfo.type  === 'cloze'){
            $('#card-state-basic').css('font-weight','normal');
            $('#card-state-cloze').css('font-weight','bold');
            $('.switch-card').attr('data-state','cloze')

            $('#front-label').text('Full Text');
            $('#back-label').text('Cloze');

         }
         else if(curInfo.type === 'basic'){
            $('#card-state-basic').css('font-weight','bold');
            $('#card-state-cloze').css('font-weight','normal');
            $('.switch-card').attr('data-state','basic');

            $('#front-label').text('Front');
            $('#back-label').text('Back');

            curInfo.type = 'basic';
         }
     }

    function createCard(){
        // hide current card
        $('#card-'+curCard).hide();

        // increase totalcard & curCard and set current card to max cards
        totalCard++;
        curCard = totalCard;

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

        if(userInfo){
            // if logged in create new card object to firebase
            uploadCardFirebase();
        }else{
            // else push object into local array
            if(curInfo.type === 'basic'){
            cardContent = basic('','',curCard,curInfo.color);
            cardContainer.push(cardContent);
            }
            else if(curInfo.type === 'cloze'){
                cardContent = cloze('','',curCard,curInfo.color);
                cardContainer.push(cardContent);
            }
        }
    }

    function moveRight(){
        var updated = uploadCardFirebase();
        if(!updated){return}

        if(curCard === totalCard){
            // hide content
            $('#card-'+curCard).hide();

            // set current card to max card
            curCard = 1;
            }else{
                // hide current page
                $('#card-'+curCard).hide();

                // increase current page by 1
                curCard++;
            }

            // update card html
            updatecurContent()

            // show previous page
            $('#card-'+curCard).show();

            // update card count
            $('.card-count').html(curCard+ '/' + totalCard)

            // refocus front input
            $('#front').focus();
    }

    function moveLeft(){
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
                Materialize.toast('Hello ' + user.displayName, 3000)
            },500) // 4000 is the duration of the toast

            // hide signin btn/show signout btn
            $('#modal-signin-btn').hide()
            $('#signout').show()

            //initialize flashcard object if new user;
            database.ref('users').child(userInfo.uid).once('value')
            .then(function(snap){
               if(!snap.child('cards').exists()){
                    curInfo.type = 'basic';
                    curCard = 1;
                    totalCard = 1;
                    cardContainer = [];
                    curInfo.color = 'black';

                    // create new card
                    cardContainer[1] = basic('','',curCard,curInfo.color);
                    uploadCardFirebase();
                    createInitialCard();
                    setTimeout(function(){
                        Materialize.toast('Click on the question icon for shortkeys',5000)
                    },4000)
               }
               // else load firebase data
               else{
                    cardContainer = snap.child('cards').val();
                    totalCard = cardContainer.length-1;
                    curCard = totalCard;
                    curInfo = cardContainer[curCard];

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

                         // new back
                         var back = $('<p>');
                         back.addClass('card-text card-text-back center');
                         back.attr('id','text-back-'+i);

                         if(cardContainer[i].type === 'basic'){
                            front.text(cardContainer[i].front);
                            back.text(cardContainer[i].back);
                         }
                         if(cardContainer[i].type === 'cloze'){
                            front.text(cardContainer[i].partial);
                            back.text(cardContainer[i].cloze);
                         }

                         textWrapper.append(front)
                         textWrapper.append(back);

                         $('#flashcard-content').append(textWrapper);
                    }

                    // update input field
                    if(cardContainer[totalCard].type === 'basic'){
                      $('#front').val(cardContainer[totalCard].front);
                      $('#back').val(cardContainer[totalCard].back);
                    }else if(cardContainer[totalCard].type === 'cloze'){
                      $('#front').val(cardContainer[totalCard].fullText);
                      $('#back').val(cardContainer[totalCard].cloze);
                    }

                    // update current content
                    updatecurContent()
               }
            })

            // update cardContainer on change of any child of user cards
            database.ref('users').child(userInfo.uid).child('cards').on('value', function(snap){
                cardContainer = snap.val();
            })

            setTimeout(function(){
                if(curInfo.type === 'basic'){
                        database.ref('users').child(userInfo.uid+'/'+'cards'+"/"+curCard).onDisconnect()
                            .set(basic(curInfo.front,curInfo.back,curCard,curInfo.color))
                }
                if(curInfo.type === 'cloze'){
                        database.ref('users').child(userInfo.uid+'/'+'cards'+"/"+curCard).onDisconnect()
                            .set(cloze(curInfo.front,curInfo.back,curCard,curInfo.color))
                }
            },4000)

        }
        else{
          // if user is not signed in
            $('#modal-signin-btn').show();
            $('#signout').hide();

            curCard = 1;
            totalCard = 1;
            cardContainer = [];
            userInfo = undefined;

            cardContainer[1] = basic('','',1,'black');
            curInfo = cardContainer[1];

            $('#flashcard-content').empty();
            createInitialCard();

            $('.card-count').text('1/1')
            $('#front').val('');
            $('#back').val('');
        }

    });


    // ---------------- FIREBASE DATABASE APPLICATIONS ---------------------

    $(window).keyup(function(e){
        // create new card when press ctrl + n
        if(e.altKey && e.which === 78){
            e.preventDefault();
            if(userInfo){
            //save current card
            uploadCardFirebase();
            }

            // create new Card
            createCard();

            // update current content
            updatecurContent();
        }

        // // delete when pressed on delete btn
        // if(e.which === 46){
        //     if(userInfo){
        //         // delete from firebase and update cardContainer if use is logged in
        //         firebase.ref('user').child(userInfo.uid+'/cards').remove(curCard);
        //         // update html content
        //         $('#card-'curCard).remove();
        //         // red
        //         updatecurContent();
        //     }else{
        //         cardContainer.splice(curCard,1)
        //         // update content
        //         updatecurContent();
        //     }
        // }
    })

    $(window).keydown(function(e){
         if(e.altKey && e.which === 39){
            e.preventDefault();
            moveRight();
            }

          // show previous card when press left
          if(e.altKey && e.which === 37){
            e.preventDefault();
            moveLeft();
          }
    })

    //toggle click on arrow to key press arrow fn
    $("#move-left").click(function(){
        moveLeft();
    })
    $("#move-right").click(function(){
        moveRight();
    })

    // ---------------- LOCAL STORAGE FOR NOTIFCATION --------------------

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
        if(curInfo.type === 'basic'){
             if($('#front').is(':focus')){
                 var text = $('#front').val().trim();
                 $('#text-front-'+curCard).text(text)
                 curInfo.front = text;
             }
             if($('#back').is(':focus')){
                 var text = $('#back').val().trim();
                 $('#text-back-'+curCard).text(text)
                 curInfo.back = text;
            }
       }

       if(curInfo.type === 'cloze'){
            if($('#front').is(':focus')){
               var text = $('#front').val().trim().toLowerCase();
               var cloze = $('#back').val().trim().toLowerCase();
               var partial = text.replace(cloze,' ... ');
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
            curInfo.color = 'red';
        }
        if(e.altKey && e.which === 50){
            $('#card-' + curCard).css('color','blue');
            curInfo.color = 'blue';
        }
        if(e.altKey && e.which === 51){
            $('#card-' + curCard).css('color','green');
            curInfo.color = 'green';
        }
        if(e.altKey && e.which === 52){
            $('#card-' + curCard).css('color','black');
            curInfo.color = 'black';
        }

    // change type card of alt + 5
        if(e.altKey && e.which === 53){
            if($('.switch-card').attr('data-state') === 'basic'){
                $('#card-state-basic').css('font-weight','normal');
                $('#card-state-cloze').css('font-weight','bold');
                $('.switch-card').attr('data-state','cloze')

                $('#front-label').text('Full Text');
                $('#back-label').text('Cloze');

                curInfo.type = 'cloze';
                // database.ref('users').child(userInfo.uid).child('cards').child(curCard).update({'type':curType})

            }
            else if($('.switch-card').attr('data-state') === 'cloze'){
                $('#card-state-basic').css('font-weight','bold');
                $('#card-state-cloze').css('font-weight','normal');
                $('.switch-card').attr('data-state','basic');

                $('#front-label').text('Front');
                $('#back-label').text('Back');

                curInfo.type = 'basic';
                // database.ref('users').child(userInfo.uid).child('cards').child(curCard).update({'type':curType})
            }
        }

        if(e.altKey && e.keyCode === 83){
            if(userInfo){
                //save current card
                uploadCardFirebase();
                alert('Current Card Saved!')
            }else{
                alert('You need to log in in order to save your progress')
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
    $('.text-field').keydown(function(e){
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

    // Fn Bar
})
