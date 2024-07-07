import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {decode} from 'html-entities';
import {nanoid} from 'nanoid'

function App() {

  /* State variables*/
  const [gameStarted, setGameStarted] = useState(false)
  const [apiData, setApiData] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [restart, setRestart] = useState(Math.ceil(Math.random() * 1000))

  /* Side effects of fetching data from the API. The side effects runs every time the user starts a new game */
  useEffect(() => {
    fetch('https://opentdb.com/api.php?amount=10&category=15&type=multiple')
    .then(res => res.json())
    .then(data => { 
      decodeObjectProperties(data)
      let results_arr = data.results
      let new_results_arr = []
      for (let item of results_arr){
        let shuffled_items = shuffleArray([...item.incorrect_answers, item.correct_answer])
        let new_obj = {...item, all_answers: shuffled_items, id: nanoid(), selected_answer: ""}
        new_results_arr.push(new_obj)
      }
      setApiData(new_results_arr)
    })
  }, [restart])



  /* UTILITY FUNCTIONS START*/
  
  
  /* Function that suffles array elements using Fisher–Yates' shuffle Algorithm*/
  function shuffleArray(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  
  /* Function that recursively iterate over all properties, including the nested properties, to decode the HTML Entities*/
  function decodeObjectProperties(obj){
    for (let key in obj){
      if (typeof obj[key] === 'object' && obj[key] !== null){
          decodeObjectProperties(obj[key])
        } else {
          obj[key] = decode(obj[key])
        }
      }
    }


    function disableButtons(className){
      let buttons = document.querySelectorAll(className)
      buttons.forEach(function(button) {
        button.disabled = true;
      });
    }

    function disableAllButtons(){
      disableButtons('.answer-button')
      disableButtons('.answer-button-game-over')
      disableButtons('.answer-button-selected')
      disableButtons('.answer-button-correct')
      disableButtons('.answer-button-incorrect')
    }

    
    
  /* UTILITY FUNCTIONS END*/




  /* EVENT HANDLERS  START*/

  
  // Handler for when the user clicks the 'Start Quiz' button
  function startQuiz(){
    setGameStarted(true)
  }


  // Handler for when the user selects an answer. Updates the API based of the clicked answer
  function selectAnswer(id, answer){
    setApiData(oldVal => oldVal.map(item => {
      if (item.id === id){
        return {...item, selected_answer: answer}
      }else{
        return item
      }
    }))
  }


  // Handler for when the user clicks the 'Check answers' button.
  function checkAnswers(){
    if (apiData.every(item => item.selected_answer)){
      disableAllButtons()
      for (let data of apiData){
        if (data.selected_answer === data.correct_answer) {
          setCorrectAnswersCount(oldVal => oldVal + 1)
        }
      }
      setGameOver(true)
    }else {
      alert('Select all answers first')
    }
  }


  // Handler for when the user clicks the 'Play Again' button to restart the game
  function restartQuizzical(){
    setGameStarted(false)
    setGameOver(false)
    setCorrectAnswersCount(0)
    setRestart(Math.ceil(Math.random() * 1000))
  }

  
  /* EVENT HANDLERS END*/




  const questions_and_answers = apiData.map(item => {
    const every_answer = item.all_answers.map(answer => (
      <button key={nanoid()}
      className={item.selected_answer === answer ? 
        gameOver ? answer === item.correct_answer ? 'answer-button-correct' : 'answer-button-incorrect'
        : 'answer-button-selected' 
        : 
        gameOver ? answer === item.correct_answer ? 'answer-button-correct': 'answer-button-game-over': 'answer-button'} 
      onClick={() => selectAnswer(item.id, answer)}>
        {answer}
      </button>
    ))
    return (
      <div className='questions-and-answers'>
        <h2>{item.question}</h2>
        <div className='answers-container'>
          {every_answer}
        </div>
        <hr className='bottom-line' />
      </div>
    )
  }
)

  return (
    <>
      {gameStarted ?
        <main className='all-questions-and-answers-container'>
              <div className='questions-and-answers-container'>
                {questions_and_answers}
              </div>
              {!gameOver && <button className='check-button' onClick={checkAnswers}>Check answers</button>}
              {gameOver &&
              <div className='bottom-container'>
                <h2>You scored {correctAnswersCount}/{apiData.length} correct answers</h2>
                <button className='play-again-button' onClick={restartQuizzical} >Play Again</button>
              </div>
              }
        </main>
        :
        <main className='start-container'>
              <h1>Quizzical</h1>
              <h3> 10 trivia questions about video games</h3>
              <button className='start-button' onClick={startQuiz}>Start quiz</button>
        </main>
      }
    </>
  )
}

export default App
