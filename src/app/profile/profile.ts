import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MainService } from '../services/main-service';
import { FirebaseService, User } from '../services/firebase-service';

@Component({
    selector: 'app-root',
    templateUrl: './profile.html',
    styleUrl: './profile.css',
    imports: [CommonModule, FormsModule]
})
export class Profile implements OnInit {

    activeTab = signal<'info' | 'security' | 'avatar'>('info');
    isEditMode = signal(false);
    isModalOpen = signal(false);

    profile: User | null = null;
    private originalProfile: User | null = null;
    

    constructor(
        public mainService: MainService,
        private firebaseService: FirebaseService,

    ) { }

    ngOnInit(): void {
        const sessionEmail = sessionStorage.getItem('email');
        if (!sessionEmail) {
            this.mainService.redirect('/landing');
            return;
        }
        if (this.profile?.profilePic) {
            this.firebaseService.tempAvatarPreview.set(this.profile.profilePic);
        }

        if (this.firebaseService.connectedUser && this.firebaseService.connectedUser.email === sessionEmail) {
            this.setProfileData(this.firebaseService.connectedUser);
        } else {
            this.firebaseService.getUserByEmail(sessionEmail).subscribe(data => {
                if (data && data.length > 0) {
                    this.setProfileData(data[0]);
                }
            });
        }
    }

    private setProfileData(user: User): void {
        this.profile = { ...user };
        this.originalProfile = { ...user };
        this.firebaseService.tempAvatarPreview.set(user.profilePic!);

    }

    showTab(tab: 'info' | 'security' | 'avatar'): void {
        this.activeTab.set(tab);
        this.isEditMode.set(false);
        this.mainService.notification.set({ message: '', type: null });
    }

    toggleEditMode(): void {
        const currentlyEditing = this.isEditMode();
        if (currentlyEditing) {
            this.profile = { ...this.originalProfile! };
        } else {
            this.originalProfile = { ...this.profile! };
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
        this.firebaseService.deleteUser(this.profile?.id!)
            .then(() => {
                sessionStorage.clear();
                this.mainService.redirect('/landing');
            })
            .catch(() => {
                this.mainService.showNotification('error', 'Critical error during account deletion');
                this.closeModal();
            });
    }

    handleSaveProfile(form: NgForm): void {
        if (form.invalid || !this.profile) return;

        const updatedUser: User = {
            ...this.profile,
            username: form.value.displayName,
            bio: form.value.bio
        };

        this.firebaseService.editUser(updatedUser)
            .then(() => {
                this.profile = { ...updatedUser };
                this.originalProfile = { ...updatedUser };
                this.mainService.showNotification('success', 'Profile updated successfully!');
                this.isEditMode.set(false);

            })
            .catch(() => {
                this.mainService.showNotification('error', 'Failed to save changes due to a server error.');
            });
    }

    handlePasswordChange(form: NgForm): void {
        const { currentPassword, newPassword, confirmPassword } = form.value;
        if (form.invalid) {
            this.mainService.showNotification('error', 'Please fill in all required fields');
            return;
        }

        if (this.profile && this.verifPassword(currentPassword, newPassword, confirmPassword)) {
            const updatedUser = { ...this.profile, password: newPassword };

            this.firebaseService.editUser(updatedUser)
                .then(() => {
                    this.profile = { ...updatedUser };
                    this.originalProfile = { ...updatedUser };
                    this.mainService.showNotification('success', 'Password updated successfully');
                    form.resetForm();

                })
                .catch(err => {
                    this.mainService.showNotification('error', 'Server error: Failed to update password');
                });
        }
    }



    verifPassword(currentInput: string, newPass: string, confirmPass: string): boolean {
        if (this.profile?.password !== currentInput) {
            this.mainService.showNotification('error', 'Wrong Current Password');
            return false;
        }
        if (newPass.length < 6 || !/[A-Z]/.test(newPass)) {
            this.mainService.showNotification('error', 'Password must be at least 6 characters with 1 uppercase letter');
            return false;
        }
        if (newPass !== confirmPass) {
            this.mainService.showNotification('error', 'New passwords do not match');
            return false;
        }
        return true;
    }
    handleAvatarUpload(): void {
        if (!this.profile || !this.firebaseService.tempAvatarPreview()) {
            this.mainService.showNotification('error', 'No image selected to upload.');
            return;
        }

        const updatedUser: User = {
            ...this.profile,
            profilePic: this.firebaseService.tempAvatarPreview() as string
        };

        this.firebaseService.editUser(updatedUser)
            .then(() => {
                this.profile = updatedUser;
                this.firebaseService.connectedUser = updatedUser;
                this.mainService.showNotification('success', 'Profile picture updated successfully!');
            })
            .catch(err => {
                console.error(err);
                this.mainService.showNotification('error', 'Failed to upload image to server.');
            });
    }
    removeAvatar(): void {
        if (!this.profile) return;

        const updatedUser: User = { ...this.profile, profilePic: '' };
        this.firebaseService.editUser(updatedUser).then(() => {
            this.profile = updatedUser;
            this.firebaseService.connectedUser = updatedUser;
            this.firebaseService.tempAvatarPreview.set(null);
            this.mainService.showNotification('success', 'Avatar removed.');
        });
    }
    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        console.log('Processing Picture');
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this.mainService.showNotification('error', 'File is too large! Max 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            this.firebaseService.tempAvatarPreview.set(base64String);
        };
        reader.readAsDataURL(file);
    }
    tempAvatarView(){
        return this.firebaseService.tempAvatarPreview();
    }
}


