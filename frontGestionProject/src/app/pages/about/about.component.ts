import { Component, HostListener, Input, OnInit, Pipe } from '@angular/core';
import { Projet } from 'app/common/projet';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}