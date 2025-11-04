import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, GameService } from '../services/game-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-game-details',
  imports:[FormsModule,CommonModule],
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.css']
})
export class GameDetails implements OnInit {
  public game?: Game;
  currentSlide = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    // Get the game ID from route params
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Fetch game data
    const foundGame = this.gameService.getGameById(id);
    if (!foundGame) {
      // Redirect if not found
      this.router.navigate(['/browse']);
      return;
    }

    this.game = foundGame;
  }

  /**
   * Navigate back to the browse page
   */
  goBack(): void {
    this.router.navigate(['/browse']);
  }

  /**
   * Toggle Like/Unlike for the current game
   */
  toggleLike(): void {
    if (!this.game) return;
    this.gameService.toggleLike(this.game.id);
    this.game.liked = !this.game.liked;
  }

  /**
   * Navigate through image carousel
   * @param direction +1 or -1
   */
  changeSlide(direction: number): void {
    if (!this.game?.images || this.game.images.length === 0) return;
    const length = this.game.images.length;
    this.currentSlide = (this.currentSlide + direction + length) % length;
  }

  /**
   * Launch game placeholder
   */
  launchGame(): void {
    if (!this.game) return;
    alert(`Launching ${this.game.title}...`);
    // Future enhancement: route to an embedded Three.js scene or external URL
  }
}
