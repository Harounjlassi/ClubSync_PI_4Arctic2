declare var google:any;
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit{
  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: "376533833455-qgcjilh1un1k0cfunakdab8b328a0p9f.apps.googleusercontent.com",
      callback: (resp: any) => {

      }

    });
    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large" }  // customization attributes
    );
  }

}
