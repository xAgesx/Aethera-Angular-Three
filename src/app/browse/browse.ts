import { Component, OnInit } from '@angular/core';
import { Game, GameService } from '../services/game-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-browse',
  imports:[CommonModule,FormsModule],
  templateUrl: './browse.html',
  styleUrls: ['./browse.css']
})
export class Browse implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  tags: string[] = [];
  selectedTag = 'all';
  searchTerm = '';

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.games = this.gameService.getAllGames();
    this.filteredGames = [...this.games];
    this.tags = this.gameService.getAllTags();
  }

  onSearchChange(value: string) {
    this.searchTerm = value.toLowerCase().trim();
    this.applyFilters();
  }

  onTagChange(value: string) {
    this.selectedTag = value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredGames = this.games.filter(game => {
      const matchesTag =
        this.selectedTag === 'all' || game.tags.includes(this.selectedTag);

      const matchesSearch =
        game.title.toLowerCase().includes(this.searchTerm) ||
        game.description.toLowerCase().includes(this.searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(this.searchTerm));

      return matchesTag && matchesSearch;
    });
  }

  toggleLike(game: Game) {
    this.gameService.toggleLike(game.id);
    game.liked = !game.liked;
  }
}
