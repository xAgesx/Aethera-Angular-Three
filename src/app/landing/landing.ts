import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';

declare const THREE: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private renderer: any;
  private scene: any;
  private camera: any;
  private spheres: any[] = [];
  private starField: any;
  private animationId!: number;
  
  public scrollPercent = 0;
  private targetScroll = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.targetScroll = st / sh;
  }

  ngAfterViewInit(): void {
    if (typeof THREE === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        this.initScene();
        this.animate();
      };
      document.head.appendChild(script);
    } else {
      this.initScene();
      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  public redirect(path: string) {
    this.router.navigate([path]);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.bgCanvas.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    this.starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ size: 0.05, color: 0x00ffa3, transparent: true, opacity: 0.4 }));
    this.scene.add(this.starField);

    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.IcosahedronGeometry(Math.random() * 1.5, 0);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ffa3, wireframe: true, transparent: true, opacity: 0.2 }));
      mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -Math.random() * 100);
      this.scene.add(mesh);
      this.spheres.push(mesh);
    }

    this.scene.add(new THREE.PointLight(0x00ffa3, 2, 50));
    this.scene.add(new THREE.AmbientLight(0x404040));
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.scrollPercent += (this.targetScroll - this.scrollPercent) * 0.05;
    this.camera.position.z = 5 - (this.scrollPercent * 50);
    this.starField.rotation.y += 0.0005;
    this.spheres.forEach(s => { s.rotation.x += 0.01; s.rotation.y += 0.01; });
    this.renderer.render(this.scene, this.camera);
  }
}