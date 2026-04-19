import type { QuizState } from "./quiz-types";

export function createQuizState(): QuizState {
  return {
    currentIndex: 0,
    score: 0,
    selectedChoiceId: null,
  };
}

export function selectAnswer(
  state: QuizState,
  selectedChoiceId: number,
  correctChoiceId: number
): QuizState {
  if (state.selectedChoiceId !== null) return state;

  return {
    ...state,
    selectedChoiceId,
    score:
      selectedChoiceId === correctChoiceId ? state.score + 1 : state.score,
  };
}

export function goToNextQuestion(state: QuizState): QuizState {
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    selectedChoiceId: null,
  };
}

export function restartQuiz(): QuizState {
  return createQuizState();
}