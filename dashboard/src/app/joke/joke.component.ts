import { Component, OnInit } from '@angular/core';
import { JokeService } from '../services/joke.service';
@Component({
  selector: 'app-joke',
  templateUrl: './joke.component.html',
  styleUrls: ['./joke.component.css']
})
export class JokeComponent implements OnInit {
  joke: string = '';

  constructor(private jokeService: JokeService) {}

  ngOnInit(): void {
    this.fetchJoke();
  }

  fetchJoke() {
    this.jokeService.getJoke().subscribe({
      next: (data) => this.joke = data,
      error: (err) => console.error('Erreur :', err)
    });
  }
}
