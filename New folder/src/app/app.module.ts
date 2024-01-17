import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import {HomeComponent} from './home/home.component'
import { StoreModule } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import {StoreDevtoolsModule} from "@ngrx/store-devtools"
//import { RegisterComponent } from './components/register/register.component';
//import { HomePageComponent } from './components/home-page/home-page.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CommonModule } from '@angular/common';
import { DishService } from './dish.service';


@NgModule({
  declarations: [
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 7, 
      autoPause: true
    }),
    AppComponent,
    HomeComponent,
    routingComponents,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    //MatNativeDateModule
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule { }