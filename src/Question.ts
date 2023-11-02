import { generate, Update } from "@rocicorp/rails";
// All entities must include at least id:string.
export type Question = {
  id: string;
  answeredByTeamIndex: number;
  isAnswered: boolean;
  active: boolean;
  beingAnswered: boolean;
  beingAnsweredByTeamIndex: number;
  score: number;
};

export const {
  put: putQuestion,
  get: getQuestion,
  update: updateQuestion,
  list: listQuestions,
  delete: deleteQuestion,
} = generate<Question>("question");
