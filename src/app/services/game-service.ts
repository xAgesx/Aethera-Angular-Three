import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private games: Game[] = [
    {
      id: 1,
      title: 'Solar Explorer',
      description: 'Learn about our solar system through an interactive 3D model.',
      longDescription:
        'Solar Explorer lets you navigate our solar system in a fully interactive 3D environment. Rotate planets, view distances, and test your knowledge in mini-quests about astronomy.',
      tags: ['science', 'education', '3D'],
      thumbnail: 'assets/games/solar-thumb.jpg',
      images: [
        'assets/games/solar1.jpg',
        'assets/games/solar2.jpg',
        'assets/games/solar3.jpg'
      ],
      rating: 4.8,
      players: '2.3K',
      release: '2025-01-20',
      developer: 'Aethera Labs',
      duration: '15–20 min',
      complexity: 'Beginner',
      topScore: '87,320',
      topPlayer: 'AstroNova',
      liked: false
    },
    {
      id: 2,
      title: 'Crystal Labyrinth',
      description: 'Solve puzzles inside a glowing crystal maze built with Three.js.',
      longDescription:
        'Crystal Labyrinth challenges players to solve intricate light-based puzzles. As you progress, new mechanics like refracted beams and color gates make each level uniquely challenging.',
      tags: ['puzzle', 'adventure', '3D'],
      thumbnail: 'assets/games/crystal-thumb.jpg',
      images: [
        'assets/games/crystal1.jpg',
        'assets/games/crystal2.jpg'
      ],
      rating: 4.6,
      players: '1.1K',
      release: '2025-02-10',
      developer: 'Aethera Studios',
      duration: '20–30 min',
      complexity: 'Intermediate',
      topScore: '63,480',
      topPlayer: 'MazeMaster',
      liked: false
    }
  ];

  constructor() {}

  getAllGames(): Game[] {
    return [...this.games];
  }

  getGameById(id: number): Game | undefined {
    return this.games.find(g => g.id === id);
  }

  getAllTags(): string[] {
    const allTags = this.games.flatMap(g => g.tags);
    return Array.from(new Set(allTags));
  }

  toggleLike(id: number): void {
    const game = this.games.find(g => g.id === id);
    if (game) {
      game.liked = !game.liked;
    }
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
