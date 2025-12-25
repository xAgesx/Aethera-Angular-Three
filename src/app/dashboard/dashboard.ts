import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Game } from '../services/game-service';
import { FirebaseService } from '../services/firebase-service';
import Chart from 'chart.js/auto';
import { ReviewsService } from '../services/reviews-service';
import { Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private gameService = inject(GameService);
  public firebaseService = inject(FirebaseService);
  private reviewsService = inject(ReviewsService);
  private router = inject(Router);

  public games: Game[] = [];
  public likedGames: Game[] = [];
  public likedGamesCount: number = 0;
   public userReviews: any[] = [];
  public filteredReviews: any[] = [];
  public isExpanded: boolean = false;
  public currentSort: string = 'newest';
  public reviewLimit: number = 3;

  @ViewChild('genreChart') genreCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dimChart') dimCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstances: Chart[] = [];

  ngOnInit() {
    this.refreshData();
    setTimeout(()=>{this.loadUserReviews()},1000);
  }

  ngAfterViewInit() {
    // Initial delay to allow the parent animations/loading to settle
    setTimeout(() => {
      this.refreshData();
      this.initCharts();
    }, 1000);
  }

 refreshData() {
    this.games = this.gameService.getAllGames();
    this.likedGames = this.games.filter(g => g.liked);
    this.likedGamesCount = this.likedGames.length;
  }

  loadUserReviews() {
    const userEmail = this.firebaseService.connectedUser?.email;
    if (userEmail) {
      this.reviewsService.getReviewsByUserEmail(userEmail).subscribe(reviews => {
        this.userReviews = reviews.map(rev => ({
          ...rev,
          game: this.gameService.getGameById(rev.gameId),
          upvoteCount: rev.upvotes?.length || 0
        }));
        this.applySort();
      });
    }
  }

  // Filter/Sort logic using simple variables
  setSort(value:string) {
    console.log(value);
    this.currentSort = value;
    this.applySort();
  }

  applySort() {
    const sorted = [...this.userReviews];
    if (this.currentSort === 'upvotes') {
      sorted.sort((a, b) => b.upvoteCount - a.upvoteCount);
    } else if (this.currentSort === 'game') {
      sorted.sort((a, b) => (a.game?.title || '').localeCompare(b.game?.title || ''));
    } else {
      sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
    this.filteredReviews = sorted;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.reviewLimit = this.isExpanded ? 1000 : 3;
  }
  navigateToGame(gameId: number) {
    this.router.navigate(['/details', gameId]);
  }

  goToBrowse() {
    this.router.navigate(['/browse']);
  }
  initCharts() {
    this.chartInstances.forEach(c => c.destroy());
    this.chartInstances = [];

    if (this.likedGames.length === 0) return;

    const genreCounts: { [key: string]: number } = {};
    const dimCounts = { '2D': 0, '3D': 0 };

    this.likedGames.forEach(game => {
      const is3D = game.tags.some(t => t.toLowerCase().includes('3d'));
      if (is3D) dimCounts['3D']++;
      else dimCounts['2D']++;

      game.tags.forEach(tag => {
        const cleanTag = tag.toLowerCase();
        if (!cleanTag.includes('2d') && !cleanTag.includes('3d')) {
          genreCounts[tag] = (genreCounts[tag] || 0) + 1;
        }
      });
    });

    const primaryColor = '#00ffa3';

    const ctx1 = this.genreCanvas.nativeElement.getContext('2d');
    if (ctx1) {
      this.chartInstances.push(new Chart(ctx1, {
        type: 'polarArea',
        data: {
          labels: Object.keys(genreCounts),
          datasets: [{
            data: Object.values(genreCounts),
            backgroundColor: [
              'rgba(0, 255, 163, 0.5)',
              'rgba(99, 102, 241, 0.5)',
              'rgba(236, 72, 153, 0.5)',
              'rgba(245, 158, 11, 0.5)',
              'rgba(59, 130, 246, 0.5)'
            ],
            borderColor: '#0a1612',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { display: false }
            }
          },
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#aaa', font: { size: 11 } }
            }
          }
        }
      }));
    }

    // Doughnut Chart lel 2d w 3d 
    const ctx2 = this.dimCanvas.nativeElement.getContext('2d');
    if (ctx2) {
      this.chartInstances.push(new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['2D', '3D'],
          datasets: [{
            data: [dimCounts['2D'], dimCounts['3D']],
            backgroundColor: ['rgba(255,255,255,0.1)', primaryColor],
            borderColor: '#0a1612',
            borderWidth: 5,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#aaa', padding: 20 }
            }
          }
        }
      }));
    }
  }

  ngOnDestroy() {
    this.chartInstances.forEach(c => c.destroy());
  }
}