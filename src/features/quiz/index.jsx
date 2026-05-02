import { useState } from 'react';
import { quizQuestions } from './quizData';

/**
 * Quiz Component
 * Interactive voter awareness quiz with progressive scoring,
 * real-time feedback, and educational explanations.
 * Implements gamification to improve civic engagement.
 */
const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  /** Handles answer selection and scoring */
  const handleAnswerOptionClick = (option) => {
    if (showExplanation) return;
    
    setSelectedOption(option);
    const correct = option === quizQuestions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  /** Advances to the next question or shows final score */
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      setShowScore(true);
    }
  };

  /** Resets quiz to initial state */
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  /** Returns the appropriate CSS classes for an answer option */
  const getOptionClasses = (option) => {
    if (selectedOption === option) {
      return isCorrect
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-rose-500 bg-rose-50 text-rose-800';
    }
    if (showExplanation && option === quizQuestions[currentQuestion].correctAnswer) {
      return 'border-green-500 bg-green-50 text-green-800';
    }
    return 'border-slate-100 hover:border-[#004A99] hover:bg-slate-50 text-slate-600';
  };

  if (showScore) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center" role="status" aria-label="Quiz results">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Quiz Completed!</h2>
        <p className="text-lg text-slate-600 mb-8">
          You scored <span className="font-bold text-[#004A99]">{score}</span> out of <span className="font-bold">{quizQuestions.length}</span>
        </p>
        <button
          onClick={resetQuiz}
          aria-label="Retake the voter awareness quiz"
          className="px-8 py-3 bg-[#004A99] text-white rounded-xl font-bold hover:bg-[#003366] transition-all shadow-lg hover:shadow-[#004A99]/30"
        >
          Try Again
        </button>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto" role="region" aria-label="Voter Awareness Quiz">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#004A99]">Voter Awareness Quiz</span>
            <h2 className="text-2xl font-bold text-slate-800">Question {currentQuestion + 1}/{quizQuestions.length}</h2>
          </div>
          <div className="text-sm font-medium text-slate-500" aria-live="polite">
            Score: <span className="text-slate-800">{score}</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin={1} aria-valuemax={quizQuestions.length} aria-label="Quiz progress">
          <div 
            className="bg-[#004A99] h-full transition-all duration-500" 
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-800 mb-8 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerOptionClick(option)}
              disabled={showExplanation}
              aria-pressed={selectedOption === option}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center ${getOptionClasses(option)}`}
            >
              <span className="font-medium">{option}</span>
              {selectedOption === option && (
                <span aria-hidden="true">
                  {isCorrect ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-8" aria-live="polite">
            <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-rose-50 border-rose-100'}`}>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isCorrect ? 'text-green-700' : 'text-rose-700'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
            <button
              onClick={handleNextQuestion}
              aria-label={currentQuestion + 1 === quizQuestions.length ? 'Finish quiz and see results' : 'Go to next question'}
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              {currentQuestion + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
