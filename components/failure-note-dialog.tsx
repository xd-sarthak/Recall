"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countWords, isValidFailureNoteText } from "@/lib/validation/failure-notes";
import { cn } from "@/lib/utils";

interface FailureNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notes: string[]) => void;
  onSkip: () => void;
}

const MAX_BULLETS = 3;
const MAX_WORDS_PER_BULLET = 15;

export function FailureNoteDialog({
  open,
  onOpenChange,
  onSave,
  onSkip,
}: FailureNoteDialogProps) {
  const [notes, setNotes] = useState<string[]>(["", "", ""]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setNotes(["", "", ""]);
      setErrors([]);
    }
  }, [open]);

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = value;
    setNotes(newNotes);

    const newErrors = [...errors];
    const trimmedValue = value.trim();

    if (trimmedValue) {
      if (!isValidFailureNoteText(trimmedValue)) {
        newErrors[index] =
          "Only letters, digits, spaces, and basic punctuation (. , ; : ' - ( )) are allowed";
      } else {
        const wordCount = countWords(trimmedValue);
        if (wordCount > MAX_WORDS_PER_BULLET) {
          newErrors[index] = `Exceeds ${MAX_WORDS_PER_BULLET} words (found ${wordCount})`;
        } else {
          newErrors[index] = "";
        }
      }
    } else {
      newErrors[index] = "";
    }

    setErrors(newErrors);
  };

  const handleSave = () => {
    const filteredNotes = notes
      .map((note) => note.trim())
      .filter((note) => note.length > 0);

    if (filteredNotes.length === 0) {
      onSkip();
      return;
    }

    const hasErrors = errors.some((error) => error.length > 0);
    if (hasErrors) {
      return;
    }

    onSave(filteredNotes);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  const getWordCount = (text: string): number => {
    return countWords(text.trim());
  };

  const hasAnyContent = notes.some((note) => note.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why did you fail?</DialogTitle>
          <DialogDescription>
            Name the mistake, not the solution. Maximum 3 bullets, 15 words each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {Array.from({ length: MAX_BULLETS }).map((_, index) => {
            const note = notes[index] || "";
            const wordCount = getWordCount(note);
            const error = errors[index];
            const isOverLimit = wordCount > MAX_WORDS_PER_BULLET;
            const isEmpty = !note.trim();

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`note-${index}`} className="text-sm">
                    Note {index + 1} {index === 0 && "(optional)"}
                  </Label>
                  <span
                    className={cn(
                      "text-xs",
                      isEmpty
                        ? "text-muted-foreground"
                        : isOverLimit
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {wordCount} / {MAX_WORDS_PER_BULLET} words
                  </span>
                </div>
                <Input
                  id={`note-${index}`}
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder="e.g., Assumed window monotonicity; constraint wasn't"
                  className={cn(
                    error && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
            Skip
          </Button>
          <Button
            onClick={handleSave}
            disabled={errors.some((error) => error.length > 0)}
            className="w-full sm:w-auto"
          >
            {hasAnyContent ? "Save & Mark Failed" : "Mark Failed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
