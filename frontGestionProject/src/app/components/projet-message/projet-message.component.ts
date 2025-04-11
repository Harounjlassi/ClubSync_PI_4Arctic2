import { Component, OnInit } from '@angular/core';
import { MessageService } from 'app/services/message.service';

@Component({
  selector: 'app-projet-message',
  templateUrl: './projet-message.component.html',
  styleUrls: ['./projet-message.component.scss']
})
export class ProjetMessageComponent implements OnInit {

  constructor(private messageService: MessageService,
  ) { }

  ngOnInit(): void {
  }

}
