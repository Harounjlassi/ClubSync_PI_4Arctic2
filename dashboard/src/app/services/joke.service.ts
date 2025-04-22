import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JokeService {
  private apiUrl = 'http://localhost:8080/clubsync/joke';

  constructor(private http: HttpClient) { }

  getJoke(language: string = 'fr'): Observable<string> {
    // Ajouter le paramètre de langue à la requête
    const params = new HttpParams().set('lang', language);
    return this.http.get(this.apiUrl, { params: params, responseType: 'text' });
  }

  // Social sharing methods
  shareOnFacebook(joke: string): void {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(joke)}`;
    this.openShareWindow(url);
  }
  
  shareOnTwitter(joke: string): void {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(joke)}&url=${encodeURIComponent(window.location.href)}`;
    this.openShareWindow(url);
  }
  
  shareOnLinkedIn(joke: string): void {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(joke)}`;
    this.openShareWindow(url);
  }
  
  shareOnWhatsApp(joke: string): void {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(joke + ' - ' + window.location.href)}`;
    this.openShareWindow(url);
  }
  
  shareByEmail(joke: string): void {
    const subject = "Joke of the day - ClubSync";
    const body = `See this joke: ${joke}\n\nPartagée depuis: ${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  
  copyToClipboard(joke: string): Promise<boolean> {
    return navigator.clipboard.writeText(joke)
      .then(() => true)
      .catch(err => {
        console.error('Impossible de copier le texte: ', err);
        return false;
      });
  }
  
  private openShareWindow(url: string): void {
    window.open(
      url,
      'share-dialog',
      'width=800,height=600,toolbar=0,status=0,location=0,menubar=0'
    );
  }
}