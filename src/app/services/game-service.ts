import { Injectable } from '@angular/core';

export interface Game {
  id: number;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
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
      tags: ['education', 'science', '3D'],
      thumbnail: 'assets/games/solar.jpg',
      liked: false
    },
    {
      id: 2,
      title: 'Crystal Labyrinth',
      description: 'Solve 3D puzzles inside a glowing crystal maze built with Three.js.',
      tags: ['puzzle', 'adventure', '3D'],
      thumbnail: 'assets/games/crystal.jpg',
      liked: false
    }
  ];

  getAllGames(): Game[] {
    return this.games;
  }

  getAllTags(): string[] {
    const allTags = this.games.flatMap(g => g.tags);
    return Array.from(new Set(allTags));
  }

  toggleLike(id: number): void {
    const game = this.games.find(g => g.id === id);
    if (game) game.liked = !game.liked;
  }
}
