import { generate, Update } from "@rocicorp/rails";
import { Question } from "./Question";
import { Team } from "./Team";

// All entities must include at least id:string.
export type Game = {
    id: string,
    gameStarted: boolean,
    nrOfTeams: number,
    nrOfQuestions: number,
    countPoints: boolean,
    oneAnswerPerQuestion: boolean,
    questions: Array<Question>,
    teams: Array<Team>,
    currentQuestionIndex: number,
};

export const {
    put: putGame,
    get: getGame,
    update: updateGame,
    list: listGames,
    delete: deleteGame,
} = generate<Game>("game");
