import { CommitMessageAnalyzerService } from '../../services/commit-message-analyzer.service';

describe('CommitMessageAnalyzerService', () => {
  let analyzer: CommitMessageAnalyzerService;

  beforeEach(() => {
    analyzer = new CommitMessageAnalyzerService();
  });

  describe('analyzeCommitMessage', () => {
    it('should pass valid conventional commit', () => {
      const result = analyzer.analyzeCommitMessage(
        'abc123',
        'John Doe',
        '2024-01-01',
        'feat: add new feature'
      );

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail for empty subject', () => {
      const result = analyzer.analyzeCommitMessage('abc123', 'John Doe', '2024-01-01', '');

      expect(result.passed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(i => i.rule === 'subject-empty')).toBe(true);
    });

    it('should detect subject that is too long', () => {
      const longSubject = 'a'.repeat(100);
      const result = analyzer.analyzeCommitMessage('abc123', 'John Doe', '2024-01-01', longSubject);

      expect(result.issues.some(i => i.rule === 'subject-length')).toBe(true);
    });

    it('should validate conventional commit format', () => {
      const testCases = [
        { msg: 'feat: add feature', shouldPass: true },
        { msg: 'fix: bug fix', shouldPass: true },
        { msg: 'feat(api): add endpoint', shouldPass: true },
        { msg: 'docs: update README', shouldPass: true },
        { msg: 'invalid: bad type', shouldPass: false },
      ];

      testCases.forEach(({ msg, shouldPass }) => {
        const result = analyzer.analyzeCommitMessage('abc', 'John', '2024-01-01', msg);
        if (shouldPass) {
          expect(result.score).toBeGreaterThanOrEqual(70);
        } else {
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });
    });

    it('should handle commits with body', () => {
      const message = `feat: add new feature

This is a detailed explanation of the feature.
It spans multiple lines.`;

      const result = analyzer.analyzeCommitMessage('abc123', 'John Doe', '2024-01-01', message);

      expect(result.passed).toBe(true);
    });

    it('should detect non-capitalized subject', () => {
      const result = analyzer.analyzeCommitMessage(
        'abc123',
        'John Doe',
        '2024-01-01',
        'add new feature'
      );

      expect(result.issues.some(i => i.rule === 'subject-capitalization')).toBe(true);
    });

    it('should detect period at end of subject', () => {
      const result = analyzer.analyzeCommitMessage(
        'abc123',
        'John Doe',
        '2024-01-01',
        'Add new feature.'
      );

      expect(result.issues.some(i => i.rule === 'subject-period')).toBe(true);
    });
  });
});
