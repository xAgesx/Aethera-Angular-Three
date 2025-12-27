import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-void-dash',
  standalone: true,
  templateUrl: './dash-game.html',
  styleUrls: ['./dash-game.css'],
  imports: [CommonModule]
})
export class VoidDash implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Core Three.js
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId!: number;

  // Game Objects
  private player!: THREE.Mesh;
  private obstacles: THREE.Mesh[] = [];
  private stars!: THREE.Points;
  private text !: THREE.Mesh;


  // State
  public score = 0;
  public scoreInKm = 0;
  public gameOver = false;
  private playerPos = 0;
  private targetPlayerPos = 0;
  private speed = 0.5;
  private isPause = false;


  @HostListener('window:keydown', ['$event'])
  handleInpu(event: KeyboardEvent) {
    console.log('A key was pressed', event.key);
    if (this.gameOver) return;
    if (event.key === 'ArrowLeft' || event.key === 'a') this.targetPlayerPos = -4;
    if (event.key === 'ArrowRight' || event.key === 'd') this.targetPlayerPos = 4;
    if (event.key === 'Escape') this.isPause = !this.isPause;
  }

  @HostListener('window:keyup')
  resetInput() {
    this.targetPlayerPos = 0;
  }

  ngAfterViewInit() {
    this.initGame();
  }

  private initGame() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x050505, 10, 50);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 3, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Player 
    const shipGeom = new THREE.ConeGeometry(0.5, 1.5, 3);
    const shipMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    this.player = new THREE.Mesh(shipGeom, shipMat);
    this.player.rotation.x = Math.PI / 2;
    this.scene.add(this.player);

    // Light
    const light = new THREE.PointLight(0x00ffa3, 2, 20);
    light.position.set(0, 2, 5);
    this.scene.add(light);

    // Background Stars
    const starGeom = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 1000; i++) {
      starCoords.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, -Math.random() * 100);
    }
    starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    this.stars = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 }));
    this.scene.add(this.stars);

    this.animate();
  }

  private spawnObstacle() {
    const geom = new THREE.BoxGeometry(2, 2, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffa3, wireframe: true });
    const cube = new THREE.Mesh(geom, mat);
    cube.position.set(Math.random() > 0.5 ? 4 : Math.random() > 0.5 ? 0 : -4, 0, -50);
    this.scene.add(cube);
    this.obstacles.push(cube);
  }

  private animate = () => {
    if (this.isPause) return;
    if (this.gameOver) return;
    this.animationId = requestAnimationFrame(this.animate);

    this.playerPos += (this.targetPlayerPos - this.playerPos) * 0.1;
    this.player.position.x = this.playerPos;
    this.player.rotation.z = -this.playerPos * 0.1;

    this.speed += 0.0001;
    this.score += 1;
    this.scoreInKm = Math.floor(this.score / 10);

    if (Math.random() < 0.01) this.spawnObstacle();

    // Update obstacles , the player doesn't move
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obj = this.obstacles[i];
      obj.position.z += this.speed;

      // Collision Detection
      const dist = this.player.position.distanceTo(obj.position);
      if (dist < 1.5) {
        this.gameOver = true;
      }

      // Cleanup
      if (obj.position.z > 15) {
        this.scene.remove(obj);
        this.obstacles.splice(i, 1);
      }
    }

    this.stars.rotation.z += 0.001;
    this.renderer.render(this.scene, this.camera);
  };

  public restart() {
    this.gameOver = false;
    this.score = 0;
    this.speed = 0.5;
    this.obstacles.forEach(o => this.scene.remove(o));
    this.obstacles = [];
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}