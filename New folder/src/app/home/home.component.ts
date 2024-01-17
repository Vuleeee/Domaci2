import { Component } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DishService } from '../dish.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface Dish {
  name: string;
  rating: number;
  // Ostali podaci o jelu
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
 /* ngOnInit() {
    console.log("cao3");
    this.dishService.getTopRatedDishes().subscribe((dishes) => {
      this.topRatedDishes = dishes;
      console.log(this.topRatedDishes);
    });
    this.getTopRatedDishes();
  }*/
  apiCall(){
    //return this.http.get('http://localhost:3000/jela-po-rejtingu');
  }
  constructor(private router: Router, private api: DishService) { }
  addDish(){
    this.router.navigate(['/dodaj']);
  }

  ngOnInit()
  {
    this.api.apiCall();
    console.log(this.api.apiCall());
    
  }
  ingredientCategories: string[] = ['Voće', 'Povrće', 'Meso', 'Riba', 'Testenine', 'Sirevi', 'Začini'];



  existingIngredients: string[] = ['Jaja', 'Mleko', 'Brašno', 'Šećer', 'So', 'Biber'];

  // Unos korisnika
  userInput: string = '';

  // Filtrirani sastojci na osnovu unosa korisnika
  filteredIngredients: string[] = [];

  dishes: Dish[] = [
    { name: 'Jelo 1', rating: 4.5 },
    { name: 'Jelo 2', rating: 5.0 },
    { name: 'Jelo 3', rating: 4.8 },
    // Dodajte više jela sa ocenama
  ];

  // Top rejtovana jela
  topRatedDishes: Dish[] = [];

  // Funkcija za filtriranje sastojaka
  filterIngredients() {
    this.filteredIngredients = this.existingIngredients.filter((ingredient) =>
      ingredient.toLowerCase().includes(this.userInput.toLowerCase())
    );
  }

  getTopRatedDishes() {
    // Sortirajte jela po ocenama
    console.log("top jela");
    this.topRatedDishes = this.dishes.sort((a, b) => b.rating - a.rating).slice(0, 3);
  }
}
