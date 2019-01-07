/* eslint-disable  func-names */
/* eslint-disable  no-restricted-syntax */
/* eslint-disable  no-loop-func */
/* eslint-disable  consistent-return */
/* eslint-disable  no-console */
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */

const Alexa = require('ask-sdk-core');
const https = require('https');

/* INTENT HANDLERS */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
      
     let name =  sessionAttributes.profileName;
     sessionAttributes.prevIntent = 'LaunchRequest';
   
   //  sessionAttributes.isNew = true;
     
   if(sessionAttributes.isNew){
     return handlerInput.responseBuilder
      .speak('Welcome to Pet Shop. What is your name ?')
      .reprompt('Welcome to Pet Shop. What is your name ?')
      .getResponse();
   }
   else{
     return handlerInput.responseBuilder
      .speak('Welcome back '  + name + ' . Last time you bought ' + sessionAttributes.selectionitem + ' . Would you like to place this order again?')
      .reprompt('Welcome back ' + name + '  . Last time you bought ' + sessionAttributes.selectionitem + ' . Would you like to place this order again?')
      .getResponse();
   }
  },
};


const SpecialsIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'SpecialsIntent'
      
  },
 handle(handlerInput) {
   
  return handlerInput.responseBuilder
      .speak('We have twenty percent off your current online order. We also have thirty percent off any repeat delivery.')
      .reprompt('Do you want to hear about our other products and services ? ')
      .getResponse();
},
};


const ExplainFoodAllergyIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ExplainFoodAllergyIntent'
  },
 handle(handlerInput) {
  return handlerInput.responseBuilder
      .speak('Grain free food is for dogs who are allergic to grains like wheat. Do you want dry, wet, grain free food?')
      .reprompt('Grain free food')
      .getResponse(); 
},
};


const BlogIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'BlogIntent'
      
  },
 handle(handlerInput) {
  return handlerInput.responseBuilder
      .speak('Here are some tips and tricks to make first day of the puppy easier.')
      .reprompt('Do you want to hear more helpful guides ? ')
      .getResponse();
},
};



const ConfirmationIntentHandler = {
  canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
     return request.type === 'IntentRequest'
      && request.intent.name === 'ConfirmationIntent'
  },
  handle(handlerInput) {
  const request = handlerInput.requestEnvelope.request;
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
     
   let prev = sessionAttributes.prevIntent;
   let name = sessionAttributes.profileName;
   
   if(  prev === 'LaunchRequest'){
     let result = '';
    
     if(request.intent.slots.answer){
       result = request.intent.slots.answer.value;
     }
     
     if( result  === 'yes' && sessionAttributes.confirmintentvalues === 'askconfirmationforcreditcard'){
          return handlerInput.responseBuilder
               .speak('OK ' +  name + ' I will go ahead and place the order for one Merrick Grain food thirty five pounds with total cost of 25 dollars.')
               .reprompt('OK ' + name + ' I will go ahead and place the order.')
               .getResponse();
   
     } else if(  result === 'yes'  &&  sessionAttributes.confirmintentvalues === 'askconfirmationforaddress'){
        sessionAttributes.confirmintentvalues = 'askconfirmationforcreditcard';
        
        var speechoutput = 'Is the last 4 digits of your credit card number, ' + '<say-as interpret-as="digits">' + 1234 + '</say-as>' + '?';
        return handlerInput.responseBuilder
      .speak(speechoutput)
      .reprompt('Can you confirm the last 4 of your credit card number 1234 ?')
      .addElicitSlotDirective('answer')
      .getResponse();
        
      }else if(result === 'no'){
        return handlerInput.responseBuilder
      .speak('address not confirmed')
      .reprompt('address not confirmed')
      .getResponse();
        
      }else{
     
     
     sessionAttributes.confirmintentvalues = 'askconfirmationforaddress';
      
       return handlerInput.responseBuilder
      .speak('Can you confirm the shipping address, 123 main street, ohio ?')
      .reprompt('Can you confirm the shipping address, 123 main street, ohio ?')
      .addElicitSlotDirective('answer')
      .getResponse();
      }
      
   }else if(prev === 'CheckOutIntent'){
     
      return handlerInput.responseBuilder
               .speak('OK Your order has been placed and the confirmation receipt is sent via email. May I help you with something else?.')
               .reprompt('OK Your order has been placed and the confirmation receipt is sent via email. May I help you with something else?')
               .getResponse();
     
   }
     
  },
};




// This interceptor loads our profile from persistent storage into the session
// attributes.
const NewSessionRequestInterceptor = {
  async process(handlerInput) {
    console.log('request:', JSON.stringify(handlerInput.requestEnvelope.request));

    if (handlerInput.requestEnvelope.session.new) {
      const attributesManager = handlerInput.attributesManager;
      let sessionAttributes = attributesManager.getSessionAttributes();

    var AWS = require("aws-sdk");
    var docClient = new AWS.DynamoDB.DocumentClient();
   
   var params = {
     TableName : "PetShopUser",
     Limit: 5000
   };
   var tableresults;
   sessionAttributes.isNew = false;
   sessionAttributes.profileName = '';
   
   return docClient.scan(params).promise().then((data) =>{
     
     if(data.Items.length > 0){
     tableresults = data.Items;
      sessionAttributes.isNew = false;
      sessionAttributes.profileName =  tableresults[0].name;
       sessionAttributes.selectionitem =  tableresults[0].selectionitem;
     }else{
        sessionAttributes.isNew = true;
     } 
     
   }); 
   
    }
  }
};


const NameIntentHandler = {
  canHandle(handlerInput) {
     const request = handlerInput.requestEnvelope.request;
     return request.type === 'IntentRequest'
      && request.intent.name === 'NameIntent'
      && request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
     const request = handlerInput.requestEnvelope.request;
     
     let name = request.intent.slots.name.value;
   //  let brand = 'true value';
 //  let brand = sessionAttributes.favoritebrand;
 
     sessionAttributes.profileName = name;
     
     //dynamodb
    /* var AWS = require('aws-sdk');
     var ddb = new AWS.DynamoDB({apiversion: '2012-10-08'});
     AWS.config.update({region: 'us-east-1'});
     
     var params = {
       TableName: 'PetShopUser',
       Item:{
         'name': {S:name},
         'brand': {S: brand}
       }
     };
     
     ddb.putItem(params, function(err,data){
       if(err){
         console.log(err);
       }else{
         console.log('success');
       }
     });
     */
     
    return handlerInput.responseBuilder
      .speak('Hi ' + name + ' , Do you want to hear about our special offers, or hear about our products and services?')
      .reprompt('Hi ' + name + ', Do you want to hear about our special offers, or hear about our products and services?')
      .getResponse();
  },
};


const CheckOutIntentHandler = {
  canHandle(handlerInput) {
     const request = handlerInput.requestEnvelope.request;
     return request.type === 'IntentRequest'
      && request.intent.name === 'CheckOutIntent'
      && request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
       const attributesManager = handlerInput.attributesManager;
      let sessionAttributes = attributesManager.getSessionAttributes();
     sessionAttributes.prevIntent = 'CheckOutIntent';
    
    if(handlerInput.requestEnvelope.request.intent.slots){
      if(handlerInput.requestEnvelope.request.intent.slots.zip){
         if(handlerInput.requestEnvelope.request.intent.slots.zip.value){
       return handlerInput.responseBuilder
         .speak('OK. Your current order includes one 35 pound bag of Merrick Real Chicken Dry Dog food with a total cost of 27 dollars. May I place this order?')
         .reprompt('OK. Your current order includes one 35 pound bag of Merrick Real Chicken Dry Dog food with a total cost of 27 dollars. May I place this order?')
         .getResponse();
       }else{
            return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
     }
    }else{
     return handlerInput.responseBuilder
      .addDelegateDirective()
      .getResponse();
    }
      
  }else{
    
     return handlerInput.responseBuilder
      .addDelegateDirective()
      .getResponse();
    }
  }, 
  
};

const CompletedCheckOutIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'CheckOutIntent'
      
  },
 handle(handlerInput) {
  return handlerInput.responseBuilder
      .speak('I placed your order')
      .reprompt('I placed your order')
      .getResponse();
},
};


const SearchIntentHandler = {
canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && request.intent.name === 'SearchIntent'
      && request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
  
    for (const slotName in currentIntent.slots) {
      if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
        const currentSlot = currentIntent.slots[slotName];
        if (currentSlot.confirmationStatus !== 'CONFIRMED'
          && currentSlot.resolutions
          && currentSlot.resolutions.resolutionsPerAuthority[0]) {
          if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
            if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 0) {
              
                 sessionAttributes[currentIntent.name] = currentIntent;
                 attributesManager.setSessionAttributes(sessionAttributes);
              
                   if( currentSlot.name === 'pet' ){  
                      if( currentIntent.slots.selectionitem.name === 'selectionitem' &&  currentIntent.slots.selectionitem.resolutions && currentIntent.slots.selectionitem.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH'){
                   
                        const attributesManager = handlerInput.attributesManager;
                        const sessionAttributes = attributesManager.getSessionAttributes();
                        var name = sessionAttributes.profileName;
                        var brand = sessionAttributes.favoritebrand;
                   //     console.log ('selection' + currentIntent.slots.selectionitem.resolutions.resolutionsPerAuthority[0].values[0].value.name);
                        
                        if(currentIntent.slots.selectionitem.resolutions.resolutionsPerAuthority[0].values[0].value.name === '1')
                        {
                            sessionAttributes.selectionitem = 'Merrick Real Chicken Dry food';
                        }else if(currentIntent.slots.selectionitem.resolutions.resolutionsPerAuthority[0].values[0].value.name === '2' ){
                          sessionAttributes.selectionitem = 'Merrick Diet Turkey Dry food';
                        }
                        
                        if(currentIntent.slots.selectionitem.resolutions.resolutionsPerAuthority[0].values[0].value.name === 'one')
                        {
                            sessionAttributes.selectionitem = 'Merrick Real Chicken Dry food';
                        }else if(currentIntent.slots.selectionitem.resolutions.resolutionsPerAuthority[0].values[0].value.name === 'two' ){
                          sessionAttributes.selectionitem = 'Merrick Diet Turkey Dry food';
                        }
                    
                        var AWS = require('aws-sdk');
                        var ddb = new AWS.DynamoDB({apiversion: '2012-10-08'});
                        AWS.config.update({region: 'us-east-1'});
     
                        var params = {
                            TableName: 'PetShopUser',
                            Item:{
                                    'name': {S:name},
                                    'brand': {S: brand},
                                    'selectionitem' : {S: sessionAttributes.selectionitem}
                                 }
                        };
     
                        ddb.putItem(params, function(err,data){
                        if(err){
                              console.log(err);
                        }else{
                              console.log('success');
                        }
                });
                    
          
                prompt = 'Ok ' + name + ' , I added ' + sessionAttributes.selectionitem  +  ' to the cart. Do you want to check out or continue to shop ?';
             
                 return handlerInput.responseBuilder
                .speak(prompt)
                .reprompt(prompt)
                .getResponse();
                 
               }    
                else if(  currentIntent.slots.sortorder.name === 'sortorder' &&  currentIntent.slots.sortorder.resolutions && currentIntent.slots.sortorder.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH'){
                   
                    const attributesManager = handlerInput.attributesManager;
                    const sessionAttributes = attributesManager.getSessionAttributes();
                    var temp = sessionAttributes.favoritebrand;
                   
                    sessionAttributes[currentIntent.name] = currentIntent;
                    attributesManager.setSessionAttributes(sessionAttributes);
                    
                    prompt = 'Here are the '+  temp + ' top 2 results. 1, Merrick Real Chicken Dry food comes in 35 pounds bag, and costs 25 dollars. 2, Merrick Diet Turkey Dry food comes in 50 pounds bag and costs 50 dollars.  Would you like to hear more information on these 2 products ? or , make a selection , or hear about the other eight results ? ';
             
                 return handlerInput.responseBuilder
                                    .speak(prompt)
                                    .reprompt(prompt)
                                    .addElicitSlotDirective('selectionitem')
                                    .getResponse();
                 
               }    
              else if(  currentIntent.slots.brandname.name === 'brandname' &&  currentIntent.slots.brandname.resolutions && currentIntent.slots.brandname.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH'){
                   prompt =  'We have 10 ' + currentIntent.slots.brandname.value +  ' products. Would you like me to read the results , sorted by price , or customer rating ?';
                   
                    const attributesManager = handlerInput.attributesManager;
                    const sessionAttributes = attributesManager.getSessionAttributes();
                    sessionAttributes.favoritebrand = currentIntent.slots.brandname.value;
                    
                    sessionAttributes[currentIntent.name] = currentIntent;
                    attributesManager.setSessionAttributes(sessionAttributes);
             
                   return handlerInput.responseBuilder
                                      .speak(prompt)
                                      .reprompt(prompt)
                                      .addElicitSlotDirective('sortorder')
                                      .getResponse();
                 
               }
                else if( currentIntent.slots.subcategory.name === 'subcategory' && currentIntent.slots.subcategory.resolutions && currentIntent.slots.subcategory.resolutions.resolutionsPerAuthority[0]){
                 
                 sessionAttributes[currentIntent.name] = currentIntent;
                 attributesManager.setSessionAttributes(sessionAttributes);
                
                prompt =  'Oh ! There are more than 100 results. Should I narrow it down to a certain brand ? We carry Merrick, Wholehearted and True value';
                
                return handlerInput.responseBuilder
                .speak(prompt)
                .reprompt(prompt)
                .addElicitSlotDirective('brandname')
                .getResponse();
                }
               
               else if( currentIntent.slots.category.name === 'category' && currentIntent.slots.category.confirmationStatus !== 'CONFIRMED'){
            
                 sessionAttributes[currentIntent.name] = currentIntent;
                 attributesManager.setSessionAttributes(sessionAttributes);
                 
                 prompt = 'Ah! What kind of dog food would you like ? We have dry, wet, puppy or Grain Free food available.';
                 return handlerInput.responseBuilder
                .speak(prompt)
                .reprompt(prompt)
                .addElicitSlotDirective('subcategory')
                .getResponse();
               } 
              
            }                   
            }
          
          } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
            
              prompt = `What ${currentSlot.name} are you looking for`;

              return handlerInput.responseBuilder
                .speak(prompt)
                .reprompt(prompt)
                .addElicitSlotDirective(currentSlot.name)
                .getResponse();
            
          }
        }
      }
    }
   
    },
};


const requiredSlots = {
  CreditCardNumber: true,
  ExpirationDate: true,
  securityCode: true
};


// This interceptor looks at the slots belonging to the request.
//  it will store them in the user attributes. When the skill closes, this information will be saved.
const SearchIntentCaptureSlotsToProfileInterceptor = {
  process(handlerInput) {
    const intentName = "SearchIntent";
    const slots = ["zip"];
    console.log('CaptureAddressIntentCaptureSlotsToProfileInterceptor call saveNewlyFilledSlotsToSessionAttributes');
    saveNewlyFilledSlotsToSessionAttributes(handlerInput, intentName, slots, (sessionAttributes, slotName, newlyFilledSlot) => {
      sessionAttributes.profile.location.address[slotName] = newlyFilledSlot.synonym;
    });
  }
};



// given an intent name and a set of slots, saveNewlyFilledSlotsToSessionAttributes 
// will save newly filled values of the given slots into the session attributes.
// The callback allows you to set the slot value into session attributes however
// you want.
function saveNewlyFilledSlotsToSessionAttributes(handlerInput, intentName, slots, callback) {
  const attributesManager = handlerInput.attributesManager;
  const sessionAttributes = attributesManager.getSessionAttributes();
  const currentIntent = handlerInput.requestEnvelope.request.intent;

  if (handlerInput.requestEnvelope.request.type === "IntentRequest"
    && currentIntent.name === intentName) {
    
    const previousIntent = sessionAttributes[currentIntent.name];
    console.log('CALL intentHasNewlyFilledSlots IN saveNewlyFilledSlotsToSessionAttributes ');
    const newlyFilledSlots = intentHasNewlyFilledSlots(previousIntent, currentIntent, slots);
    console.log('saveNewlyFilledSlotsToSessionAttributes');

    // We only save if the slot(s) has been filled with something new.
    if (newlyFilledSlots.found) {
      for (let slotName in newlyFilledSlots.slots) {
        console.log('inserting:', 
        slotName, JSON.stringify(newlyFilledSlots.slots[slotName]), 
        JSON.stringify(sessionAttributes));
        callback(sessionAttributes, slotName, newlyFilledSlots.slots[slotName]);
      }
      attributesManager.setSessionAttributes(sessionAttributes);
    }
  }  
}

// This interceptor handles intent switching during dialog management by
// syncing the previously collected slots stored in the session attributes
// with the current intent. The slots currently collected take precedence so
// the user is able to overidde previously collected slots.
const DialogManagementStateInterceptor = {
  process(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;

    if (handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.dialogState !== "COMPLETED") {

      const attributesManager = handlerInput.attributesManager;
      const sessionAttributes = attributesManager.getSessionAttributes();
      
     //  console.log('come inside dialog mgmt');
    //     console.log('current intent name ' + currentIntent.name);
         
      // If there are no session attributes we've never entered dialog management
      // for this intent before.
      if (sessionAttributes[currentIntent.name]) {
        let currentIntentSlots = sessionAttributes[currentIntent.name].slots;
        for (let key in currentIntentSlots) {
          
          if(currentIntent.slots[key].value){
    //      console.log("stored slot value " + key + currentIntent.slots[key].value);
          }

          // we let the current intent's values override the session attributes
          // that way the user can override previously given values.
          // this includes anything we have previously stored in their profile.
          if (currentIntentSlots[key].value && !currentIntent.slots[key].value) {
            currentIntent.slots[key] = currentIntentSlots[key];
          }
        }    
      }

      sessionAttributes[currentIntent.name] = currentIntent;
      attributesManager.setSessionAttributes(sessionAttributes);
      
   //    console.log('current session attr');
   //   console.log(JSON.stringify(sessionAttributes));
    }
  }
};








// given the slots object from the JSON Request to the skill, builds a simplified
// object which simplifies inpecting slots for entity resultion matches.
function getSlotValues(slots) {

  const slotValues = {};

  for (let key in slots) {

      if (slots.hasOwnProperty(key)) {

          slotValues[key] = {
              synonym: slots[key].value || null ,
              resolvedValues: (slots[key].value ? [slots[key].value] : []),
              statusCode: null,
          };
          
          let statusCode = (((((slots[key] || {} )
              .resolutions || {})
              .resolutionsPerAuthority || [])[0] || {} )
              .status || {})
              .code;

          let authority = ((((slots[key] || {})
              .resolutions || {})
              .resolutionsPerAuthority || [])[0] || {})
              .authority;

          slotValues[key].authority = authority;
          
          // any value other than undefined then entity resolution was successful
          if (statusCode) {
              slotValues[key].statusCode = statusCode;
              
              // we have resolved value(s)!
              if (slots[key].resolutions.resolutionsPerAuthority[0].values) {
                  let resolvedValues = slots[key].resolutions.resolutionsPerAuthority[0].values;
                  slotValues[key].resolvedValues = [];
                  for (let i = 0; i < resolvedValues.length; i++) {                   
                      slotValues[key].resolvedValues.push({
                          value: resolvedValues[i].value.name,
                          id: resolvedValues[i].value.id 
                      });
                  }
              }
          }
      }
  }
  return slotValues;
}

function getNewSlots(previous, current) {
  const previousSlotValues = getSlotValues(previous);
  const currentSlotValues = getSlotValues(current);

  let newlyCollectedSlots = {};
  for(let slotName in previousSlotValues) {
      // resolvedValues and statusCode are dependent on our synonym so we only
      // need to check if there's a difference of synonyms.
      if (previousSlotValues[slotName].synonym !== currentSlotValues[slotName].synonym){
          newlyCollectedSlots[slotName] = currentSlotValues[slotName];
      }
  }
  return newlyCollectedSlots;
}

// intentHasNewlyFilledSlots given a previous and current intent and a set of 
// slots, this function will compare the previous intent's slots with current 
// intent's slots to determine what's new. The results are filtered by the 
// provided array of "slots". For example if you wanted to determine if there's
// a new value for the "state" and "city" slot you would pass the previous and
// current intent and an array containing both strings. If previous is undefined,
// all filled slots are treated as newly filled. 
// Returns: 
// {
//   found: (true | false)
//   slots: object of slots returned from getSlots
// }
function intentHasNewlyFilledSlots(previous, intent, slots) {

  let newSlots;
  // if we don't have a previous intent then all non-empty intent's slots are 
  // newly filled!
  if (!previous) {
    const slotValues = getSlotValues(intent.slots);
    newSlots = {};
    for (let slotName in slotValues) {
      if (slotValues[slotName].synonym) {
        newSlots[slotName] = slotValues[slotName];
      }
    }
  } else {
    newSlots = getNewSlots(previous.slots, intent.slots);
  }

  const results = {
    found: false,
    slots: {}
  };
  
  slots.forEach(slot => {
    if(newSlots[slot]) {
      results.slots[slot] = newSlots[slot];
      results.found = true;
    }
  });
  return results;
}

function buildDisambiguationPrompt(resolvedValues) {
  let output = "Which would you like";
  resolvedValues.forEach((resolvedValue, index) => {
     output +=  `${(index === resolvedValues.length - 1) ? ' or ' : ' '}${resolvedValue.value}`; 
  });
  output += "?";
  return output;
}

function disambiguateSlot(slots) {
  let result;
  for(let slotName in slots) {
      if (slots[slotName].resolvedValues.length > 1 && requiredSlots[slotName]) {
          console.log('disambiguate:', slots[slotName]);
          result = {
              slotName: slotName,
              prompt: buildDisambiguationPrompt(slots[slotName].resolvedValues)
          };
          break;
      }
  }
  return result;
}

// given an intent and an array slots, intentSlotsHaveBeenFilled will determine
// if all of the slots in the array have been filled.
// Returns:
// (true | false)
function intentSlotsHaveBeenFilled(intent, slots){
  const slotValues = getSlotValues(intent.slots);
  console.log('slot values:', JSON.stringify(slotValues));
  let result = true;
  slots.forEach(slot => {
      console.log('intentSlotsHaveBeenFilled:', slot);
      if (!slotValues[slot].synonym) {
          result = false;
      }
  });

  return result;
}

function intentSlotsNeedDisambiguation(intent, slots) {
  const slotValues = getSlotValues(intent.slots);
  let result = false;
  slots.forEach(slot => {
    console.log(slotValues[slot].resolvedValues.length);
    if(slotValues[slot].resolvedValues.length > 1) {
      result = true;
    }
  });
  console.log("intentSlotsNeedDisambiguation", result);
  return result;
}


const InProgressCaptureAddressIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "CaptureAddressIntent"
      && handlerInput.requestEnvelope.request.dialogState !== "COMPLETED";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addDelegateDirective()
      .getResponse();
  }
};



const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('I\'m sorry can\'t help you with that. ')
      .reprompt('What are you looking for today ?')
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('This is pet shop. Do you want to hear about our special offers or hear about our products and services ? ')
      .reprompt('This is pet shop. Do you want to hear about our special offers or hear about our products and services ?')
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Bye')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${handlerInput.requestEnvelope.request.type} ${handlerInput.requestEnvelope.request.type === 'IntentRequest' ? `intent: ${handlerInput.requestEnvelope.request.intent.name} ` : ''}${error.message}.`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};



function saveValue(options, handlerInput) {
  const key = `_${options.fieldName}`;
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  if (options.append && attributes[key]) {
    attributes[key].push(options.data);
  } else if (options.append) {
    attributes[key] = [options.data];
  } else {
    attributes[key] = options.data;
  }
}

/*function getSlotValues(filledSlots) {
  const slotValues = {};

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);

  return slotValues;
}*/





function buildQueryString(params) {
  let paramList = '';
  params.forEach((paramGroup, index) => {
    paramList += `${index === 0 ? '?' : '&'}${encodeURIComponent(paramGroup[0])}=${encodeURIComponent(paramGroup[1])}`;
  });
  return paramList;
}

function buildHttpGetOptions(host, path, port, params) {
  return {
    hostname: host,
    path: path + buildQueryString(params),
    port,
    method: 'GET',
  };
}



function httpGet(options) {
  return new Promise(((resolve, reject) => {
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
      }

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}


const skillBuilder = Alexa.SkillBuilders.custom();

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ConfirmationIntentHandler,
    CheckOutIntentHandler,
    CompletedCheckOutIntentHandler,
    ExplainFoodAllergyIntentHandler,
    NameIntentHandler,
    SearchIntentHandler,
    SpecialsIntentHandler,
    BlogIntentHandler,
    HelpHandler,
    FallbackHandler,
    ExitHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(
    NewSessionRequestInterceptor,
    DialogManagementStateInterceptor
    )
  .addErrorHandlers(ErrorHandler)
  .lambda();