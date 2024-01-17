import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = 'http://localhost:3000'; // Postavite pravu adresu vašeg API-ja
    
  constructor(private http: HttpClient) {}

  apiCall(){
    //return this.http.get('https://jsonplaceholder.typicode.com/todos/1');
  }
  /*getTopRatedDishes(): Observable<any> {
    console.log("cao");
    return this.http.get<any>(`${this.apiUrl}/api/vratiJela`);
  }

  getIngredientCategories(): Observable<string[]> {
    console.log("cao2");
    return this.http.get<string[]>(`${this.apiUrl}/api/ingredient-categories`);
  }*/
}