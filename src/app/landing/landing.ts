import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private spheres: THREE.Mesh[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private animationId!: number;

  constructor(private router : Router){}

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }
   redirect(path : string){

    if(sessionStorage.getItem('email')){
      path = '/browse';  
    }else{
      path = '/auth';
    }
    this.router.navigate([path]);
  }
  private initScene(): void {
    const canvas = this.bgCanvas.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 8;

    this.renderer = new THREE.WebGLRenderer({ canvas});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new THREE.Color('#01110b'), 1);

    const light = new THREE.PointLight(0x1de9b6, 1.5);
    light.position.set(0, 10, 10);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0x00e676, 0.2);
    this.scene.add(ambient);

    const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00e676,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2
    });

    for (let i = 0; i < 20; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
      sphere.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      (sphere.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.random() * 0.7 + 0.3;
      this.scene.add(sphere);
      this.spheres.push(sphere);
    }

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Move spheres in a smooth wave
    const time = Date.now() * 0.001;
    this.spheres.forEach((sphere, i) => {
      sphere.position.y += Math.sin(time + i) * 0.005;
      sphere.position.x += Math.cos(time + i * 0.3) * 0.002;
    });

    // slight camera movement based on mouse
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 1;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 1;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  };

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix(); 
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    window.removeEventListener('resize', this.onResize);
  }
}
