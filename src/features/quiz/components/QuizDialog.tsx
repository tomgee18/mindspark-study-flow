
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QuizQuestion } from '@/features/ai/aiService';

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizQuestions: QuizQuestion[];
  mindMapTitle?: string;
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
      setUserAnswers(new Array(quizQuestions.length).fill(null));
      setSubmitted(false);
      setResults(null);
      setScore(0);
    }
  }, [open, quizQuestions]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const unansweredQuestions = userAnswers.filter(answer => answer === null).length;
    
    if (unansweredQuestions > 0) {
        toast.error(`Please answer all questions before submitting. ${unansweredQuestions} question${unansweredQuestions > 1 ? 's' : ''} remaining.`);
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
    
    // Show completion toast
    toast.success(`Quiz completed! You scored ${currentScore} out of ${quizQuestions.length}.`);
  };

  const getOptionLabel = (questionIndex: number, optionIndex: number, optionText: string) => {
    return `q${questionIndex}-option${optionIndex}-${optionText.replace(/\s+/g, '-')}`;
  }

  const unansweredCount = userAnswers.filter(answer => answer === null).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{mindMapTitle} - Quiz</DialogTitle>
          {submitted && results ? (
            <DialogDescription>
              You scored {score} out of {quizQuestions.length} correct! Review your answers below.
            </DialogDescription>
          ) : (
            <DialogDescription>
              Answer the questions below to test your knowledge. {unansweredCount > 0 && `(${unansweredCount} questions remaining)`}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] p-4">
          <div className="space-y-6">
            {quizQuestions.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg border transition-colors ${
                submitted && results && results[index] ? (results[index].isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30') : 'border-border'
              }`}>
                <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                <RadioGroup
                  value={userAnswers[index] ?? undefined}
                  onValueChange={(value) => handleAnswerChange(index, value)}
                  disabled={submitted}
                >
                  {(q.type === 'multiple-choice' ? q.options : ['True', 'False'])?.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-3 mb-2">
                      <RadioGroupItem
                        value={option}
                        id={getOptionLabel(index, optIndex, option)}
                        className={submitted && results && results[index] && results[index].correctAnswer === option ? 'text-green-700 dark:text-green-400' : ''}
                      />
                      <Label
                        htmlFor={getOptionLabel(index, optIndex, option)}
                        className={`flex items-center cursor-pointer ${
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

        <DialogFooter className="mt-6">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={unansweredCount > 0}>
              Submit Answers {unansweredCount > 0 && `(${unansweredCount} remaining)`}
            </Button>
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
