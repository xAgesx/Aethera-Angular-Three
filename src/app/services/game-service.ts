import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Game {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  thumbnail: string;
  images?: string[];
  rating?: number | string;
  players?: string;
  release?: string;
  developer?: string;
  duration?: string;
  complexity?: string;
  topScore?: string;
  topPlayer?: string;
  liked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private games: Game[] = [];
  http = inject(HttpClient);

  constructor() {
    this.http
      .get<Game[]>('https://raw.githubusercontent.com/xAgesx/Aethera_Games_File/refs/heads/main/Games_list.json')
      .subscribe({
        next: (data) => {
          this.games = data;
          console.log('Games loaded:', this.games);
        }
      });
  }

  getAllGames(): Game[] {
    if (!this.games) return [];
    return [...this.games];
  }

  getGameById(id: number): Game | undefined {
    return this.games.find(g => g.id === id);
  }

  getAllTags(): string[] {
    const allTags: string[] = [];
    for (const game of this.games) {
      for (const tag of game.tags) {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      }
    }
    return allTags;
  }

  toggleLike(id: number): void {
    const game = this.games.find(g => g.id === id);
    if (game) game.liked = !game.liked;
  }

  getLikedGames(): Game[] {
    return this.games.filter(g => g.liked);
  }

  addGame(game: Omit<Game, 'id' | 'liked'>): Game {
    const newGame: Game = {
      ...game,
      id: this.games.length ? Math.max(...this.games.map(g => g.id)) + 1 : 1,
      liked: false
    };
    this.games.push(newGame);
    return newGame;
  }

  updateGame(updated: Partial<Game> & { id: number }): Game | undefined {
    const idx = this.games.findIndex(g => g.id === updated.id);
    if (idx === -1) return undefined;
    this.games[idx] = { ...this.games[idx], ...updated };
    return this.games[idx];
  }

  deleteGame(id: number): void {
    this.games = this.games.filter(g => g.id !== id);
  }
}
