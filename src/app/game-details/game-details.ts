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

    const id = Number(this.route.snapshot.paramMap.get('id'));
    const foundGame = this.gameService.getGameById(id);
    if (!foundGame) {
      this.router.navigate(['/browse']);
      return;
    }

    this.game = foundGame;
  }


  goBack(): void {
    this.router.navigate(['/browse']);
  }
  toggleLike(): void {
    if (!this.game) return;
    this.gameService.toggleLike(this.game.id);
    this.game.liked = !this.game.liked;
  }


  changeSlide(direction: number): void {
    if (!this.game?.images || this.game.images.length === 0) return;
    const length = this.game.images.length;
    this.currentSlide = (this.currentSlide + direction + length) % length;
  }

  launchGame(): void {
    if (!this.game) return;
    alert(`Launching ${this.game.title}...`);  }
}
