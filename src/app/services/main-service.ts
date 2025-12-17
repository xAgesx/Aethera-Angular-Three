import { Injectable, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  
   public notification = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  constructor(private router : Router){}
  redirect(path : string){
    this.router.navigate([path]);
  }
  showNotification(type: 'success' | 'error', message: string): void {
        this.notification.set({ message, type });
        setTimeout(() => {
            this.notification.set({ message: '', type: null });
            
        }, 5000);
        
    }
}
