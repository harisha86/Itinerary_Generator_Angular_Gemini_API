import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ItineraryGeneratorComponent } from './app/itinerary-generator/itinerary-generator.component';
import { GeminiService } from './app/services/gemini.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItineraryGeneratorComponent],
  template: `
    <app-itinerary-generator></app-itinerary-generator>
  `,
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    GeminiService
  ]
});