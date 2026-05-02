import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Quiz from '../features/quiz';
import { quizQuestions } from '../features/quiz/quizData';

describe('Quiz Component', () => {
  it('should render the quiz heading', () => {
    render(<Quiz />);
    expect(screen.getByText('Voter Awareness Quiz')).toBeInTheDocument();
  });

  it('should show question 1 initially', () => {
    render(<Quiz />);
    expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    expect(screen.getByText(quizQuestions[0].question)).toBeInTheDocument();
  });

  it('should render all answer options for the first question', () => {
    render(<Quiz />);
    quizQuestions[0].options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should show score as 0 initially', () => {
    render(<Quiz />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<Quiz />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should highlight correct answer and show explanation when correct answer is selected', () => {
    render(<Quiz />);
    const correctAnswer = quizQuestions[0].correctAnswer;
    fireEvent.click(screen.getByText(correctAnswer));
    
    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText(quizQuestions[0].explanation)).toBeInTheDocument();
  });

  it('should highlight wrong answer and show explanation when incorrect answer is selected', () => {
    render(<Quiz />);
    const wrongAnswer = quizQuestions[0].options.find(o => o !== quizQuestions[0].correctAnswer);
    fireEvent.click(screen.getByText(wrongAnswer));
    
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText(quizQuestions[0].explanation)).toBeInTheDocument();
  });

  it('should increment score when correct answer is selected', () => {
    render(<Quiz />);
    const correctAnswer = quizQuestions[0].correctAnswer;
    fireEvent.click(screen.getByText(correctAnswer));
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should not increment score when wrong answer is selected', () => {
    render(<Quiz />);
    const wrongAnswer = quizQuestions[0].options.find(o => o !== quizQuestions[0].correctAnswer);
    fireEvent.click(screen.getByText(wrongAnswer));
    
    // Score should remain 0
    const scoreElements = screen.getAllByText('0');
    expect(scoreElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should disable options after selection', () => {
    render(<Quiz />);
    const correctAnswer = quizQuestions[0].correctAnswer;
    fireEvent.click(screen.getByText(correctAnswer));
    
    // All option buttons should be disabled after selection
    quizQuestions[0].options.forEach((option) => {
      expect(screen.getByText(option).closest('button')).toBeDisabled();
    });
  });

  it('should show Next Question button after selection', () => {
    render(<Quiz />);
    fireEvent.click(screen.getByText(quizQuestions[0].correctAnswer));
    
    expect(screen.getByText('Next Question')).toBeInTheDocument();
  });

  it('should advance to next question when Next Question is clicked', () => {
    render(<Quiz />);
    fireEvent.click(screen.getByText(quizQuestions[0].correctAnswer));
    fireEvent.click(screen.getByText('Next Question'));
    
    expect(screen.getByText(/Question 2/)).toBeInTheDocument();
    expect(screen.getByText(quizQuestions[1].question)).toBeInTheDocument();
  });

  it('should show Finish Quiz on the last question', () => {
    render(<Quiz />);
    
    // Navigate through all questions
    for (let i = 0; i < quizQuestions.length - 1; i++) {
      fireEvent.click(screen.getByText(quizQuestions[i].correctAnswer));
      fireEvent.click(screen.getByText('Next Question'));
    }
    
    // On the last question
    fireEvent.click(screen.getByText(quizQuestions[quizQuestions.length - 1].correctAnswer));
    expect(screen.getByText('Finish Quiz')).toBeInTheDocument();
  });

  it('should show final score screen after completing all questions', () => {
    render(<Quiz />);
    
    // Answer all questions correctly
    for (let i = 0; i < quizQuestions.length; i++) {
      fireEvent.click(screen.getByText(quizQuestions[i].correctAnswer));
      if (i < quizQuestions.length - 1) {
        fireEvent.click(screen.getByText('Next Question'));
      } else {
        fireEvent.click(screen.getByText('Finish Quiz'));
      }
    }
    
    expect(screen.getByText('Quiz Completed!')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should show perfect score when all answers are correct', () => {
    render(<Quiz />);
    
    for (let i = 0; i < quizQuestions.length; i++) {
      fireEvent.click(screen.getByText(quizQuestions[i].correctAnswer));
      if (i < quizQuestions.length - 1) {
        fireEvent.click(screen.getByText('Next Question'));
      } else {
        fireEvent.click(screen.getByText('Finish Quiz'));
      }
    }
    
    // Perfect score — appears twice: once as score and once as total
    const scoreElements = screen.getAllByText(String(quizQuestions.length));
    expect(scoreElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should reset quiz when Try Again is clicked', () => {
    render(<Quiz />);
    
    // Complete the quiz
    for (let i = 0; i < quizQuestions.length; i++) {
      fireEvent.click(screen.getByText(quizQuestions[i].correctAnswer));
      if (i < quizQuestions.length - 1) {
        fireEvent.click(screen.getByText('Next Question'));
      } else {
        fireEvent.click(screen.getByText('Finish Quiz'));
      }
    }
    
    // Reset
    fireEvent.click(screen.getByText('Try Again'));
    
    expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    expect(screen.getByText(quizQuestions[0].question)).toBeInTheDocument();
  });

  it('should not allow double-click on same question', () => {
    render(<Quiz />);
    const correctAnswer = quizQuestions[0].correctAnswer;
    const wrongAnswer = quizQuestions[0].options.find(o => o !== correctAnswer);
    
    // Select correct first
    fireEvent.click(screen.getByText(correctAnswer));
    // Try clicking another — should be ignored since options are disabled
    fireEvent.click(screen.getByText(wrongAnswer));
    
    // Score should still be 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should have accessible region role', () => {
    render(<Quiz />);
    expect(screen.getByRole('region', { name: /voter awareness quiz/i })).toBeInTheDocument();
  });

  it('should have radiogroup for answer options', () => {
    render(<Quiz />);
    expect(screen.getByRole('radiogroup', { name: /answer options/i })).toBeInTheDocument();
  });
});

describe('Quiz Data Integrity', () => {
  it('should have at least 3 questions', () => {
    expect(quizQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it('every question should have an id, question, options, correctAnswer, and explanation', () => {
    quizQuestions.forEach((q) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('correctAnswer');
      expect(q).toHaveProperty('explanation');
    });
  });

  it('every question should have at least 2 options', () => {
    quizQuestions.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('correctAnswer should be one of the options', () => {
    quizQuestions.forEach((q) => {
      expect(q.options).toContain(q.correctAnswer);
    });
  });

  it('each question should have unique id', () => {
    const ids = quizQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
