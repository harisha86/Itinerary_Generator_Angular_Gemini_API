import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retryWhen, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey = environment.geminiApiKey;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(private http: HttpClient) {}

  generateContent(prompt: string): Observable<string> {
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, body).pipe(
      map((response: any) => {
        if (response.candidates && response.candidates.length > 0) {
          return response.candidates[0].content.parts[0].text;
        } else {
          throw new Error('No valid response from Gemini API');
        }
      }),
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (index < 3 && error.status === 500) {
              return timer(2000); // Wait for 2 seconds before retrying
            }
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 500) {
        errorMessage += '\nThe server encountered an error. Please try again later.';
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}