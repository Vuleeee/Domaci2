import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = ''; // Postavite pravu adresu vašeg API-ja
    
  constructor(private http: HttpClient) {}

  apiCall(){
    //console.log(this.http.get('${apiUrl)/jela-po-rejtingu)'));
    const httpObservable = this.http.get('http://localhost:3000/jela-po-rejtingu');
    httpObservable.subscribe(
      (data) => {
        console.log('Received data:', data);
        // Process your data here
      },
      (error) => {
        console.error('Error:', error);
        // Handle errors here
      },
      () => {
        console.log('Request completed');
        // Handle completion if needed
      }
    );
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