// This file defines our "mutators".
//
// Mutators are how you change data in Reflect apps.
//
// They are registered with Reflect at construction-time and callable like:
// `myReflect.mutate.increment()`.
//
// Reflect runs each mutation immediately (optimistically) on the client,
// against the local cache, and then later (usually moments later) sends a
// description of the mutation (its name and arguments) to the server, so that
// the server can *re-run* the mutation there against the authoritative
// datastore.
//
// This re-running of mutations is how Reflect handles conflicts: the
// mutators defensively check the database when they run and do the appropriate
// thing. The Reflect sync protocol ensures that the server-side result takes
// precedence over the client-side optimistic result.

import type { WriteTransaction, ReadTransaction } from "@rocicorp/reflect";
import { colors } from "../src/colors";
import {
  Question,
  putQuestion,
  updateQuestion,
  listQuestions,
  deleteQuestion,
  getQuestion,
} from "../src/Question";

import { Game, putGame, getGame, updateGame, listGames } from "../src/Game";
import { Team } from "../src/Team";

export const mutators = {
  putQuestion,
  updateQuestion,
  listQuestions,
  answerQuestion,
  deleteQuestion,
  putGame,
  getGame,
  updateGame,
  listGames,
  createGame,
  getGameFromCode,
};

export type M = typeof mutators;

// async function increment(
//   tx: WriteTransaction,
//   { key, delta }: { key: string; delta: number }
// ) {
//   console.log(`incrementing ${key} by ${delta}`);
//   const prev = await tx.get<number>(key);
//   const next = (prev ?? 0) + delta;
//   await tx.put(key, next);
// }

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createGame(
  tx: WriteTransaction,
  game: {
    id: string;
    nrOfTeams: number;
    nrOfQuestions: number;
    countPoints: boolean;
    oneAnswerPerQuestion: boolean;
  }
) {
  const questions = new Array<Question>();
  for (let i = 0; i < game.nrOfQuestions; i++) {
    questions.push({
      id: (i + 1).toString(),
      isAnswered: false,
      answeredByTeamIndex: -1,
      active: false,
      beingAnswered: false,
      beingAnsweredByTeamIndex: -1,
      score: 1,
    });
  }
  const teams = new Array<Team>();

  for (let i = 0; i < game.nrOfTeams; i++) {
    let randomColor = colors[randomInteger(0, colors.length - 1)];

    teams.push({
      id: "" + i,
      color: randomColor,
      members: [],
      teamName: `Lag ${i + 1}`,
      score: 0,
    });
  }
  let newGame: Game = {
    ...game,
    id: "game",
    gameStarted: false,
    questions: questions,
    teams: teams,
    currentQuestionIndex: 0,
  };

  await putGame(tx, newGame);
}

async function getGameFromCode(tx: ReadTransaction, id: string) {
  return await getGame(tx, "game");
}

async function answerQuestion(
  tx: WriteTransaction,
  question: { id: string; name: string }
) {
  const alreadyAnswered: Question = await getQuestion(tx, question.id);

  if (alreadyAnswered?.isAnswered === false) {
    let newQuestion: Question = {
      id: question.id,
      isAnswered: true,
      answeredBy: question.name,
    };

    await updateQuestion(tx, newQuestion);
    // if (!alreadyAnswered) tx.put(key, { question, isAnswered, answeredBy });
    // console.log(`tx ${tx}}`);
  }
}
