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
    this.loadMembers();
    this.loadAvailableUsers();
    document.querySelector('.fixed-plugin')?.remove();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.membersDataSource.paginator = this.membersPaginator;
      this.usersDataSource.paginator = this.usersPaginator;
    });
  }

  loadMembers(): void {
    this.clubService.getClubMembers(this.clubId).subscribe(
      (data) => {
        this.members = data;
        this.membersDataSource.data = this.members; // Attribuer les données après les avoir reçues
        
        // Utilisation de setTimeout pour attendre que la pagination soit prête
        setTimeout(() => {
          this.membersDataSource.paginator = this.membersPaginator;
        });
      },
      (error) => console.error('Erreur lors du chargement des membres', error)
    );
  }

  loadAvailableUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.clubService.getClubMembers(this.clubId).subscribe(members => {
        const memberIds = members.map(member => member.id);
        this.availableUsers = users.filter(user => !memberIds.includes(user.id));
  
        // Assigne les données *après* un petit délai pour être sûr que le paginator est prêt
        setTimeout(() => {
          this.usersDataSource.data = this.availableUsers;
          if (this.usersPaginator) {
            this.usersDataSource.paginator = this.usersPaginator;
          }
        });
      });
    });
  }
  

  addMember(userId: number): void {
    this.clubService.addMemberToClub(this.clubId, userId).subscribe(
      () => {
        this.loadMembers();
        this.loadAvailableUsers();
        this.snackBar.open('Membre ajouté avec succès', 'Fermer', {
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
        this.snackBar.open('Membre supprimé avec succès', 'Fermer', {
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
    const doc = new jsPDF();
    doc.text('Liste des Membres du Club', 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Prénom', 'Nom', 'Email']],
      body: this.members.map(member => [
        member.firstname,
        member.lastname,
        member.email
      ]),
      theme: 'striped'
    });

    doc.save(`membres_club_${this.clubId}.pdf`);
  }
}