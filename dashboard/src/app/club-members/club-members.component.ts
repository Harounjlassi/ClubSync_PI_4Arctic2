import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../services/club.service';
import { User } from '../models/user.model';
import { UserService } from 'app/services/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-club-members',
  templateUrl: './club-members.component.html',
  styleUrls: ['./club-members.component.css']
})
export class ClubMembersComponent implements OnInit, AfterViewInit {
  clubId!: number;
  members: User[] = [];
  availableUsers: User[] = [];
  clubName: string ;

  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'actions'];
  displayedColumnsWithActions: string[] = ['firstname', 'lastname', 'email', 'actions'];

  membersDataSource = new MatTableDataSource<User>([]);
  usersDataSource = new MatTableDataSource<User>([]);

  isAdding = false;
  isRemoving = false;
  currentProcessingUserId: number | null = null;

  @ViewChild('membersPaginator') membersPaginator!: MatPaginator;
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute, 
    private clubService: ClubService, 
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.clubId = Number(this.route.snapshot.paramMap.get('clubId'));
    this.loadClubInfo(); // 👈 Ajouté

    this.loadMembers();
    this.loadAvailableUsers();
    document.querySelector('.fixed-plugin')?.remove();
  }
  loadClubInfo(): void {
    this.clubService.getClubById(this.clubId).subscribe(
      (club) => {
        this.clubName = club.name; // ou club.nom selon ton backend
      },
      (error) => {
        console.error('Erreur lors du chargement des infos du club', error);
      }
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.membersDataSource.paginator = this.membersPaginator;
      this.usersDataSource.paginator = this.usersPaginator;
    });
  }

  loadMembers(): void {
    this.clubService.getClubMembers(this.clubId).subscribe(
      (members: User[]) => {
        console.log('Members received:', members); // Debug log
        this.members = members;
        this.membersDataSource = new MatTableDataSource<User>(this.members);
        
        // Vérifiez que les données sont correctement mappées
        if (this.members.length > 0) {
          console.log('First member sample:', this.members[0]);
        }
  
        if (this.membersPaginator) {
          this.membersDataSource.paginator = this.membersPaginator;
        }
      },
      (error) => console.error('Erreur lors du chargement des membres', error)
    );
  }
  

  loadAvailableUsers(): void {
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.clubService.getClubMembers(this.clubId).subscribe((members: User[]) => {
        // Utilisez le même champ ID partout (idUser ou id selon votre modèle)
        const memberIds = members.map(member => member.idUser || member.idUser);
        this.availableUsers = users.filter(user => 
          !memberIds.includes(user.idUser || user.idUser)
        );
        
        this.usersDataSource = new MatTableDataSource<User>(this.availableUsers);
        if (this.usersPaginator) {
          this.usersDataSource.paginator = this.usersPaginator;
        }
      });
    });
  }
  

  addMember(userId: number): void {
    this.clubService.addMemberToClub(this.clubId, userId).subscribe(
      () => {
        this.loadMembers();
        this.loadAvailableUsers();
        this.snackBar.open('New member added successfully', 'Close', {
          duration: 3000
        });
      },
      error => {
        console.error('Erreur lors de l\'ajout du membre', error);
        this.snackBar.open('Erreur lors de l\'ajout du membre', 'Fermer', {
          duration: 3000
        });
      }
    );
  }
  
  removeMember(userId: number): void {
    this.clubService.removeMemberFromClub(this.clubId, userId).subscribe(
      () => {
        this.loadMembers();
        this.loadAvailableUsers();
        this.snackBar.open('Member removed successfully', 'Close', {
          duration: 3000
        });
      },
      error => {
        console.error('Erreur lors de la suppression du membre', error);
        this.snackBar.open('Erreur lors de la suppression du membre', 'Fermer', {
          duration: 3000
        });
      }
    );
  }
  
  applyMembersFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.membersDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  applyUsersFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersDataSource.filter = filterValue.trim().toLowerCase();
  }
   // Méthode d'exportation en PDF
   exportToPDF(): void {
    // Configuration du document PDF
    const doc = new jsPDF();
    
    // Couleurs et styles
    const primaryColor = '#9c27b0'; // Couleur primaire (pour les en-têtes)
    const secondaryColor = '#4a148c'; // Variante plus foncée
    const textColor = '#333333';
    
    // --- En-tête du document ---
    // Bannière d'en-tête
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F'); // Hauteur augmentée pour 3 lignes
    
    // Titre du club et du document - ligne 1
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`MEMBERS OF ${this.clubName.toUpperCase()}`, 14, 14);
    
    // Date et heure d'exportation - ligne 2
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const exportDate = new Date().toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
    const exportTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    // Date placée en haut à droite, sur une ligne séparée
    doc.text(`${exportDate} ${exportTime}`, doc.internal.pageSize.width - 50, 24);
    
    // Sous-titre avec nombre de membres - ligne 3
    doc.setFontSize(11);
    doc.text(`Club ID: ${this.clubId} | Total Members: ${this.members.length}`, 14, 34);
    
    // --- Informations sur le club ---
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Club Information', 14, 52);
    
    // Ligne de séparation
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 54, 196, 54);
    
    // Informations du club
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Club Name: ${this.clubName}`, 14, 62);
    // On pourrait ajouter d'autres informations si disponibles (date de création, description, etc.)
    
    // --- Tableau des membres ---
    // Préparation des données
    const memberRows = this.members.map(member => [
      member.firstname || '-',
      member.lastname || '-',
      member.email || '-',
      // Si vous avez d'autres attributs (rôle, date d'adhésion, etc.), vous pouvez les ajouter ici
    ]);
    
    // Définition des colonnes et en-têtes
    const columns = ['First Name', 'Last Name', 'Email'];
    
    // Options avancées pour le tableau
    autoTable(doc, {
      startY: 70, // Position ajustée
      head: [columns],
      body: memberRows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        lineColor: [220, 220, 220]
      },
      headStyles: {
        fillColor: [156, 39, 176], // Equivalent à primaryColor
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      // Largeurs de colonnes optimisées
      columnStyles: {
        0: { cellWidth: 40 }, // First Name
        1: { cellWidth: 40 }, // Last Name
        2: { cellWidth: 70 }  // Email
      },
      // Fonction pour gérer le pied de page à chaque page
      didDrawPage: (data) => {
        // Numéro de page
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`, 
          data.settings.margin.left, 
          pageHeight - 10
        );
        
        // Copyright/Info
        doc.text(
          `Club Management System © ${new Date().getFullYear()}`, 
          doc.internal.pageSize.width - 70, 
          pageHeight - 10
        );
        
        // Si ce n'est pas la première page, redessiner l'en-tête
        if (data.pageNumber > 1) {
          // Mini en-tête pour les pages suivantes
          doc.setFillColor(primaryColor);
          doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
          
          // Titre - ligne 1
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`${this.clubName} - Members List (continued)`, 14, 10);
          
          // Date - ligne 2, clairement séparée du titre
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`${exportDate} ${exportTime}`, doc.internal.pageSize.width - 50, 20);
        }
      }
    });
    
    // --- Section statistique (après le tableau) ---
    if (doc.lastAutoTable) {
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Vérifier s'il reste assez d'espace pour les statistiques
      if (finalY < doc.internal.pageSize.height - 30) {
        doc.setFontSize(12);
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Members Statistics', 14, finalY);
        
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.5);
        doc.line(14, finalY + 2, 100, finalY + 2);
        
        // Statistiques simples
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.text(`• Total members: ${this.members.length}`, 20, finalY + 10);
        
        // Vous pourriez ajouter d'autres statistiques ici, par exemple:
        // - Répartition hommes/femmes si vous avez le genre
        // - Graphique des rôles si vous avez cette information
        // - Distribution par date d'adhésion
      }
    }
    
    // --- Génération du fichier ---
    // Nom du fichier avec le nom du club et la date
    const sanitizedClubName = this.clubName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const fileName = `members_${sanitizedClubName}_${dateStr}.pdf`;
    
    // Sauvegarde du PDF
    doc.save(fileName);
    
    // Notification de succès
    this.snackBar.open('Members list exported successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}