import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

interface ItineraryActivity {
  time: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}

@Component({
  selector: 'app-itinerary-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container fade-in">
      <h1>Itinerary Generator</h1>
      <div>
        <label for="destination">Destination:</label>
        <input id="destination" [(ngModel)]="destination" placeholder="e.g., Paris, France" />
      </div>
      <div>
        <label for="duration">Duration (days):</label>
        <input id="duration" type="number" [(ngModel)]="duration" min="1" max="14" />
      </div>
      <div>
        <label for="interests">Interests (comma-separated):</label>
        <input id="interests" [(ngModel)]="interests" placeholder="e.g., history, food, art" />
      </div>
      <button (click)="generateItinerary()" [disabled]="isGenerating">
        {{ isGenerating ? 'Generating...' : 'Generate Itinerary' }}
      </button>
      <div *ngIf="isGenerating" class="loading">Creating your perfect itinerary...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="parsedItinerary.length > 0" class="fade-in">
        <h2>Your {{ duration }}-Day Itinerary for {{ destination }}</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let day of parsedItinerary">
              <tr *ngFor="let activity of day.activities; let first = first">
                <td *ngIf="first" [attr.rowspan]="day.activities.length">{{ day.day }}</td>
                <td>{{ activity.time }}</td>
                <td>{{ activity.description }}</td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class ItineraryGeneratorComponent {
  destination = '';
  duration = 3;
  interests = '';
  itinerary = '';
  parsedItinerary: ItineraryDay[] = [];
  isGenerating = false;
  error = '';

  constructor(private geminiService: GeminiService) {}

  generateItinerary() {
    if (!this.destination || this.duration <= 0 || !this.interests) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.isGenerating = true;
    this.error = '';
    this.itinerary = '';
    this.parsedItinerary = [];

    const prompt = `Generate a ${this.duration}-day itinerary for ${this.destination} focusing on the following interests: ${this.interests}. Please provide a day-by-day breakdown of activities and attractions. Format the response as follows:

Day 1:
09:00 AM - Activity 1
11:00 AM - Activity 2
02:00 PM - Activity 3

Day 2:
10:00 AM - Activity 1
01:00 PM - Activity 2
04:00 PM - Activity 3

... and so on for each day. Please ensure each activity has a time associated with it.`;
    
    this.geminiService.generateContent(prompt).subscribe({
      next: (response) => {
        this.itinerary = response;
        this.parseItinerary();
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error generating itinerary:', error);
        this.error = 'Sorry, there was an error generating your itinerary. Please try again later.';
        this.isGenerating = false;
      }
    });
  }

  parseItinerary() {
    const days = this.itinerary.split(/Day \d+:/);
    this.parsedItinerary = days.slice(1).map((day, index) => {
      const activities = day.trim().split('\n')
        .filter(activity => activity.trim() !== '')
        .map(activity => {
          const [time, ...descriptionParts] = activity.split('-');
          return {
            time: time.trim(),
            description: descriptionParts.join('-').trim()
          };
        });
      return { day: index + 1, activities };
    });
  }
}