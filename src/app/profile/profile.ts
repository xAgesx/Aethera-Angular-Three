import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MainService } from '../services/main-service';
import { FirebaseService, User } from '../services/firebase-service';

@Component({
  selector: 'app-root',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
    
    activeTab = signal<'info' | 'security' | 'avatar'>('info');
    isEditMode = signal(false);
    isModalOpen = signal(false);
    notification = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
    profile ?: User;
    
    constructor(private mainService : MainService,private firebaseService : FirebaseService){}

    private originalProfile = { ...this.profile };

    ngOnInit(): void {
      
      //Redirect if not logged in 
      if(!sessionStorage.getItem('email')){
        this.mainService.redirect('/landing');
        return;
      }

      //get data from firebase Service
      this.profile = this.firebaseService.connectedUser;
      console.log('Profile : ',this.profile);
      console.log('ConnectedUser service : ',this.firebaseService.connectedUser);
      
    }

    showTab(tab: 'info' | 'security' | 'avatar'): void {
        this.activeTab.set(tab);
        this.isEditMode.set(false); 
        this.notification.set({ message: '', type: null });
    }

    toggleEditMode(): void {
        const currentlyEditing = this.isEditMode();
        if (currentlyEditing) {
            this.profile = { ...this.originalProfile };
        } else {
            this.originalProfile = { ...this.profile };
        }
        this.isEditMode.set(!currentlyEditing);
    }

    openModal(): void {
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    handleDelete(): void {
        this.showNotification('error', 'Deletion error');
        this.closeModal();
    }

    handleSaveProfile(form: NgForm): void {
        if (form.invalid) return;

        console.log("Angular: Saving profile changes...", this.profile);
        const success = Math.random() > 0.3; 
        
        if (success) {
            this.originalProfile = { ...this.profile }; // Commit changes
            this.showNotification('success', 'Profile updated successfully!');
        } else {
            this.profile = { ...this.originalProfile }; 
            this.showNotification('error', 'Failed to save changes due to a server error.');
        }

        this.isEditMode.set(false);
    }

    handlePasswordChange(form: NgForm): void {
        if (form.invalid || form.value.newPassword !== form.value.confirmPassword) {
            this.showNotification('error', 'Passwords do not match or fields are empty.');
            return;
        }

        console.log("Angular: Changing password...");
        this.showNotification('success', 'Password updated successfully! (Simulation)');
        form.resetForm();
    }

    showNotification(type: 'success' | 'error', message: string): void {
        this.notification.set({ message, type });
        setTimeout(() => {
            this.notification.set({ message: '', type: null });
        }, 5000);
    }
}