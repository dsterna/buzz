//@ts-nocheck
import './App.css'
import './Button.scss'

import { useSubscribe } from "@rocicorp/reflect/react";
import { Slider, Sketch, Material, Colorful, Compact, Circle, Wheel, Block, Github, Chrome, ColorResult } from '@uiw/react-color';
import { Reflect } from '@rocicorp/reflect/client';
import { M } from '../reflect/mutators';
import { Game, getGame } from './Game';
import { useState } from 'react';
import { Team } from './Team';
import { Question } from './Question';

/**
 * Refactor: Alla dessa variabler, typ hasNoTeam baseras ju på data och inte frontend, så det skulle kunna ligga någon annan stans
 * 
 * published at https://refle-dsterna.reflect-server.net/
 */
function isColorDark(hexColor: string) {
  if (!hexColor) return
  hexColor = hexColor?.replace(/#/, '');
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return brightness < 0.5;
}


const App = ({ reflect, isHost = false }: { reflect: Reflect<M>, isHost: boolean }) => {

  // eslint-disable-next-line @typescript-eslint/ban-ts-comme
  const game = useSubscribe(reflect, async (tx) => getGame(tx, "game"));
  const gameTeams: Array<Team> = game?.teams ?? []
  const myTeam = gameTeams.find((team: Team) => team.members.find(elem => elem === reflect.userID)) ?? {}

  return (<>
    {isHost && <HostControls reflect={reflect} game={game} />}
    {game?.gameStarted === true ? <GameLoop reflect={reflect} game={game} myTeam={myTeam} /> : <TeamEdit reflect={reflect} game={game} gameTeams={gameTeams} myTeam={myTeam} />}
  </>
  )
}

const GameLoop = ({ reflect, game, myTeam }) => {

  /**
   * Antal frågor behövs inte, man fortsätter så länge man trycker på nästa
   */

  const handleAnswer = () => {
    const currentQuestion = { ...game?.questions[game?.currentQuestionIndex] }
    currentQuestion.beingAnswered = true
    currentQuestion.beingAnsweredByTeamIndex = parseInt(myTeam.id)

    const newQuestions = game.questions.map((elem, index) =>
      game?.currentQuestionIndex === index ? currentQuestion : elem
    )
    reflect.mutate.updateGame({ ...game, id: "game", questions: newQuestions })
  }

  const opponents = []
  game.teams.forEach(elem => {
    if (elem.id !== myTeam?.id)
      opponents.push(elem)
  })
  const currentQuestion = game?.questions[game?.currentQuestionIndex]

  const hasTeam = game?.teams.some(team => team.members.some(elem => elem === reflect.userID))
  const handleJoin = (index) => {
    if (!hasTeam) {
      const newTeams = game.teams.map((team, i) => i === index ? { ...team, members: [...team.members, reflect.userID] } : team)
      reflect.mutate.updateGame({ ...game, id: "game", teams: newTeams })
    }
  }
  return (
    <div >
      {!hasTeam && <b>Anslut till ett lag</b>}
      <div style={{ display: "flex", flexDirection: "row" }}>
        {game.teams.map((team: Team, index: number) => {
          const teamScore = game.questions.reduce(
            (accumulator: number, currentValue: Question) => (currentValue.answeredByTeamIndex === index) ? (accumulator + currentValue.score) : accumulator, 0
          );
          const anotherTeamIsAnswering = currentQuestion.beingAnsweredByTeamIndex === index && currentQuestion.beingAnsweredByTeamIndex !== parseInt(myTeam.id)
          // const teamScore = game.questions.reduce((sum, elem) => elem.answeredByTeamIndex === index && elem.score + sum : sum)

          // [1,2,3,4].reduce((sum, x) => sum + x);
          return (
            <>
              <div className='sonar-wrapper'>
                <fieldset key={index} style={{ backgroundColor: team?.color }} onClick={() => handleJoin(index)}>{teamScore}</fieldset>
                {anotherTeamIsAnswering &&
                  <div className="sonar-emitter-small" >
                    <div className={"sonar-wave sonar-wave-fast"} style={{ backgroundColor: team?.color }}></div>
                    <div className={"sonar-wave1 sonar-wave1-fast"} style={{ backgroundColor: team?.color }}></div>
                  </div>}
              </div>
            </>
          )
        }
        )}
      </div>
      <br />
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        Fråga {currentQuestion.id}
      </div>

      <br />
      {currentQuestion.isAnswered ? <>Besvarad av {game?.teams[currentQuestion.answeredByTeamIndex]?.teamName}</> : hasTeam && <Button currentQuestion={currentQuestion} myTeam={myTeam} handleAnswer={handleAnswer} />}
    </div>
  )
}

function adjust(color, amount) {
  if (!color) return ""
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function getGradient(color) {
  return `
  linear-gradient(
    to left,
    ${adjust(color, -30)} 0%,
    ${adjust(color, -40)} 8%,
    ${adjust(color, -60)} 92%,
    ${adjust(color, -90)} 100%)`
}

const Button = ({
  currentQuestion,
  myTeam,
  handleAnswer }) => {
  const beingAnswered = currentQuestion?.beingAnswered
  const beingAnsweredByMyTeam = currentQuestion.beingAnsweredByTeamIndex === parseInt(myTeam.id)
  const beingAnsweredByOtherTeam = beingAnswered && !beingAnsweredByMyTeam
  const myColor = myTeam?.color
  const activeQuestion = currentQuestion.active
  const renderText = () => {
    if (activeQuestion && !beingAnswered)
      return 'Svara'
    else if (beingAnsweredByMyTeam)
      return 'Svarar'
    else return 'Vänta'

  }
  return (<>

    <div className="sonar-wrapper">
      <div className='custom-button-wrapper'>
        <button disabled={!activeQuestion || beingAnsweredByOtherTeam} className="pushable" onClick={handleAnswer}>
          <span className={`shadow ${activeQuestion ? "shadow-animation" : ""}`}></span>
          <span style={{ background: getGradient(myColor) }} className="edge"></span>
          <span style={{ background: myColor, color: isColorDark(myColor) ? "white" : "black" }} className={`front  ${activeQuestion ? "front-animation" : ""}`}>
            {renderText()}
          </span>
        </button>
      </div>
      <Sonar beingAnswered={beingAnswered} myColor={myColor} beingAnsweredByMyTeam={beingAnsweredByMyTeam} activeQuestion={activeQuestion} />
    </div>

  </>
  )
}

const Sonar = ({ beingAnswered, myColor, beingAnsweredByMyTeam, activeQuestion }) => {
  if (beingAnswered) {
    if (beingAnsweredByMyTeam) {
      return (
        <div className="sonar-emitter" >
          <div className={"sonar-wave sonar-wave-fast"} style={{ backgroundColor: myColor }}></div>
          <div className={"sonar-wave1 sonar-wave1-fast"} style={{ backgroundColor: myColor }}></div>
        </div>
      )
    }
    else {
      return <></>

    }
  }
  if (activeQuestion)
    return (<div className="sonar-emitter" >
      <div className={`sonar-wave`} style={{ backgroundColor: myColor }}></div>
      <div className={`sonar-wave1`} style={{ backgroundColor: myColor }}></div>
    </div>)
}
const HostControls = ({ reflect, game }) => {
  const [questionTimed, setQuestionTimed] = useState(false)
  const questionActive = game?.questions[game.currentQuestionIndex].active

  const startGame = () => {
    reflect.mutate.updateGame({ ...game, id: "game", gameStarted: true })
  }
  const pauseGame = () => {
    reflect.mutate.updateGame({ ...game, id: "game", gameStarted: false })
  }
  const toggleActive = () => {
    const newQ = {
      ...currentQuestion, active: !questionActive,
      beingAnswered: false,
      beingAnsweredByTeamIndex: -1
    }
    const newQuestions = game.questions.map((elem, index) => index === game?.currentQuestionIndex ? newQ : elem)
    reflect.mutate.updateGame({ ...game, id: "game", questions: newQuestions })
  }
  const currentQuestion = game?.questions.find((elem, index) => index === game?.currentQuestionIndex) ?? {}

  const handlePrev = () => {
    reflect.mutate.updateGame({ ...game, id: "game", currentQuestionIndex: game.currentQuestionIndex - 1 })
  }

  const handleNext = () => {
    reflect.mutate.updateGame({ ...game, id: "game", currentQuestionIndex: game.currentQuestionIndex + 1 })
  }

  const onCorrectAnswer = () => {
    const newCurrentQuestion = {
      ...currentQuestion,
      answeredByTeamIndex: currentQuestion.beingAnsweredByTeamIndex,
      isAnswered: true,
      active: false,
      beingAnswered: false,
      beingAnsweredByTeamIndex: -1
    }
    const newQuestions = game.questions.map((elem, index) => game.currentQuestionIndex === index ? newCurrentQuestion : elem)
    reflect.mutate.updateGame({ ...game, id: "game", questions: newQuestions })

  }
  const onWrongAnswer = () => {
    const newCurrentQuestion = {
      ...currentQuestion,
      answeredByTeamIndex: -1,
      isAnswered: false,
      active: true,
      beingAnswered: false,
      beingAnsweredByTeamIndex: -1
    }
    const newQuestions = game.questions.map((elem, index) => game.currentQuestionIndex === index ? newCurrentQuestion : elem)
    reflect.mutate.updateGame({ ...game, id: "game", questions: newQuestions })
  }
  const handleScoreChange = (e: Event) => {
    const newVal: number = parseInt(e.target!.value)
    if (newVal >= 0) {
      const newCurrentQuestion = { ...currentQuestion, score: newVal }
      const newQuestions = game.questions.map((elem, index) => game.currentQuestionIndex === index ? newCurrentQuestion : elem)
      reflect.mutate.updateGame({ ...game, id: "game", questions: newQuestions })
    }

  }
  return (
    <>
      {game?.gameStarted ? <button onClick={pauseGame}>Pausa spel </button> : <button onClick={startGame}>Starta spel</button>}
      <br />
      {game?.gameStarted && <>
        <div>
          <b>
            <button disabled={game.currentQuestionIndex === 0} onClick={handlePrev}>◁</button>
            Fråga {currentQuestion.id}
            <button disabled={game.currentQuestionIndex === game.questions.length - 1} onClick={handleNext}>▷</button>
          </b>
        </div>

        <div>
          {/* <label htmlFor="questionTimed">Tidsbegänsad</label>
          <input type="checkbox" id="questionTimed" />
          {questionTimed && <>
            <label htmlFor="questionTime">Tidsbegänsad</label>
            <input id="questionTime" type="number" />
          </>} */}
        </div>
        <div>

          <label htmlFor="questionScore"> Ger antal poäng</label>
          <input type="number" id="questionScore" onChange={handleScoreChange} value={currentQuestion.score} />
        </div>
        <button onClick={toggleActive}>{questionActive ? "Deaktivera" : "Aktivera"}</button>
        <br />
        {currentQuestion.beingAnswered && <>
          <br />
          <b>Nu svarar:
            <br />

            {game.teams[currentQuestion.beingAnsweredByTeamIndex].teamName}</b>
          <button style={{ backgroundColor: "green" }} onClick={onCorrectAnswer}>Rätt svar</button>
          <button style={{ backgroundColor: "red" }} onClick={onWrongAnswer}>Fel svar</button>

        </>

        }
        <br />
      </>}
    </>
  )
}
const TeamEdit = ({ reflect, gameTeams, myTeam, game }) => {

  const [isEditingTeamName, setIsEditingTeamName] = useState(false)
  const [isEditingColor, setIsEditingColor] = useState(false)

  const handleJoin = (joinIndex: number) => {
    setIsEditingColor(false)
    setIsEditingTeamName(false)
    let alreadyJoinedIndex = -1
    const teams = gameTeams.map((team: Team, teamIndex: number) => {
      const array = [...team.members]
      const index = array.indexOf(reflect.userID);
      if (index > -1) {
        alreadyJoinedIndex = teamIndex
        array.splice(index, 1)
      };
      return {
        ...team, members: array
      }
    });

    const newTeams = [...teams]
    if (alreadyJoinedIndex !== joinIndex) {
      newTeams[joinIndex].members.push(reflect.userID)
    }
    reflect.mutate.updateGame({ ...game, id: "game", teams: newTeams })
  }

  const handleNameChage = (name: string, teamId: string) => {
    const newTeams = gameTeams.map((elem: Team, i: number) => i === parseInt(teamId) ? { ...elem, teamName: name } : elem)
    reflect.mutate.updateGame({ ...game, id: "game", teams: newTeams })
  }
  const handleColorChange = (color: ColorResult) => {
    const newTeams = gameTeams.map((elem: Team, i: number) => i === parseInt(myTeam?.id) ? { ...elem, color: color.hex } : elem)
    reflect.mutate.updateGame({ ...game, id: "game", teams: newTeams })
  }

  return (
    <>
      {gameTeams.map((team: Team, index: number) => {
        let isMyTeam = index === parseInt(myTeam?.id);
        return (
          <fieldset style={{ backgroundColor: team.color, display: "flex", justifyContent: "space-between" }} key={index}>
            {(isMyTeam && isEditingTeamName) ? <>
              <input value={myTeam?.teamName} onChange={(e) => handleNameChage(e.target.value, myTeam?.id)} />
              <button onClick={() => { myTeam?.teamName !== "" ? setIsEditingTeamName(false) : {} }}>⏎</button>
            </>
              : <div style={{ color: isColorDark(team.color) ? "white" : "black" }} onClick={() => { isMyTeam ? setIsEditingTeamName(true) : {} }}>
                {team.teamName}
              </div>}
            {
              team.members.map((elem, i) => <div key={i}>🙋‍♂️</div>)
            }
            {isMyTeam &&
              <div >
                <button onClick={() => setIsEditingColor(!isEditingColor)}>🎨</button>
                {isEditingColor ? <Colorful color={team.color} onChange={handleColorChange} disableAlpha={true} /> : <></>}
              </div>}
            <button disabled={!!isEditingTeamName} onClick={() => handleJoin(index)}>{isMyTeam ? "Lämna" : "Gå med"}</button>
          </fieldset>)

      })}
    </>
  )
}


export default App
