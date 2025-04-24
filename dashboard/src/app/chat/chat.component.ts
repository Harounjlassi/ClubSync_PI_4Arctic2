import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
interface ChatMessage {
  content: string;
  isBot: boolean;
  timestamp: Date;
  attachment?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  messages: ChatMessage[] = [];
  userInput = new FormControl('');
  isTyping = false;
  currentDate = new Date();
  showEmojiPicker = false;
  emojis = ['😀', '😊', '😂', '😍', '👍', '❤️', '👌', '👏', '🎉', '🤔', '👋', '🙌', '🤝', '🤷‍♂️', '🤷‍♀️', '👀', '🧠', '⚡', '🔥', '✅', '⭐', '💼', '📅', '📌', '📊'];

  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    // Initialisation du chat avec un message de bienvenue
    this.addBotMessage('Bonjour et bienvenue sur ClubSync ! 👋 Comment puis-je vous aider aujourd\'hui ?');

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
    
    // Simuler un délai de traitement naturel
    setTimeout(() => {
      // Send request to service
      this.chatService.sendPrompt(message).subscribe({
        next: (response) => {
          // Hide typing indicator
          this.isTyping = false;
          this.addBotMessage(this.formatBotResponse(response));
        },
        error: (error) => {
          this.isTyping = false;
          this.addBotMessage('Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.');
          console.error(error);
        }
      });
    }, Math.random() * 1000 + 500); // Délai aléatoire entre 500ms et 1500ms
  }

  private formatBotResponse(text: string): string {
    // Remplacer les URLs par des liens cliquables
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" class="message-link">$1</a>');
  }

  private addUserMessage(content: string, attachment?: any): void {
    const message: ChatMessage = {
      content,
      isBot: false,
      timestamp: new Date()
    };
    
    if (attachment) {
      message.attachment = {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size
      };
    }
    
    this.messages.push(message);
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
    return new Date(date).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit' });
  }

  // Clear chat history
  clearHistory(): void {
    this.messages = [];
    this.addBotMessage('Historique de conversation effacé. Comment puis-je vous aider aujourd\'hui ?');
  }

  // Handle file upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Afficher un message avec le fichier partagé
      this.addUserMessage(`J'ai partagé un fichier`, {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      this.isTyping = true;
      
      // Simuler un délai de traitement
      setTimeout(() => {
        // Envoyer le fichier au serveur
        this.chatService.uploadFile(file).subscribe({
          next: (response) => {
            this.isTyping = false;
            this.addBotMessage(this.formatBotResponse(response));
          },
          error: (error) => {
            this.isTyping = false;
            this.addBotMessage('Désolé, je n\'ai pas pu traiter ce fichier. Veuillez vérifier le format et réessayer.');
            console.error(error);
          }
        });
      }, Math.random() * 1500 + 800); // Délai aléatoire entre 800ms et 2300ms
    }
  }
  // Ajouter ces méthodes à votre classe composant
toggleEmojiPicker(): void {
  this.showEmojiPicker = !this.showEmojiPicker;
}

addEmoji(emoji: string): void {
  // Insérer l'emoji à la position du curseur ou à la fin
  const input = this.messageInput.nativeElement;
  const currentValue = this.userInput.value || '';
  const cursorPos = input.selectionStart;
  
  // Insérer l'emoji à la position du curseur
  const newValue = currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
  this.userInput.setValue(newValue);
  
  // Repositionner le curseur après l'emoji
  setTimeout(() => {
    input.focus();
    input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
  }, 0);
  
  // Fermer le sélecteur d'emoji
  this.showEmojiPicker = false;
}

// Ajouter ce gestionnaire pour fermer le sélecteur d'emoji en cliquant ailleurs
@HostListener('document:click', ['$event'])
documentClick(event: MouseEvent): void {
  // Vérifier si le clic est en dehors du sélecteur d'emoji et du bouton emoji
  const clickedInsideEmojiPicker = (event.target as Element).closest('.emoji-picker');
  const clickedEmojiButton = (event.target as Element).closest('.action-button[title="Emoji"]');
  
  if (!clickedInsideEmojiPicker && !clickedEmojiButton && this.showEmojiPicker) {
    this.showEmojiPicker = false;
  }
}
}