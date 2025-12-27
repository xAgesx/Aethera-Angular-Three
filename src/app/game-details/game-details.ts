import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, GameService } from '../services/game-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Review, ReviewsService } from '../services/reviews-service';
import { FirebaseService } from '../services/firebase-service';
import { MainService } from '../services/main-service';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.css'],
})
export class GameDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  public reviewsService = inject(ReviewsService);
  public firebaseService = inject(FirebaseService);

  public game?: Game;
  public reviews$?: Observable<Review[]>;
  public newReviewContent: string = '';
  public rating: number = 5;
  public currentSlide = 0;

  // Editing State
  public editingReviewId: string | null = null;
  public editContent: string = '';
  constructor(public mainService: MainService) { }
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const foundGame = this.gameService.getGameById(id);

    if (!foundGame) {
      this.router.navigate(['/browse']);
      return;
    }

    this.game = foundGame;

    this.reviews$ = this.reviewsService.getReviewsByGameId(id);
    setTimeout(() => this.loadGameData(id), 100);
  }
  private loadGameData(id: number): void {
    const foundGame = this.gameService.getGameById(id);
    if (foundGame) {
      const userLikes = this.firebaseService.connectedUser?.likedGames || [];
      this.game = {
        ...foundGame,
        liked: userLikes.includes(id)
      };
    }
  }

  submitReview(): void {
    const user = this.firebaseService.connectedUser;

    if (!this.newReviewContent.trim() || !this.game || !user || user.email === 'null') {
      return;
    }

    const reviewData: Partial<Review> = {
      gameId: this.game.id,
      content: this.newReviewContent,
      rating: this.rating,
      username: user.username || 'Aethera Explorer',
      userEmail: user.email,
      photoURL: user.profilePic || null,
      upvotes: []
    };

    this.reviewsService.addReview(reviewData).then(() => {
      this.newReviewContent = '';
      this.rating = 5;
    });
    this.mainService.showNotification('success', 'Review posted successfully!');


  }

  // Edit Feature
  startEdit(review: Review): void {
    this.editingReviewId = review.id || null;
    this.editContent = review.content;
  }

  cancelEdit(): void {
    this.editingReviewId = null;
    this.editContent = '';
  }

  saveEdit(reviewId: string): void {
    if (!this.editContent.trim()) return;
    this.reviewsService.updateReview(reviewId, { content: this.editContent }).then(() => {
      this.editingReviewId = null;
    });
    this.mainService.showNotification('success', 'Review updated.');
  }

  // Upvote Feature
  toggleUpvote(review: Review): void {
    const userEmail = this.firebaseService.connectedUser?.email;
    if (!userEmail || userEmail === 'null') return;

    let upvotes = review.upvotes || [];
    if (upvotes.includes(userEmail)) {
      upvotes = upvotes.filter(email => email !== userEmail);
    } else {
      upvotes.push(userEmail);
    }

    this.reviewsService.updateReview(review.id!, { upvotes });
  }

  deleteReview(id: string): void {

    this.reviewsService.deleteReview(id);
    this.mainService.showNotification('success', 'Review deleted.');
  }

  changeSlide(offset: number): void {
    if (this.game?.images) {
      this.currentSlide = (this.currentSlide + offset + this.game.images.length) % this.game.images.length;
    }
  }

  goBack(): void {
    this.router.navigate(['/browse']);
  }

  toggleLike(): void {
    if (this.game) {
      this.gameService.toggleLike(this.game.id);
      this.game.liked = !this.game.liked;

    }
  }
  loadGame(){
    if(this.game?.id == 3){
      this.router.navigate(['/dashGame']);
    }
  }
}