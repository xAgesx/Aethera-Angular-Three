import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Review {
  id?: string;
  gameId: number;
  userEmail: string;
  username: string;
  photoURL: string | null;
  content: string;
  rating: number;
  upvotes: string[];
  createdAt: any; 
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private firestore = inject(Firestore);
  private collectionPath = 'AetheraReviews';


  getReviewsByGameId(gameId: number): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, this.collectionPath);
    const q = query(reviewsRef, where('gameId', '==', gameId));

    return collectionData(q, { idField: 'id' }).pipe(
      map(actions => {
        const reviews = actions as Review[];
        return reviews
          .map(r => ({
            ...r,

            createdAt: r.createdAt instanceof Timestamp 
              ? r.createdAt.toDate() 
              : r.createdAt
          }))
          .sort((a, b) => {
            // Sort by Date object
            const timeA = a.createdAt?.getTime() || 0;
            const timeB = b.createdAt?.getTime() || 0;
            return timeB - timeA;
          });
      })
    );
  }

  async addReview(review: Partial<Review>): Promise<void> {
    const reviewsRef = collection(this.firestore, this.collectionPath);
    const data = {
      ...review,
      upvotes: [],
      createdAt: serverTimestamp() 
    };
    await addDoc(reviewsRef, data);
  }

  async updateReview(reviewId: string, data: Partial<Review>): Promise<void> {
    const reviewDoc = doc(this.firestore, this.collectionPath, reviewId);
    await updateDoc(reviewDoc, data as any);
  }

  async deleteReview(reviewId: string): Promise<void> {
    const reviewDoc = doc(this.firestore, this.collectionPath, reviewId);
    await deleteDoc(reviewDoc);
  }
}