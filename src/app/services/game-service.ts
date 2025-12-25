import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase-service';

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
  private fb = inject(FirebaseService);

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
    const userLikes = this.fb.connectedUser?.likedGames || [];
    return this.games.map(game => ({
      ...game,
      liked: userLikes.includes(game.id)
    }));
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

   async toggleLike(id: number): Promise<void> {
    await this.fb.toggleGameLike(id);
  }

  getLikedGames(): Game[] {
    return this.getAllGames().filter(g => g.liked);
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
