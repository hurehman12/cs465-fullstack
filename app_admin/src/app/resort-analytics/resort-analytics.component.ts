import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  TripDataService
} from '../services/trip-data.service';

import {
  ResortReport
} from '../models/resort-report';

@Component({
  selector: 'app-resort-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resort-analytics.component.html'
})
export class ResortAnalyticsComponent implements OnInit {

  reports: ResortReport[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private tripDataService: TripDataService,
    private cdr: ChangeDetectorRef
  ) {}

  get totalTrips(): number {
    return this.reports.reduce(
      (total, report) => total + report.tripCount,
      0
    );
  }

  ngOnInit(): void {
    this.tripDataService.getResortReport().subscribe({
      next: (results) => {
        this.reports = results;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage =
            'You are not authorized to view this report.';
        } else {
          this.errorMessage =
            'Unable to retrieve resort analytics.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}