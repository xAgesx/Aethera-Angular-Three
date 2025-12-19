import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, User } from '../services/firebase-service';
import { MainService } from '../services/main-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <!-- Profile Top Bar -->
      <div class="top-stats-grid">
        <div class="stat-card profile-main">
          <div class="avatar">{{ user()?.username?.[0]?.toUpperCase() }}</div>
          <div class="profile-details">
            <h2>{{ user()?.username }}</h2>
            <p class="rank">Master Critic • Level 14</p>
          </div>
        </div>
        
        <div class="stat-card mini">
          <span class="label">Review Impact</span>
          <span class="value">{{ totalHelpfulVotes() }}</span>
          <span class="trend positive">↑ 12% this month</span>
        </div>

        <div class="stat-card mini">
          <span class="label">Library Value</span>
          <span class="value">{{ likedGames().length * 60 }}$</span>
          <span class="trend">Est. MSRP</span>
        </div>

        <div class="stat-card mini">
          <span class="label">Global Rank</span>
          <span class="value">#1,240</span>
          <span class="trend">Top 5%</span>
        </div>
      </div>

      <div class="main-dashboard-grid">
        
        <!-- Column 1: Visual Analytics -->
        <div class="col">
          <section class="card chart-section">
            <div class="card-header">
              <h3>Genre DNA Tracking</h3>
              <span class="info-icon">ℹ️</span>
            </div>
            <!-- Radar/Spider Chart Visualization (SVG) -->
            <div class="radar-container">
              <svg viewBox="0 0 200 200" class="radar-chart">
                <!-- Background Polygons -->
                <polygon points="100,20 180,80 150,170 50,170 20,80" class="radar-grid"/>
                <polygon points="100,50 150,85 130,140 70,140 50,85" class="radar-grid"/>
                <!-- Data Polygon -->
                <polygon points="100,30 170,85 140,160 80,150 40,90" class="radar-data"/>
                
                <!-- Labels -->
                <text x="100" y="15" text-anchor="middle">RPG</text>
                <text x="185" y="85">Action</text>
                <text x="155" y="185">Indie</text>
                <text x="45" y="185">Strategy</text>
                <text x="15" y="85" text-anchor="end">Horror</text>
              </svg>
            </div>
          </section>

          <section class="card rating-dist">
            <h3>Rating Distribution</h3>
            <div class="bar-chart">
              @for (item of ratingDist(); track item.stars) {
                <div class="bar-row">
                  <span class="star-label">{{ item.stars }} ★</span>
                  <div class="bar-bg">
                    <div class="bar-fill" [style.width.%]="item.percent"></div>
                  </div>
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              }
            </div>
          </section>
        </div>

        <!-- Column 2: Activity & Milestones -->
        <div class="col">
          <section class="card activity-heatmap">
            <div class="card-header">
              <h3>Contribution Intensity</h3>
              <div class="legend">
                Less <span class="box level-0"></span><span class="box level-1"></span><span class="box level-2"></span><span class="box level-3"></span> More
              </div>
            </div>
            <div class="heatmap-grid">
              @for (cell of heatmapCells; track $index) {
                <div class="heat-cell" [class]="'level-' + cell" [title]="'Activity Level: ' + cell"></div>
              }
            </div>
          </section>

          <section class="card milestone-tracker">
            <h3>Upcoming Milestones</h3>
            <div class="milestone-list">
              <div class="milestone">
                <div class="ms-info">
                  <span>Elite Reviewer</span>
                  <span>18/20 Reviews</span>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width: 90%"></div></div>
              </div>
              <div class="milestone">
                <div class="ms-info">
                  <span>Helpful Hand</span>
                  <span>45/50 Upvotes</span>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width: 75%"></div></div>
              </div>
            </div>
          </section>

          <section class="card recent-activity">
            <h3>Recent Actions</h3>
            <ul class="activity-feed">
              <li><span class="time">2h ago</span> Liked <strong>Project Zomboid</strong></li>
              <li><span class="time">1d ago</span> Reviewed <strong>Hades II</strong> (5/5)</li>
              <li><span class="time">3d ago</span> Reached <strong>Level 10</strong></li>
            </ul>
          </section>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #01110b; min-height: 100vh; font-family: 'Poppins', sans-serif; }
    .analytics-container { padding: 2rem; max-width: 1400px; margin: 0 auto; color: #e7fbee; }

    /* Top Grid */
    .top-stats-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: rgba(5, 30, 20, 0.7); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 16px; padding: 1.5rem; }
    .profile-main { display: flex; align-items: center; gap: 1.5rem; border-left: 4px solid #00e676; }
    .avatar { width: 60px; height: 60px; background: #00e676; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #01210f; font-weight: 800; }
    .profile-details h2 { margin: 0; font-size: 1.4rem; }
    .rank { color: #00e676; font-size: 0.85rem; font-weight: 600; margin-top: 4px; }

    .mini .label { display: block; font-size: 0.8rem; color: #b8ffce; opacity: 0.6; margin-bottom: 8px; }
    .mini .value { display: block; font-size: 1.8rem; font-weight: 700; color: #fff; }
    .trend { font-size: 0.75rem; color: #888; }
    .trend.positive { color: #00e676; }

    /* Main Grid */
    .main-dashboard-grid { display: grid; grid-template-columns: 450px 1fr; gap: 2rem; }
    .card { background: rgba(5, 30, 20, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
    .card h3 { font-size: 1.1rem; margin-bottom: 1.5rem; color: #b8ffce; font-weight: 500; }

    /* Radar Chart */
    .radar-container { display: flex; justify-content: center; padding: 1rem; }
    .radar-chart { width: 100%; max-width: 300px; overflow: visible; }
    .radar-grid { fill: rgba(0, 230, 118, 0.05); stroke: rgba(255,255,255,0.1); stroke-width: 1; }
    .radar-data { fill: rgba(0, 230, 118, 0.3); stroke: #00e676; stroke-width: 2; }
    text { fill: #888; font-size: 10px; }

    /* Rating Bars */
    .bar-chart { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 15px; }
    .star-label { width: 35px; font-size: 0.85rem; }
    .bar-bg { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: #00e676; border-radius: 4px; }
    .bar-count { width: 20px; font-size: 0.85rem; opacity: 0.6; }

    /* Heatmap */
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .legend { font-size: 0.7rem; display: flex; align-items: center; gap: 5px; opacity: 0.6; }
    .box { width: 10px; height: 10px; border-radius: 2px; }
    .level-0 { background: rgba(255,255,255,0.05); }
    .level-1 { background: #004d40; }
    .level-2 { background: #00c853; }
    .level-3 { background: #b2ff59; }

    .heatmap-grid { display: grid; grid-template-columns: repeat(20, 1fr); gap: 4px; }
    .heat-cell { aspect-ratio: 1/1; border-radius: 2px; transition: transform 0.2s; }
    .heat-cell:hover { transform: scale(1.3); z-index: 10; cursor: help; }

    /* Milestones */
    .milestone { margin-bottom: 1.2rem; }
    .ms-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; }
    .progress-container { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; }
    .progress-bar { height: 100%; background: linear-gradient(to right, #00e676, #1de9b6); border-radius: 3px; }

    /* Activity Feed */
    .activity-feed { list-style: none; padding: 0; }
    .activity-feed li { font-size: 0.9rem; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; gap: 12px; }
    .time { color: #888; min-width: 60px; font-size: 0.8rem; }

    @media (max-width: 1000px) {
      .main-dashboard-grid { grid-template-columns: 1fr; }
      .top-stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class Dashboard implements OnInit {
  user = signal<User | null>(null);
  likedGames = signal<any[]>([]);
  totalHelpfulVotes = signal(156);
  
  // Simulated data for the charts
  ratingDist = signal([
    { stars: 5, count: 12, percent: 60 },
    { stars: 4, count: 5, percent: 25 },
    { stars: 3, count: 2, percent: 10 },
    { stars: 2, count: 1, percent: 5 },
    { stars: 1, count: 0, percent: 0 }
  ]);

  // Heatmap generation (Simulated last 100 days)
  heatmapCells: number[] = Array.from({ length: 100 }, () => Math.floor(Math.random() * 4));

  constructor(private firebaseService: FirebaseService, public mainService: MainService) {}

  ngOnInit() {
    this.loadUserData();
    this.likedGames.set(new Array(24)); // Mocking 24 liked games
  }

  loadUserData() {
    const email = sessionStorage.getItem('email');
    if (email) {
      this.user.set({ 
        username: email.split('@')[0], 
        email: email, 
        role: 'Member' 
      });
    }
  }
}