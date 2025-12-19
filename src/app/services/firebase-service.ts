import { Injectable, signal } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface User{
  id?:string
  email?:string,
  password ?: string,
  username ?:string,
  role ?: string,
  bio ?: string,
  profilePic?:string
}
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  test?:string;
  collectionName = 'AetheraUsers';
connectedUser: User | null = null;
tempAvatarPreview = signal<string | null>(null);

  constructor(private firestore : Firestore){
    let sessionsEmail = sessionStorage.getItem('email');
    if(sessionsEmail){
      this.getUserByEmail(sessionsEmail).subscribe(data => {
        this.connectedUser = data[0];
        console.log('connectedUser',this.connectedUser);
        this.tempAvatarPreview.set(data[0].profilePic);
      this.test=data[0];
    });
    console.log('constructor');
    this.connectedUser = {username : 'null1',email: 'null',password:'null',bio:'null',role:'null'};
    }
    
  }

  addUser(user: User) {
    const col = collection(this.firestore, this.collectionName);
    return addDoc(col, user);
  }
  getUserByEmail(email: string) :Observable<any[]> {
    console.log("looking for : ",email);
    const usersRef = collection(this.firestore, this.collectionName);
    const q = query(usersRef, where('email', '==', email));
    
    // const querySnapshot = await getDocs(q);
    // console.log('query :',querySnapshot);

    // if (querySnapshot.empty) {
    //   return undefined;
    // }
    // return querySnapshot.docs[0].data() as User;
    return collectionData(q, { idField: 'id' });
  }
  editUser(user:User){
    if (user.id === undefined) {
      console.error("Cannot update user: Document ID is missing.");
      return Promise.reject("Cannot Update a Document with no ID");
    }else{
      const col = doc(this.firestore, this.collectionName,user.id );
      const { id, ...updateData } = user;
      console.log(updateData)
      return updateDoc(col, { ...updateData });

    }
    
  }
  deleteUser(userId: string) {
    const userDocRef = doc(this.firestore, `${this.collectionName}/${userId}`);
    return deleteDoc(userDocRef);
  }

}
