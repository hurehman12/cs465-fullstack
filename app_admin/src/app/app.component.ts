import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TripListingComponent } from './trip-listing/trip-listing.component';

@Component({
  imports: [RouterOutlet, TripListingComponent],
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class App {
  protected readonly title = signal('Travlr Getaways Admin!');
}