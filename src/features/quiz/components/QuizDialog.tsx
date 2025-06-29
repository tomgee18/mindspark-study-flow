import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long quizzes
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For displaying results
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { QuizQuestion } from '@/features/ai/aiService'; // Updated path

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizQuestions: QuizQuestion[];
  mindMapTitle?: string; // Optional: to display as context for the quiz
}

type UserAnswer = string | null;
type Results = Array<{
  question: string;
  selectedAnswer: UserAnswer;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  options?: string[];
  type: 'multiple-choice' | 'true-false';
}> | null;

export function QuizDialog({ open, onOpenChange, quizQuestions, mindMapTitle = "Quiz" }: QuizDialogProps) {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Results>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setUserAnswers(new Array(quizQuestions.length).fill(null));
      setSubmitted(false);
      setResults(null);
      setScore(0);
    }
  }, [open, quizQuestions]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (submitted) return; // Don't allow changes after submission
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (userAnswers.some(answer => answer === null)) {
        // Or use a toast notification
      alert("Please answer all questions before submitting.");
      return;
    }

    let currentScore = 0;
    const detailedResults = quizQuestions.map((q, index) => {
      const isCorrect = userAnswers[index] === q.correctAnswer;
      if (isCorrect) {
        currentScore++;
      }
      return {
        question: q.question,
        selectedAnswer: userAnswers[index],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        options: q.options,
        type: q.type,
      };
    });

    setResults(detailedResults);
    setScore(currentScore);
    setSubmitted(true);
  };

  const getOptionLabel = (questionIndex: number, optionIndex: number, optionText: string) => {
    return `q${questionIndex}-option${optionIndex}-${optionText.replace(/\s+/g, '-')}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Updated DialogContent classes for max height and flex layout */}
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{mindMapTitle} - Quiz</DialogTitle>
          {submitted && results ? (
            <DialogDescription>
              You scored {score} out of {quizQuestions.length}. Review your answers below.
            </DialogDescription>
          ) : (
            <DialogDescription>
              Answer the questions below to test your knowledge.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Updated ScrollArea classes to use flex-grow and consistent padding */}
        <ScrollArea className="flex-grow my-4">
          <div className="space-y-6 pr-6"> {/* Added pr-6 to the content div inside ScrollArea */}
            {quizQuestions.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                submitted && results && results[index] ? (results[index].isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30') : 'border-border'
              }`}>
                <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                <RadioGroup
                  value={userAnswers[index] ?? undefined}
                  onValueChange={(value) => handleAnswerChange(index, value)}
                  disabled={submitted}
                >
                  {(q.type === 'multiple-choice' ? q.options : ['True', 'False'])?.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2 mb-1">
                      <RadioGroupItem
                        value={option}
                        id={getOptionLabel(index, optIndex, option)}
                        className={submitted && results && results[index] && results[index].correctAnswer === option ? 'text-green-700 dark:text-green-400' : ''}
                      />
                      <Label
                        htmlFor={getOptionLabel(index, optIndex, option)}
                        className={`flex items-center ${
                            submitted && results && results[index] ?
                            (results[index].correctAnswer === option ? 'text-green-700 dark:text-green-400 font-bold' : (results[index].selectedAnswer === option && !results[index].isCorrect ? 'text-red-700 dark:text-red-400 font-bold' : 'text-foreground'))
                            : 'text-foreground'
                        }`}
                      >
                        {option}
                        {submitted && results && results[index] && results[index].correctAnswer === option && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                        {submitted && results && results[index] && results[index].selectedAnswer === option && !results[index].isCorrect && <XCircle className="ml-2 h-4 w-4 text-red-500" />}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {submitted && results && results[index] && results[index].explanation && (
                  <Alert className={`mt-3 ${results[index].isCorrect ? 'border-green-300 dark:border-green-700' : 'border-orange-300 dark:border-orange-700'} bg-opacity-50`}>
                    <HelpCircle className={`h-4 w-4 ${results[index].isCorrect ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    <AlertTitle className="text-sm font-medium">Explanation</AlertTitle>
                    <AlertDescription className="text-xs">
                      {results[index].explanation}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Added mt-auto to DialogFooter for better positioning with flex-col */}
        <DialogFooter className="mt-auto pt-4"> {/* Added pt-4 for spacing from scroll area */}
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={userAnswers.some(a => a === null)}>Submit Answers</Button>
          ) : (
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
