// Declare variables outside the block

let model_ffnn=null;
let maxSequenceLengthFFNN = 3; // Set your desired max sequence length;
let ffnn_tokenizer=null;
let model_lstm=null;
let maxSequenceLengthLSTM = 3; // Set your desired max sequence length;
let lstm_tokenizer=null;

// Wait for TensorFlow.js to be ready
tf.ready().then(() => {
    $.getJSON('models/ffnn/model_variables.json', function(data) {         
      tokenizerIndexWordFFNN=JSON.parse(data["tokenizerWordIndex"])['config']['index_word'];
      tokenizerIndexWordFFNN=JSON.parse(tokenizerIndexWordFFNN);
      tokenizerWordIndexFFNN=JSON.parse(data["tokenizerWordIndex"])['config']['word_index'];
      tokenizerWordIndexFFNN=JSON.parse(tokenizerWordIndexFFNN);
      ffnn_tokenizer={"word_index":tokenizerWordIndexFFNN,"index_word":tokenizerIndexWordFFNN};

      if (typeof tokenizerIndexWordFFNN === 'undefined') {
        alert('Model not loaded, please reload the page');
        return;
        }

      });
$.getJSON('models/lstm/model_variables.json', function(data) {         
    tokenizerIndexWordLSTM=JSON.parse(data["tokenizerWordIndex"])['config']['index_word'];
    tokenizerIndexWordLSTM=JSON.parse(tokenizerIndexWordLSTM);
    tokenizerWordIndexLSTM=JSON.parse(data["tokenizerWordIndex"])['config']['word_index'];
    tokenizerWordIndexLSTM=JSON.parse(tokenizerWordIndexLSTM);
    lstm_tokenizer={"word_index":tokenizerWordIndexLSTM,"index_word":tokenizerIndexWordLSTM};

    if (typeof tokenizerIndexWordFFNN === 'undefined') {
      alert('Model not loaded, please reload the page');
      return;
    }

});
init();


}).catch((error) => {
  console.error('Error loading TensorFlow.js:', error);
});

async function loadModel() {
  try {
    // Load the TensorFlow.js model
    model_ffnn = await tf.loadLayersModel('models/ffnn/model.json');
    model_lstm = await tf.loadLayersModel('models/lstm/model.json');

  } catch (error) {
    alert('Models not loaded, please reload the page');
  }
}



async function init() {
  // Initialize the TensorFlow.js model
  await loadModel();
  await tf.ready();
  
}

async function predictNextWordFFNN(input_text_from_user) {
  if (!model_ffnn) {
    alert('Model not loaded, please reload the page');
    return;
  }
    // Get the list of layers in the model


  // Use the loaded model for predictions
  const sequence = texts_to_sequences(ffnn_tokenizer,input_text_from_user);

  // Pad the sequence manually
  const paddedSequence = pad_sequences(sequence, maxSequenceLengthFFNN);
  console.log(paddedSequence);

  const inputTensor = tf.tensor2d([paddedSequence]);
  // const predictions = model_ffnn.predict(inputTensor);
  // console.log(predictions);
  // Make predictions
const predictions = model_ffnn.predict(inputTensor);

  // Display predictions
  const sorted_predictions = Array.from(predictions.dataSync())
    .map((probability, index) => ({ index,word:ffnn_tokenizer['index_word'][index], probability:probability }))
    .sort((a, b) => b.probability - a.probability);
    var top_n_by_user=document.getElementById('best_n_ffnn').value;
    const myDiv = document.getElementById('top_n_ffnn');
    myDiv.innerHTML = '';
    for (let i = 0; i < top_n_by_user; i++) {
        const span = document.createElement('span');
        span.classList.add('result_element');
        span.textContent = sorted_predictions[i]["word"];
        console
        myDiv.appendChild(span);
    } 
}


async function predictNextWordLSTM(input_text_from_user) {
  if (!model_lstm) {
    alert('Model not loaded, please reload the page');
    return;
  }
    // Get the list of layers in the model


  // Use the loaded model for predictions
  const sequence = texts_to_sequences(lstm_tokenizer,input_text_from_user);

  // Pad the sequence manually
  const paddedSequence = pad_sequences(sequence, maxSequenceLengthFFNN);
  console.log(paddedSequence);

  const inputTensor = tf.tensor2d([paddedSequence]);
  // const predictions = model_ffnn.predict(inputTensor);
  // console.log(predictions);
  // Make predictions
const predictions = model_lstm.predict(inputTensor);

  // Display predictions
  const sorted_predictions = Array.from(predictions.dataSync())
    .map((probability, index) => ({ index,word:lstm_tokenizer['index_word'][index], probability:probability }))
    .sort((a, b) => b.probability - a.probability);
    var top_n_by_user=document.getElementById('best_n_lstm').value;
    const myDiv = document.getElementById('top_n_lstm');
    myDiv.innerHTML = '';
    for (let i = 0; i < top_n_by_user; i++) {
        const span = document.createElement('span');
        span.classList.add('result_element');
        span.textContent = sorted_predictions[i]["word"];
        console
        myDiv.appendChild(span);
    } 
}


const wordInput = document.getElementById('input_text_ffnn');

setInterval(handleInput, 800);

function handleInput() {
    const inputValue = wordInput.value;    
    if (inputValue.endsWith(' ') && inputValue.trim()!='') {
        console.log("predict for :"+inputValue)

        predictNextWordFFNN(inputValue);
        generate_sentenceFFNN(inputValue);


    }

}

const wordInputLSTM = document.getElementById('input_text_lstm');

setInterval(handleInputLSTM, 800);

function handleInputLSTM() {
    const inputValue = wordInputLSTM.value;    
    if (inputValue.endsWith(' ') && inputValue.trim()!='') {
        console.log("predict for :"+inputValue)

        predictNextWordLSTM(inputValue);
        generate_sentenceLSTM(inputValue);

    }

}

function getLastWord(input) {

    const words = input.trim().split(' ');
    return words[words.length - 1];
}



var top_n_by_user=document.getElementById('best_n_ffnn');
top_n_by_user.addEventListener('change', function() {
    // Code to run when the selection changes
    const inputValue = wordInputLSTM.value;    
    // Check if the last character changed to a space
    if (inputValue.endsWith(' ') && inputValue.trim()!='') {
      console.log("predict for :"+inputValue)

      predictNextWordLSTM(inputValue);
      generate_sentenceLSTM(inputValue);

  }   
});

var top_n_by_user_lstm=document.getElementById('best_n_lstm');
top_n_by_user_lstm.addEventListener('change', function() {
    // Code to run when the selection changes
    const inputValue = wordInput.value;    
    // Check if the last character changed to a space
    if (inputValue.endsWith(' ') && inputValue.trim()!='') {
      console.log("predict for :"+inputValue)

      predictNextWordFFNN(inputValue);
      generate_sentenceFFNN(inputValue);

  }   
});

function texts_to_sequences(tokenizer,seed_text){
  const words_array = seed_text.trim().split(" ");
  console.log("words_array :"+words_array);

  let sequence_array = [];

  for (var i = 0; i < words_array.length; i++) { 
    sequence_array.push(tokenizer['word_index'][words_array[i]]);
  }
  console.log("sequence_array :"+sequence_array);
  return sequence_array;

}


function pad_sequences(token_list,maxlen){
  const newArray = token_list.slice(); // Create a shallow copy of the original array

    while (newArray.length < maxlen) {
        newArray.unshift(0); // Add zeros to the left
    }

    if (newArray.length > maxlen) {
        newArray.splice(0, newArray.length - maxlen); // Shift to the left
    }
    console.log(newArray)

    return newArray;

}



function index_to_word(tokenizer,predicted_index){
  if (predicted_index in tokenizer['index_word']) {
    return tokenizer['index_word'][predicted_index];
  } else {
    return "UNKNOWN";
  } 

}

async function generate_sentenceFFNN(input_text_ffnn){
  if (!model_ffnn) {
    alert('Model not loaded, please reload the page');
    return;
  }
  console.log("Generate sentence");
    // Get the list of layers in the model
    let input_text_from_user=input_text_ffnn;
  for (let index = 0; index < 5; index++) {
   // Use the loaded model for predictions
  const sequence = texts_to_sequences(ffnn_tokenizer,input_text_from_user);

  // Pad the sequence manually
  const paddedSequence = pad_sequences(sequence, maxSequenceLengthFFNN);
  console.log(paddedSequence);

  const inputTensor = tf.tensor2d([paddedSequence]);
  // const predictions = model_ffnn.predict(inputTensor);
  // console.log(predictions);
  // Make predictions
  const predictions = model_ffnn.predict(inputTensor);

  // Display predictions
  const sorted_predictions = Array.from(predictions.dataSync())
    .map((probability, index) => ({ index,word:ffnn_tokenizer['index_word'][index], probability:probability }))
    .sort((a, b) => b.probability - a.probability);
    let new_word=sorted_predictions[0]["word"];
    input_text_from_user=input_text_from_user+" "+new_word;
  }
  document.getElementById('phrase_ffnn').innerHTML=input_text_from_user;
  console.log("Senetence : "+input_text_from_user);
  
}


async function generate_sentenceLSTM(input_text_lstm){
  if (!model_ffnn) {
    alert('Model not loaded, please reload the page');
    return;
  }
  console.log("Generate sentence");
    let input_text_from_user=input_text_lstm;
  for (let index = 0; index < 5; index++) {
  const sequence = texts_to_sequences(lstm_tokenizer,input_text_from_user);

  // Pad the sequence manually
  const paddedSequence = pad_sequences(sequence, maxSequenceLengthFFNN);
  console.log(paddedSequence);

  const inputTensor = tf.tensor2d([paddedSequence]);
  // const predictions = model_ffnn.predict(inputTensor);
  // console.log(predictions);
  // Make predictions
  const predictions = model_lstm.predict(inputTensor);

  // Display predictions
  const sorted_predictions = Array.from(predictions.dataSync())
    .map((probability, index) => ({ index,word:lstm_tokenizer['index_word'][index], probability:probability }))
    .sort((a, b) => b.probability - a.probability);
    let new_word=sorted_predictions[0]["word"];
    input_text_from_user=input_text_from_user+" "+new_word;
  }
  document.getElementById('phrase_lstm').innerHTML=input_text_from_user;
  
}
