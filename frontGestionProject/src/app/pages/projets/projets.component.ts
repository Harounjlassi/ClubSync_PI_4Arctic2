import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit {

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }// In your component class
  showModal = false;
  showModalReport = false;

  openModal() {
    this.showModal = true;
    this.showModalReport = true;

    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  closeModal() {
    this.showModal = false;
    this.showModalReport = false;
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  // Close modal when clicking outside content
  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  // Close modal with Escape key
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.showModal) {
      this.closeModal();
    }
  }
 
  

}