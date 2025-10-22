/**
 * Simple in-memory rate limiter for production runs
 * In production, persist this to database
 */
export class RunsCounter {
  private map = new Map<string, number>();

  constructor(private maxRuns: number) {}

  inc(key: string): number {
    const current = (this.map.get(key) ?? 0) + 1;
    this.map.set(key, current);

    if (current > this.maxRuns) {
      throw new Error(
        `Max production runs (${this.maxRuns}) exceeded for key: ${key}`
      );
    }

    return current;
  }

  get(key: string): number {
    return this.map.get(key) ?? 0;
  }

  reset(key: string): void {
    this.map.delete(key);
  }

  getAll(): Map<string, number> {
    return new Map(this.map);
  }
}
