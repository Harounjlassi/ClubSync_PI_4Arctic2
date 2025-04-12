import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { chat } from '../models/chat.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  messages: chat[] = [];
  userInput = new FormControl('');
  isTyping = false;
  currentDate = new Date();
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    // Initialisation du chat avec un message de bienvenue
    this.addBotMessage('Bonjour ! Comment puis-je vous aider ?');

    // Setup typing detection
    this.userInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      // Could implement "user is typing" notifications here
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const message = this.userInput.value?.trim();
    if (!message) return;

    // Add user message
    this.addUserMessage(message);
    
    // Clear input and focus
    this.userInput.setValue('');
    this.messageInput.nativeElement.focus();
    
    // Show typing indicator
    this.isTyping = true;
    
    // Send request to service
    this.chatService.sendPrompt(message).subscribe({
      next: (response) => {
        // Hide typing indicator
        this.isTyping = false;
        this.addBotMessage(response);
      },
      error: (error) => {
        this.isTyping = false;
        this.addBotMessage('Désolé, je rencontre un problème technique...');
        console.error(error);
      }
    });
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      content,
      isBot: false,
      timestamp: new Date()
    });
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      content,
      isBot: true,
      timestamp: new Date()
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = 
        this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  // Format timestamp to show relative time
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 60000); // minutes
    
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) {
      const hours = Math.floor(diff / 60);
      return `Il y a ${hours} h`;
    }
    return new Date(date).toLocaleDateString();
  }

  // Clear chat history
  clearHistory(): void {
    this.messages = [];
    this.addBotMessage('Historique de conversation effacé. Comment puis-je vous aider ?');
  }

  // Handle file upload (placeholder)
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Afficher un message de chargement
      this.addUserMessage(`J'ai partagé un fichier: ${file.name}`);
      this.isTyping = true;
      
      // Envoyer le fichier au serveur
      this.chatService.uploadFile(file).subscribe({
        next: (response) => {
          this.isTyping = false;
          this.addBotMessage(response);
        },
        error: (error) => {
          this.isTyping = false;
          this.addBotMessage('Erreur lors du téléchargement du fichier. Veuillez réessayer.');
          console.error(error);
        }
      });
    }
  }
}