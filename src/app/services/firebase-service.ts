import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface User{
  email?:string,
  password ?: string

}
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  
  collectionName = 'AetheraUsers';

  constructor(private firestore : Firestore){

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

}
