import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private spheres: THREE.Group[] = [];
  private starField!: THREE.Points;
  private animationId!: number;
  
  // Scroll tracking
  public scrollPercent = 0;
  private targetScroll = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.targetScroll = st / sh;
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
  }

  redirect(path: string) {
    const target = sessionStorage.getItem('email') ? '/browse' : '/auth';
    this.router.navigate([target]);
  }

  private initScene(): void {
    const canvas = this.bgCanvas.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x01110b, 0.05);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffa3, 2);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    // Create Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const posArray = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.015, color: 0xffffff, transparent: true });
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);

    // Create Floating "Crystals"
    for (let i = 0; i < 40; i++) {
      const group = new THREE.Group();
      const geometry = new THREE.IcosahedronGeometry(Math.random() * 0.3, 0);
      const material = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00ffa3 : 0x1de9b6,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      
      group.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 50 - 10
      );
      
      group.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.scene.add(group);
      this.spheres.push(group);
    }

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Smooth scroll interpolation
    this.scrollPercent += (this.targetScroll - this.scrollPercent) * 0.05;

    // Move camera through space based on scroll
    this.camera.position.z = 5 - (this.scrollPercent * 40);
    this.camera.position.x = Math.sin(this.scrollPercent * Math.PI) * 2;
    this.camera.rotation.z = this.scrollPercent * Math.PI * 0.2;

    // Rotate stars
    this.starField.rotation.y += 0.0005;

    // Animate elements
    const time = Date.now() * 0.001;
    this.spheres.forEach((group, i) => {
      group.rotation.y += 0.01;
      group.rotation.x += 0.005;
      
      // Reactive pulse based on scroll position
      const dist = Math.abs(group.position.z - this.camera.position.z);
      if (dist < 5) {
        group.scale.setScalar(1 + (5 - dist) * 0.2);
      } else {
        group.scale.setScalar(1);
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}