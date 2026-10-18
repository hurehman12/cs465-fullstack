import {
  Component,
  signal
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  NavbarComponent
} from './navbar/navbar.component';

@Component({
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html'
})
export class App {

  protected readonly title =
    signal('Travlr Getaways Admin!');
}
