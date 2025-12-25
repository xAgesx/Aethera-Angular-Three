import { Component, OnInit, signal, computed, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// External Chart.js definition
declare var Chart: any;

interface Game {
  id: number;
  title: string;
  tags: string[];
  dimension: '2D' | '3D';
  liked: boolean;
  rating: number;
  lastReviewed?: string;
  comment?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="insights-container">
      <header class="page-header">
        <div>
          <h1>User Insights</h1>
          <p>Analyzing your taste based on <strong>{{ likedGames().length }}</strong> favorites</p>
        </div>
        <div class="user-badge">
          <i class="fas fa-shield-halved"></i>
          <span>Verified Gamer Profile</span>
        </div>
      </header>

      <!-- Charts Section -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="card-info">
            <h3>Genre Affinity</h3>
            <p>Your most played categories</p>
          </div>
          <div class="canvas-wrapper">
            <canvas #genreChart></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="card-info">
            <h3>Format Breakdown</h3>
            <p>2D vs 3D Preference</p>
          </div>
          <div class="canvas-wrapper flex-center">
            <canvas #dimensionChart></canvas>
          </div>
        </div>
      </div>

      <div class="content-split">
        <!-- Liked Games Table -->
        <section class="table-section">
          <div class="section-title">
            <h2>Your Liked Library</h2>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Game Name</th>
                  <th>Core Tags</th>
                  <th>Visuals</th>
                  <th>Your Rating</th>
                </tr>
              </thead>
              <tbody>
                @for (game of likedGames(); track game.id) {
                  <tr>
                    <td class="game-cell">
                      <strong>{{ game.title }}</strong>
                    </td>
                    <td>
                      <div class="tags-list">
                        @for (tag of game.tags; track tag) {
                          <span class="mini-tag">{{ tag }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      <span class="dim-badge" [class.is-3d]="game.dimension === '3D'">
                        {{ game.dimension }}
                      </span>
                    </td>
                    <td>
                      <div class="star-rating">
                        <i class="fas fa-star"></i> {{ game.rating }}
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <!-- Last Reviews -->
        <aside class="reviews-section">
          <h2>Recent Activity</h2>
          <div class="reviews-list">
            @for (rev of reviews(); track rev.id) {
              <div class="review-bubble">
                <div class="rev-header">
                  <strong>{{ rev.title }}</strong>
                  <span>{{ rev.lastReviewed }}</span>
                </div>
                <p>"{{ rev.comment }}"</p>
                <div class="rev-stars">
                  @for (s of [1,2,3,4,5]; track s) {
                    <i class="fas fa-star" [style.color]="s <= rev.rating ? '#00e676' : '#222'"></i>
                  }
                </div>
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      --primary: #00e676; 
      --bg: #030d0a; 
      --card: #0a1612;
      --border: rgba(0, 230, 118, 0.15);
      display: block;
    }
    .insights-container { 
      padding: 2.5rem; 
      background: var(--bg); 
      color: #e8ffe5; 
      min-height: 100vh; 
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
    }
    
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .page-header h1 { margin: 0; font-size: 2.2rem; font-weight: 800; color: #fff; letter-spacing: -1px; }
    .page-header p { margin: 5px 0 0; opacity: 0.6; font-size: 1.1rem; }
    .page-header strong { color: var(--primary); }

    .user-badge { 
      background: rgba(0, 230, 118, 0.05); 
      padding: 10px 20px; 
      border-radius: 12px; 
      border: 1px solid var(--border); 
      display: flex; 
      gap: 10px; 
      align-items: center; 
      color: var(--primary); 
      font-weight: 600;
    }

    /* Charts */
    .charts-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
    .chart-card { 
      background: var(--card); 
      padding: 2rem; 
      border-radius: 20px; 
      border: 1px solid var(--border); 
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .card-info h3 { margin: 0; font-size: 1.2rem; color: #fff; }
    .card-info p { margin: 4px 0 20px; font-size: 0.85rem; opacity: 0.5; }
    .canvas-wrapper { height: 300px; position: relative; width: 100%; }
    .flex-center { display: flex; justify-content: center; align-items: center; }

    /* Table & Content Layout */
    .content-split { display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; }
    .table-section { background: var(--card); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; }
    .section-title { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); }
    .section-title h2 { margin: 0; font-size: 1.3rem; }
    
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 1.2rem 2rem; background: rgba(0,0,0,0.2); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); opacity: 0.8; }
    td { padding: 1.2rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.95rem; }
    
    .game-cell strong { color: #fff; font-size: 1rem; }
    .tags-list { display: flex; gap: 6px; flex-wrap: wrap; }
    .mini-tag { font-size: 0.7rem; background: rgba(255,255,255,0.05); color: #a8ffc2; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
    
    .dim-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; background: #1a1a1a; font-weight: bold; border: 1px solid #333; }
    .dim-badge.is-3d { border-color: #2196f3; color: #2196f3; background: rgba(33, 150, 243, 0.1); }
    .star-rating { color: var(--primary); font-weight: bold; display: flex; align-items: center; gap: 6px; }

    /* Activity Feed */
    .reviews-section h2 { font-size: 1.3rem; margin: 0 0 1.5rem 0; }
    .reviews-list { display: flex; flex-direction: column; gap: 1.2rem; }
    .review-bubble { 
      background: var(--card); 
      padding: 1.5rem; 
      border-radius: 16px; 
      border: 1px solid var(--border);
      position: relative;
    }
    .review-bubble::before {
      content: '';
      position: absolute;
      left: 0; top: 20px; bottom: 20px;
      width: 4px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
    }
    .rev-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .rev-header strong { color: #fff; font-size: 1rem; }
    .rev-header span { font-size: 0.7rem; opacity: 0.4; }
    .review-bubble p { margin: 0 0 12px 0; font-style: italic; font-size: 0.9rem; color: #b8ccb5; line-height: 1.5; }
    .rev-stars { display: flex; gap: 3px; font-size: 0.75rem; }

    @media (max-width: 1100px) {
      .charts-grid, .content-split { grid-template-columns: 1fr; }
      .chart-card { height: auto; }
    }
  `]
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('genreChart') genreCanvas!: ElementRef;
  @ViewChild('dimensionChart') dimCanvas!: ElementRef;

  private charts: any[] = [];

  allGames = signal<Game[]>([
    { id: 1, title: 'Cyber Nexus', tags: ['Sci-Fi', 'RPG', 'Action'], dimension: '3D', liked: true, rating: 4.8, lastReviewed: '2 days ago', comment: 'Breathtaking visuals and deep story mechanics.' },
    { id: 2, title: 'Forest Spirits', tags: ['Indie', 'Adventure', 'Puzzle'], dimension: '2D', liked: true, rating: 4.5, lastReviewed: '1 week ago', comment: 'So relaxing, the art style is unique and expressive.' },
    { id: 3, title: 'Neon Racer', tags: ['Racing', 'Arcade', 'Action'], dimension: '3D', liked: true, rating: 4.9, lastReviewed: '3 days ago', comment: 'Fastest gameplay I have seen this year. Pure adrenaline.' },
    { id: 4, title: 'Logic Gate', tags: ['Puzzle', 'Strategy', 'Indie'], dimension: '2D', liked: true, rating: 4.2, lastReviewed: 'Yesterday', comment: 'Really makes you think about every move. Hard but fair.' },
    { id: 5, title: 'Space Voyagers', tags: ['Sci-Fi', 'Strategy', 'RPG'], dimension: '3D', liked: true, rating: 4.6, lastReviewed: '5 days ago', comment: 'Management depth is incredible. Best in the genre.' },
    { id: 6, title: 'Retro Platformer', tags: ['Indie', 'Action'], dimension: '2D', liked: true, rating: 4.0, lastReviewed: '2 weeks ago', comment: 'Classic vibes, perfect controls.' },
  ]);

  likedGames = computed(() => this.allGames().filter(g => g.liked));
  reviews = computed(() => this.likedGames().filter(g => g.comment).slice(0, 3));

  ngOnInit() {
    this.loadChartJs();
  }

  ngAfterViewInit() {
    // We'll call initialization after the script is confirmed loaded
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  private loadChartJs() {
    if (typeof Chart !== 'undefined') {
      this.initCharts();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => this.initCharts();
    document.head.appendChild(script);
  }

  private initCharts() {
    if (!this.genreCanvas || !this.dimCanvas) return;

    const games = this.likedGames();
    
    // 1. Process Tags
    const tagCounts: {[key: string]: number} = {};
    games.forEach(g => {
      g.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
    });
    const labels = Object.keys(tagCounts);
    const data = Object.values(tagCounts);

    // 2. Process Dimensions
    const dimCounts = { '2D': 0, '3D': 0 };
    games.forEach(g => dimCounts[g.dimension]++);

    // Setup Theme Colors
    const primaryColor = '#00e676';
    const accentColor = '#2196f3';

    // Create Radar Chart for Genres
    const c1 = new Chart(this.genreCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tag Frequency',
          data: data,
          backgroundColor: 'rgba(0, 230, 118, 0.2)',
          borderColor: primaryColor,
          borderWidth: 2,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: primaryColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.1)' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            pointLabels: { color: '#aaa', font: { size: 12 } },
            ticks: { display: false },
            suggestedMin: 0
          }
        },
        plugins: { legend: { display: false } }
      }
    });

    // Create Doughnut Chart for Dimensions
    const c2 = new Chart(this.dimCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['2D', '3D'],
        datasets: [{
          data: [dimCounts['2D'], dimCounts['3D']],
          backgroundColor: ['rgba(255,255,255,0.1)', accentColor],
          borderColor: '#0a1612',
          borderWidth: 4,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { color: '#888', padding: 20, font: { size: 12, weight: '600' } } 
          }
        },
        cutout: '75%'
      }
    });

    this.charts.push(c1, c2);
  }
}