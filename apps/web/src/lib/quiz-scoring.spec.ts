import { describe, it, expect } from 'vitest';
import { ResultLevel } from './interactive';

interface QuizThreshold {
  level: ResultLevel;
  minScore: number;
  maxScore: number;
}

function calculateScore(answers: number[]): number {
  return answers.reduce((sum, answer) => sum + answer, 0);
}

function determineResultLevel(score: number, thresholds: QuizThreshold[]): ResultLevel {
  const sortedThresholds = [...thresholds].sort((a, b) => a.minScore - b.minScore);
  const matchedThreshold = sortedThresholds.find(
    t => score >= t.minScore && score <= t.maxScore
  ) || sortedThresholds[sortedThresholds.length - 1];
  return matchedThreshold.level;
}

describe('Quiz Scoring', () => {
  describe('QZ-01 (Anxiety: 7 questions, scale 0-3)', () => {
    const thresholds: QuizThreshold[] = [
      { level: ResultLevel.LOW, minScore: 0, maxScore: 4 },
      { level: ResultLevel.MODERATE, minScore: 5, maxScore: 9 },
      { level: ResultLevel.HIGH, minScore: 10, maxScore: 21 },
    ];

    it('should calculate score correctly for all zeros', () => {
      const answers = [0, 0, 0, 0, 0, 0, 0];
      const score = calculateScore(answers);
      expect(score).toBe(0);
    });

    it('should calculate score correctly for all maximums', () => {
      const answers = [3, 3, 3, 3, 3, 3, 3];
      const score = calculateScore(answers);
      expect(score).toBe(21);
    });

    it('should calculate score correctly for mixed answers', () => {
      const answers = [0, 1, 2, 1, 3, 0, 2];
      const score = calculateScore(answers);
      expect(score).toBe(9);
    });

    it('should return LOW level for score 0-4', () => {
      expect(determineResultLevel(0, thresholds)).toBe(ResultLevel.LOW);
      expect(determineResultLevel(2, thresholds)).toBe(ResultLevel.LOW);
      expect(determineResultLevel(4, thresholds)).toBe(ResultLevel.LOW);
    });

    it('should return MODERATE level for score 5-9', () => {
      expect(determineResultLevel(5, thresholds)).toBe(ResultLevel.MODERATE);
      expect(determineResultLevel(7, thresholds)).toBe(ResultLevel.MODERATE);
      expect(determineResultLevel(9, thresholds)).toBe(ResultLevel.MODERATE);
    });

    it('should return HIGH level for score 10-21', () => {
      expect(determineResultLevel(10, thresholds)).toBe(ResultLevel.HIGH);
      expect(determineResultLevel(15, thresholds)).toBe(ResultLevel.HIGH);
      expect(determineResultLevel(21, thresholds)).toBe(ResultLevel.HIGH);
    });
  });

  describe('QZ-02 (Burnout: 10 questions, scale 0-4)', () => {
    const thresholds: QuizThreshold[] = [
      { level: ResultLevel.LOW, minScore: 0, maxScore: 12 },
      { level: ResultLevel.MODERATE, minScore: 13, maxScore: 24 },
      { level: ResultLevel.HIGH, minScore: 25, maxScore: 40 },
    ];

    it('should calculate score correctly for all zeros', () => {
      const answers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const score = calculateScore(answers);
      expect(score).toBe(0);
    });

    it('should calculate score correctly for all maximums', () => {
      const answers = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
      const score = calculateScore(answers);
      expect(score).toBe(40);
    });

    it('should calculate score correctly for mixed answers', () => {
      const answers = [0, 1, 2, 3, 4, 1, 2, 3, 0, 2];
      const score = calculateScore(answers);
      expect(score).toBe(18);
    });

    it('should return LOW level for score 0-12', () => {
      expect(determineResultLevel(0, thresholds)).toBe(ResultLevel.LOW);
      expect(determineResultLevel(6, thresholds)).toBe(ResultLevel.LOW);
      expect(determineResultLevel(12, thresholds)).toBe(ResultLevel.LOW);
    });

    it('should return MODERATE level for score 13-24', () => {
      expect(determineResultLevel(13, thresholds)).toBe(ResultLevel.MODERATE);
      expect(determineResultLevel(18, thresholds)).toBe(ResultLevel.MODERATE);
      expect(determineResultLevel(24, thresholds)).toBe(ResultLevel.MODERATE);
    });

    it('should return HIGH level for score 25-40', () => {
      expect(determineResultLevel(25, thresholds)).toBe(ResultLevel.HIGH);
      expect(determineResultLevel(30, thresholds)).toBe(ResultLevel.HIGH);
      expect(determineResultLevel(40, thresholds)).toBe(ResultLevel.HIGH);
    });
  });

  describe('Edge cases', () => {
    const thresholds: QuizThreshold[] = [
      { level: ResultLevel.LOW, minScore: 0, maxScore: 4 },
      { level: ResultLevel.MODERATE, minScore: 5, maxScore: 9 },
      { level: ResultLevel.HIGH, minScore: 10, maxScore: 21 },
    ];

    it('should handle empty answers array', () => {
      const answers: number[] = [];
      const score = calculateScore(answers);
      expect(score).toBe(0);
      expect(determineResultLevel(score, thresholds)).toBe(ResultLevel.LOW);
    });

    it('should use last threshold as fallback for out-of-range scores', () => {
      // Score above max should use last threshold
      expect(determineResultLevel(100, thresholds)).toBe(ResultLevel.HIGH);
    });
  });
});
